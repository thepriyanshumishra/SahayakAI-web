/**
 * Helper to upload a file/blob to Cloudinary
 * @param {File|Blob} file 
 * @param {string} folder 
 * @returns {Promise<string>} secure_url
 */
async function uploadToCloudinary(file, folder) {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary configuration is missing in .env')
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', uploadPreset)
  formData.append('folder', `sahayak/${folder}`)

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/upload`,
    {
      method: 'POST',
      body: formData,
    }
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Cloudinary upload failed: ${error.error?.message || 'Unknown error'}`)
  }

  const data = await response.json()
  return data.secure_url
}

/**
 * Upload a call audio recording
 */
export async function uploadCallAudio(callId, role, audioBlob) {
  return uploadToCloudinary(audioBlob, `calls/${callId}`)
}

/**
 * Upload task completion photo
 */
export async function uploadCompletionPhoto(taskId, volunteerId, file) {
  return uploadToCloudinary(file, `completions/${taskId}`)
}

/**
 * Upload NGO verification document
 */
export async function uploadNGODoc(uid, file) {
  return uploadToCloudinary(file, `ngo_docs/${uid}`)
}
