import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { encryptStudentId } from '../lib/encryption'

export default function GenerateQR() {
  const [studentId, setStudentId] = useState('')
  const [encryptedData, setEncryptedData] = useState('')

  const handleGenerate = () => {
    if (studentId.trim()) {
      const encrypted = encryptStudentId(studentId.trim())
      setEncryptedData(encrypted)
    }
  }

  const handleDownload = () => {
    const svg = document.querySelector('#qr-code-svg')
    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)
      const a = document.createElement('a')
      a.download = `QR_${studentId}.png`
      a.href = canvas.toDataURL('image/png')
      a.click()
    }
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
  }

  return (
    <div style={{ 
      background: 'white',
      borderRadius: '20px',
      padding: '30px 20px',
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
      textAlign: 'center',
      maxWidth: '500px',
      margin: '0 auto'
    }}>
      <h2 style={{ 
        color: '#1e3c72',
        marginBottom: '20px',
        fontSize: 'clamp(1.3rem, 4vw, 1.8rem)'
      }}>
        🎫 Generate QR Code
      </h2>
      
      <input
        type="text"
        placeholder="Enter Student ID (e.g., 2024-001)"
        value={studentId}
        onChange={(e) => setStudentId(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleGenerate()}
        style={{ 
          padding: '15px',
          fontSize: '16px',
          marginBottom: '15px',
          width: '100%',
          maxWidth: '350px',
          border: '2px solid #e0e0e0',
          borderRadius: '12px',
          outline: 'none',
          transition: 'border 0.3s ease'
        }}
        onFocus={(e) => e.target.style.borderColor = '#1e3c72'}
        onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
      />

      <button
        onClick={handleGenerate}
        disabled={!studentId.trim()}
        style={{
          padding: '12px 30px',
          background: studentId.trim() ? '#1e3c72' : '#ccc',
          color: 'white',
          border: 'none',
          borderRadius: '25px',
          fontSize: '16px',
          fontWeight: '600',
          cursor: studentId.trim() ? 'pointer' : 'not-allowed',
          boxShadow: studentId.trim() ? '0 4px 15px rgba(30, 60, 114, 0.4)' : 'none',
          marginBottom: '20px'
        }}
      >
        🔐 Generate Encrypted QR
      </button>
      
      {encryptedData && (
        <div style={{ 
          marginTop: '30px',
          padding: '20px',
          background: '#f8f9fa',
          borderRadius: '15px'
        }}>
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '12px',
            display: 'inline-block',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
          }}>
            <QRCodeSVG 
              id="qr-code-svg"
              value={encryptedData}
              size={Math.min(256, window.innerWidth - 120)}
              level="M"
            />
          </div>
          <p style={{ 
            marginTop: '15px',
            fontSize: '18px',
            fontWeight: '600',
            color: '#333'
          }}>
            Student ID: {studentId}
          </p>
          <p style={{ 
            marginTop: '5px',
            fontSize: '12px',
            color: '#999'
          }}>
            🔒 Encrypted & Secure
          </p>
          <button
            onClick={handleDownload}
            style={{
              marginTop: '15px',
              padding: '12px 30px',
              background: '#1e3c72',
              color: 'white',
              border: 'none',
              borderRadius: '25px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(30, 60, 114, 0.4)'
            }}
          >
            💾 Download QR
          </button>
        </div>
      )}
    </div>
  )
}
