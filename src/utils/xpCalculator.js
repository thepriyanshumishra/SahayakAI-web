/**
 * XP Calculation System
 * Based on: distance travelled, task priority, task type
 */

const BASE_XP = {
  low: 10,
  medium: 25,
  high: 50,
  emergency: 100,
}

const DISTANCE_MULTIPLIER = 2     // XP per km
const REMOTE_BONUS = 5

/**
 * Calculate XP for a completed task
 * @param {string} priority - 'high' | 'medium' | 'low'
 * @param {boolean} isRemote
 * @param {number} distanceKm - distance travelled (0 for remote)
 * @param {boolean} isEmergency
 * @returns {number} xp earned
 */
export function calculateXP({ priority = 'medium', isRemote = false, distanceKm = 0, isEmergency = false }) {
  const base = isEmergency ? BASE_XP.emergency : (BASE_XP[priority] || BASE_XP.medium)
  const distanceXP = isRemote ? REMOTE_BONUS : Math.round(distanceKm * DISTANCE_MULTIPLIER)
  return base + distanceXP
}

/**
 * Calculate volunteer level from total XP
 */
export function getLevel(totalXP) {
  if (totalXP < 100) return 1
  if (totalXP < 300) return 2
  if (totalXP < 600) return 3
  if (totalXP < 1000) return 4
  if (totalXP < 1500) return 5
  if (totalXP < 2500) return 6
  if (totalXP < 4000) return 7
  if (totalXP < 6000) return 8
  if (totalXP < 9000) return 9
  return 10
}

/**
 * XP needed for next level
 */
const LEVEL_THRESHOLDS = [0, 100, 300, 600, 1000, 1500, 2500, 4000, 6000, 9000, Infinity]
export function xpForNextLevel(totalXP) {
  const level = getLevel(totalXP)
  return LEVEL_THRESHOLDS[level] - totalXP
}

export function xpProgressPercent(totalXP) {
  const level = getLevel(totalXP)
  const current = LEVEL_THRESHOLDS[level - 1]
  const next = LEVEL_THRESHOLDS[level]
  return Math.round(((totalXP - current) / (next - current)) * 100)
}

export const LEVEL_NAMES = [
  '', 'Initiate', 'Operator', 'Coordinator', 'Specialist',
  'Elite', 'Champion', 'Legend', 'Master', 'Guardian', 'Nexus Guardian'
]

/**
 * Badge definitions
 */
export const BADGES = {
  FIRST_TASK: { id: 'first_task', name: 'First Steps', emoji: '🌱', desc: 'Completed your first task' },
  FIVE_TASKS: { id: 'five_tasks', name: 'Helper', emoji: '🤝', desc: 'Completed 5 tasks' },
  TEN_TASKS: { id: 'ten_tasks', name: 'Dedicated', emoji: '⭐', desc: 'Completed 10 tasks' },
  EMERGENCY_HERO: { id: 'emergency_hero', name: 'Emergency Hero', emoji: '🚨', desc: 'Responded to an emergency' },
  MARATHON: { id: 'marathon', name: 'Marathon Runner', emoji: '🏃', desc: 'Travelled 50km+ for tasks' },
  PERFECT_SCORE: { id: 'perfect_score', name: 'Excellence', emoji: '🏆', desc: 'Maintained 5-star rating' },
}

export function checkBadges(stats) {
  const earned = []
  if (stats.totalTasks >= 1) earned.push(BADGES.FIRST_TASK.id)
  if (stats.totalTasks >= 5) earned.push(BADGES.FIVE_TASKS.id)
  if (stats.totalTasks >= 10) earned.push(BADGES.TEN_TASKS.id)
  if (stats.emergencyTasks >= 1) earned.push(BADGES.EMERGENCY_HERO.id)
  if (stats.totalDistanceKm >= 50) earned.push(BADGES.MARATHON.id)
  if (stats.rating >= 4.9) earned.push(BADGES.PERFECT_SCORE.id)
  return earned
}
