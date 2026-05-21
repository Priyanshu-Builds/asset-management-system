import avatar1 from './avatar1.png';
import avatar2 from './avatar2.png';
import avatar3 from './avatar3.png';
import avatar4 from './avatar4.png';
import avatar5 from './avatar5.png';
import avatar6 from './avatar6.png';
import avatar7 from './avatar7.png';
import avatar8 from './avatar8.png';

const avatars = [avatar1, avatar2, avatar3, avatar4, avatar5, avatar6, avatar7, avatar8];

/**
 * Returns a deterministic avatar based on name hash.
 * Fallback when no avatar is stored in the database.
 */
export function getAvatar(name = 'User') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % avatars.length;
  return avatars[index];
}

/**
 * Returns avatar by stored index from backend, or falls back to hash-based.
 * Use this for ALL avatar displays — it checks if the user has a stored
 * avatar field from the database first.
 */
export function getAvatarByData(avatarField, name = 'User') {
  if (avatarField !== undefined && avatarField !== null && avatarField !== '') {
    const idx = parseInt(avatarField, 10);
    if (!isNaN(idx) && idx >= 0 && idx < avatars.length) return avatars[idx];
  }
  return getAvatar(name);
}

/**
 * Returns the current logged-in user's avatar.
 * Checks localStorage for immediate display, falls back to hash.
 */
export function getMyAvatar(userId, name = 'User') {
  try {
    const saved = localStorage.getItem(`assetvault-avatar-${userId}`);
    if (saved !== null) {
      const idx = parseInt(saved, 10);
      if (idx >= 0 && idx < avatars.length) return avatars[idx];
    }
  } catch {}
  return getAvatar(name);
}

/**
 * Save a specific avatar index for a given user (localStorage for instant display)
 */
export function setUserAvatar(userId, index) {
  localStorage.setItem(`assetvault-avatar-${userId}`, String(index));
}

/**
 * Get the currently saved avatar index for a given user, or null
 */
export function getUserAvatarIndex(userId) {
  try {
    const saved = localStorage.getItem(`assetvault-avatar-${userId}`);
    if (saved !== null) return parseInt(saved, 10);
  } catch {}
  return null;
}

export { avatars };
export default getAvatar;
