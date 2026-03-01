import { useState, useEffect } from 'react'
import GenerateQR from './components/GenerateQR'
import ScanQR from './components/ScanQR'
import AdminDashboard from './components/AdminDashboard'
import AdminLogin from './components/AdminLogin'

function App() {
  const [mode, setMode] = useState('scan')
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false)

  // Check if admin is already logged in (session storage)
  useEffect(() => {
    const adminSession = sessionStorage.getItem('adminAuthenticated')
    if (adminSession === 'true') {
      setIsAdminAuthenticated(true)
    }
  }, [])

  const handleAdminLogin = () => {
    setIsAdminAuthenticated(true)
    sessionStorage.setItem('adminAuthenticated', 'true')
  }

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false)
    sessionStorage.removeItem('adminAuthenticated')
    setMode('scan')
  }

  const handleModeChange = (newMode) => {
    if (newMode === 'admin' && !isAdminAuthenticated) {
      // Will show login screen
      setMode(newMode)
    } else {
      setMode(newMode)
    }
  }

  const buttonStyle = (isActive) => ({
    padding: '12px 20px',
    margin: '5px',
    fontSize: '14px',
    fontWeight: '600',
    backgroundColor: isActive ? 'white' : 'rgba(255, 255, 255, 0.2)',
    color: isActive ? '#1e3c72' : 'white',
    border: 'none',
    borderRadius: '25px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: isActive ? '0 4px 15px rgba(0, 0, 0, 0.2)' : 'none',
    minWidth: '120px'
  })

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '20px' }}>
      <header style={{ 
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        color: 'white', 
        padding: '20px',
        textAlign: 'center',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
      }}>
        <h1 style={{ 
          fontSize: 'clamp(1.5rem, 5vw, 2.5rem)',
          fontWeight: '700',
          marginBottom: '15px'
        }}>
          📱 QR Attendance
        </h1>
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          justifyContent: 'center',
          gap: '5px',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          <button onClick={() => handleModeChange('scan')} style={buttonStyle(mode === 'scan')}>
            📷 Scan
          </button>
          <button onClick={() => handleModeChange('generate')} style={buttonStyle(mode === 'generate')}>
            🎫 Generate
          </button>
          <button onClick={() => handleModeChange('admin')} style={buttonStyle(mode === 'admin')}>
            📊 Dashboard
          </button>
          {isAdminAuthenticated && mode === 'admin' && (
            <button 
              onClick={handleAdminLogout}
              style={{
                padding: '12px 20px',
                margin: '5px',
                fontSize: '14px',
                fontWeight: '600',
                backgroundColor: 'rgba(255, 82, 82, 0.9)',
                color: 'white',
                border: 'none',
                borderRadius: '25px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                minWidth: '120px'
              }}
            >
              🚪 Logout
            </button>
          )}
        </div>
      </header>

      <main style={{ 
        maxWidth: '1200px', 
        margin: '20px auto',
        padding: '0 15px'
      }}>
        {mode === 'scan' && <ScanQR />}
        {mode === 'generate' && <GenerateQR />}
        {mode === 'admin' && (
          isAdminAuthenticated ? (
            <AdminDashboard />
          ) : (
            <AdminLogin onLogin={handleAdminLogin} />
          )
        )}
      </main>
    </div>
  )
}

export default App
