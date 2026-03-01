import CryptoJS from 'crypto-js'

// Encryption key - In production, store this securely in environment variables
const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'your-secret-key-change-this'

/**
 * Encrypt student ID for QR code
 * @param {string} studentId - The student ID to encrypt
 * @returns {string} - Encrypted string
 */
export const encryptStudentId = (studentId) => {
  try {
    const timestamp = Date.now()
    const data = JSON.stringify({ studentId, timestamp })
    const encrypted = CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString()
    return encrypted
  } catch (error) {
    console.error('Encryption error:', error)
    return studentId
  }
}

/**
 * Decrypt QR code data to get student ID
 * @param {string} encryptedData - The encrypted data from QR code
 * @returns {object} - Object with studentId and timestamp
 */
export const decryptStudentId = (encryptedData) => {
  try {
    const decrypted = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY)
    const decryptedString = decrypted.toString(CryptoJS.enc.Utf8)
    const data = JSON.parse(decryptedString)
    return data
  } catch (error) {
    console.error('Decryption error:', error)
    // Fallback: treat as plain student ID for backward compatibility
    return { studentId: encryptedData, timestamp: null }
  }
}

/**
 * Validate if QR code is not expired (optional security feature)
 * @param {number} timestamp - Timestamp from QR code
 * @param {number} expiryHours - Hours until QR expires (default: 24)
 * @returns {boolean} - True if valid, false if expired
 */
export const isQRValid = (timestamp, expiryHours = 24) => {
  if (!timestamp) return true // No timestamp means no expiry
  const now = Date.now()
  const expiryTime = expiryHours * 60 * 60 * 1000
  return (now - timestamp) < expiryTime
}
