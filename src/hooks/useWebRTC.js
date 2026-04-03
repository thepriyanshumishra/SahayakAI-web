import { useRef, useState, useCallback, useEffect } from 'react'
import { uploadCallAudio } from '../services/storageService.js'
import { saveCallMetadata } from '../services/notificationService.js'
import { db } from '../config/firebase.js'
import { collection, doc, setDoc, addDoc, onSnapshot, getDoc, updateDoc } from 'firebase/firestore'

const servers = {
  iceServers: [
    { urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'] }
  ],
  iceCandidatePoolSize: 10,
}

export function useWebRTC({ callId, localUserId, localRole }) {
  const localStreamRef = useRef(null)
  const remoteStreamRef = useRef(null)
  const pcRef = useRef(null)
  const recorderRef = useRef(null)
  const chunksRef = useRef([])
  const callStartTimeRef = useRef(null)

  const [micPermission, setMicPermission] = useState('unknown')
  const [callActive, setCallActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const [remoteStream, setRemoteStream] = useState(null) // Passed down to audio tag

  const checkMicPermission = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach((t) => t.stop())
      setMicPermission('granted')
      return 'granted'
    } catch {
      setMicPermission('denied')
      return 'denied'
    }
  }, [])

  const setupWebRTC = async () => {
    pcRef.current = new RTCPeerConnection(servers)

    // Setup Local Stream
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    localStreamRef.current = stream
    stream.getTracks().forEach((track) => pcRef.current.addTrack(track, stream))

    // Setup Remote Stream
    const remote = new MediaStream()
    remoteStreamRef.current = remote
    
    pcRef.current.ontrack = (event) => {
      event.streams[0].getTracks().forEach((track) => {
        remote.addTrack(track)
      })
      setRemoteStream(remote)
    }

    // Start Recording Local Mic
    startRecording(stream)
  }

  const startRecording = (stream) => {
    const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
      ? 'audio/webm;codecs=opus'
      : 'audio/webm'

    const recorder = new MediaRecorder(stream, { mimeType })
    chunksRef.current = []
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data)
    }
    recorder.start(1000)
    recorderRef.current = recorder
  }

  const startCall = useCallback(async () => {
    setError(null)
    try {
      await setupWebRTC()
      const pc = pcRef.current
      callStartTimeRef.current = Date.now()
      
      const callDoc = doc(db, 'calls', callId)
      const offerCandidates = collection(callDoc, 'offerCandidates')
      const answerCandidates = collection(callDoc, 'answerCandidates')

      if (localRole === 'ngo') {
        // NGO creates OFFER
        pc.onicecandidate = (event) => {
          if (event.candidate) addDoc(offerCandidates, event.candidate.toJSON())
        }

        const offerDescription = await pc.createOffer()
        await pc.setLocalDescription(offerDescription)

        const offer = { sdpx: offerDescription.sdp, type: offerDescription.type }
        await setDoc(callDoc, { offer }, { merge: true })

        // Listen for ANSWER
        onSnapshot(callDoc, (snapshot) => {
          const data = snapshot.data()
          if (!pc.currentRemoteDescription && data?.answer) {
            const answerDescription = new RTCSessionDescription(data.answer)
            pc.setRemoteDescription(answerDescription)
          }
        })

        // Listen for remote ICE
        onSnapshot(answerCandidates, (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
              const candidate = new RTCIceCandidate(change.doc.data())
              pc.addIceCandidate(candidate)
            }
          })
        })

      } else {
        // Volunteer creates ANSWER
        pc.onicecandidate = (event) => {
          if (event.candidate) addDoc(answerCandidates, event.candidate.toJSON())
        }

        const callData = (await getDoc(callDoc)).data()
        if (!callData?.offer) {
          setError("Call has not been initiated by NGO yet.")
          return
        }

        const offerDescription = callData.offer
        await pc.setRemoteDescription(new RTCSessionDescription({ type: offerDescription.type, sdp: offerDescription.sdpx }))

        const answerDescription = await pc.createAnswer()
        await pc.setLocalDescription(answerDescription)
        
        await updateDoc(callDoc, { answer: { type: answerDescription.type, sdp: answerDescription.sdp } })

        onSnapshot(offerCandidates, (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
              const candidate = new RTCIceCandidate(change.doc.data())
              pc.addIceCandidate(candidate)
            }
          })
        })
      }

      setCallActive(true)
    } catch (e) {
      console.error(e)
      setError('Could not establish secure call: ' + e.message)
    }
  }, [callId, localRole])

  const endCall = useCallback(async () => {
    setCallActive(false)

    if (pcRef.current) {
      pcRef.current.close()
      pcRef.current = null
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop())
      localStreamRef.current = null
    }

    if (!recorderRef.current) return

    const duration = callStartTimeRef.current
      ? Math.round((Date.now() - callStartTimeRef.current) / 1000)
      : 0

    return new Promise((resolve) => {
      recorderRef.current.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        chunksRef.current = []

        if (!callId || blob.size === 0) {
          resolve(null)
          return
        }

        setUploading(true)
        try {
          const audioUrl = await uploadCallAudio(callId, localRole, blob)

          await saveCallMetadata({
            callId,
            [localRole === 'ngo' ? 'ngoAudioUrl' : 'volunteerAudioUrl']: audioUrl,
            [`${localRole}StartTime`]: callStartTimeRef.current,
            duration,
          })
          resolve(audioUrl)
        } catch (e) {
          console.error('Failed to upload call audio:', e)
          resolve(null)
        } finally {
          setUploading(false)
        }
      }

      recorderRef.current.stop()
      recorderRef.current = null
    })
  }, [callId, localRole])

  return {
    micPermission,
    callActive,
    uploading,
    error,
    remoteStream,
    checkMicPermission,
    startCall,
    endCall,
  }
}
