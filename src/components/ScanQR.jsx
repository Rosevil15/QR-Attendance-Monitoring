import { useState, useEffect } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { supabase } from '../lib/supabase'
import { decryptStudentId, isQRValid } from '../lib/encryption'

export default function ScanQR() {
  const [result, setResult] = useState('')
  const [message, setMessage] = useState('')
  const [scanning, setScanning] = useState(true)
  const [cameraError, setCameraError] = useState(false)

  useEffect(() => {
    let scanner = null

    const initScanner = async () => {
      try {
        // Check if camera is available
        const devices = await navigator.mediaDevices.enumerateDevices()
        const videoDevices = devices.filter(device => device.kind === 'videoinput')
        
        if (videoDevices.length === 0) {
          setCameraError(true)
          setMessage('❌ No camera found on this device')
          return
        }

        scanner = new Html5QrcodeScanner('reader', {
          qrbox: { width: 250, height: 250 },
          fps: 5,
          aspectRatio: 1.0,
          showTorchButtonIfSupported: true,
          showZoomSliderIfSupported: true
        })

        const onScanSuccess = async (decodedText) => {
          setScanning(false)
          scanner.clear()

          try {
            // Decrypt the QR code data
            const { studentId, timestamp } = decryptStudentId(decodedText)
            
            // Validate QR code expiry (optional - set to false to disable)
            if (timestamp && !isQRValid(timestamp, 24)) {
              setMessage('❌ QR Code has expired. Please generate a new one.')
              setResult('')
              return
            }

            setResult(studentId)

            // Submit attendance to Supabase
            const { error } = await supabase
              .from('attendance')
              .insert({
                student_id: studentId,
                datetime: new Date().toISOString(),
                status: 'Present'
              })

            if (error) {
              // Check if it's a duplicate entry error
              if (error.message.includes('already recorded')) {
                setMessage(`⚠️ Attendance already recorded for ${studentId} today`)
              } else {
                setMessage(`❌ Error: ${error.message}`)
              }
            } else {
              setMessage(`✅ Attendance recorded successfully!`)
            }
          } catch (error) {
            console.error('Scan error:', error)
            setMessage('❌ Invalid QR code. Please try again.')
            setResult('')
          }
        }

        const onScanError = (error) => {
          // Ignore common scanning errors (not found, etc)
          if (error.includes('NotFoundException')) {
            return
          }
          console.warn('Scan error:', error)
        }

        scanner.render(onScanSuccess, onScanError)
      } catch (error) {
        console.error('Camera initialization error:', error)
        setCameraError(true)
        if (error.name === 'NotAllowedError') {
          setMessage('❌ Camera permission denied. Please allow camera access.')
        } else if (error.name === 'NotFoundError') {
          setMessage('❌ No camera found. Please connect a camera.')
        } else {
          setMessage('❌ Camera error: ' + error.message)
        }
      }
    }

    initScanner()

    return () => {
      if (scanner) {
        scanner.clear().catch(err => console.error(err))
      }
    }
  }, [])

  const resetScanner = () => {
    setResult('')
    setMessage('')
    setScanning(true)
    setCameraError(false)
    window.location.reload()
  }

  return (
    <div style={{ 
      background: 'white',
      borderRadius: '20px',
      padding: '30px 20px',
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
      textAlign: 'center',
      maxWidth: '600px',
      margin: '0 auto'
    }}>
      <h2 style={{ 
        color: '#1e3c72',
        marginBottom: '20px',
        fontSize: 'clamp(1.3rem, 4vw, 1.8rem)'
      }}>
        📷 Scan QR Code
      </h2>

      {cameraError ? (
        <div style={{
          padding: '40px 20px',
          background: '#fff3cd',
          borderRadius: '15px',
          marginBottom: '20px'
        }}>
          <div style={{ fontSize: '60px', marginBottom: '15px' }}>📹</div>
          <p style={{ fontSize: '16px', color: '#856404', marginBottom: '15px' }}>
            Camera access is required to scan QR codes
          </p>
          <div style={{ 
            textAlign: 'left',
            background: 'white',
            padding: '15px',
            borderRadius: '10px',
            fontSize: '14px',
            color: '#666'
          }}>
            <p style={{ marginBottom: '10px', fontWeight: '600' }}>Troubleshooting:</p>
            <ul style={{ paddingLeft: '20px', lineHeight: '1.8' }}>
              <li>Make sure your device has a camera</li>
              <li>Allow camera permissions in your browser</li>
              <li>Check if another app is using the camera</li>
              <li>Try refreshing the page</li>
              <li>Use HTTPS (required for camera access)</li>
            </ul>
          </div>
          <button
            onClick={resetScanner}
            style={{
              marginTop: '20px',
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
            🔄 Try Again
          </button>
        </div>
      ) : (
        <div 
          id="reader" 
          style={{ 
            maxWidth: '100%',
            margin: '20px auto',
            borderRadius: '15px',
            overflow: 'hidden'
          }}
        ></div>
      )}

      {result && (
        <div style={{ 
          marginTop: '20px',
          padding: '20px',
          background: '#f8f9fa',
          borderRadius: '15px'
        }}>
          <p style={{ 
            fontSize: '16px',
            color: '#666',
            marginBottom: '8px'
          }}>
            Scanned Student ID
          </p>
          <p style={{ 
            fontSize: '24px',
            fontWeight: '700',
            color: '#1e3c72',
            marginBottom: '15px'
          }}>
            {result}
          </p>
        </div>
      )}

      {message && (
        <div style={{ 
          marginTop: '20px', 
          padding: '15px 20px',
          backgroundColor: message.includes('Error') || message.includes('expired') || message.includes('Invalid') 
            ? '#fee' 
            : message.includes('already') 
            ? '#fff3cd' 
            : '#e8f5e9',
          color: message.includes('Error') || message.includes('expired') || message.includes('Invalid')
            ? '#c62828' 
            : message.includes('already')
            ? '#856404'
            : '#2e7d32',
          borderRadius: '12px',
          fontSize: '16px',
          fontWeight: '600',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
        }}>
          {message}
        </div>
      )}

      {!scanning && !cameraError && (
        <button
          onClick={resetScanner}
          style={{
            marginTop: '20px',
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
          🔄 Scan Another
        </button>
      )}
    </div>
  )
}
