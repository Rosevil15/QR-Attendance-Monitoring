import CryptoJS from 'crypto-js'

// Encryption key - In production, store this securely in environment variables
const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'your-secret-key-change-this'

/**
 * Encrypt student ID for QR code using Base64 encoding
 * @param {string} studentId - The student ID to encrypt
 * @returns {string} - Encrypted string in compact format
 */
export const encryptStudentId = (studentId) => {
  try {
    const timestamp = Date.now()
    // Create a compact format: studentId|timestamp
    const data = `${studentId}|${timestamp}`
    
    // Use simple XOR encryption with Base64 for compact QR codes
    const encrypted = CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString()
    
    // Convert to URL-safe Base64
    const urlSafe = encrypted
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')
    
    return urlSafe
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
    // Convert from URL-safe Base64 back to standard Base64
    let base64 = encryptedData
      .replace(/-/g, '+')
      .replace(/_/g, '/')
    
    // Add padding if needed
    while (base64.length % 4) {
      base64 += '='
    }
    
    const decrypted = CryptoJS.AES.decrypt(base64, ENCRYPTION_KEY)
    const decryptedString = decrypted.toString(CryptoJS.enc.Utf8)
    
    if (!decryptedString) {
      throw new Error('Decryption failed')
    }
    
    // Parse the compact format: studentId|timestamp
    const [studentId, timestamp] = decryptedString.split('|')
    
    return {
      studentId,
      timestamp: timestamp ? parseInt(timestamp) : null
    }
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
