import { useState } from 'react'

export default function AdminLogin({ onLogin }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleLogin = (e) => {
    e.preventDefault()
    const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123'
    
    if (password === adminPassword) {
      onLogin()
      setError('')
    } else {
      setError('❌ Incorrect password')
      setPassword('')
    }
  }

  return (
    <div style={{ 
      background: 'white',
      borderRadius: '20px',
      padding: '40px 30px',
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
      textAlign: 'center',
      maxWidth: '400px',
      margin: '0 auto'
    }}>
      <div style={{ fontSize: '60px', marginBottom: '20px' }}>🔐</div>
      <h2 style={{ 
        color: '#667eea',
        marginBottom: '10px',
        fontSize: 'clamp(1.3rem, 4vw, 1.8rem)'
      }}>
        Admin Access
      </h2>
      <p style={{ color: '#999', marginBottom: '30px' }}>
        Enter admin password to continue
      </p>
      
      <form onSubmit={handleLogin}>
        <input
          type="password"
          placeholder="Enter admin password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ 
            padding: '15px',
            fontSize: '16px',
            marginBottom: '20px',
            width: '100%',
            border: '2px solid #e0e0e0',
            borderRadius: '12px',
            outline: 'none',
            transition: 'border 0.3s ease'
          }}
          onFocus={(e) => e.target.style.borderColor = '#667eea'}
          onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
          autoFocus
        />
        
        {error && (
          <div style={{ 
            marginBottom: '20px',
            padding: '12px',
            backgroundColor: '#fee',
            color: '#c62828',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: '600'
          }}>
            {error}
          </div>
        )}
        
        <button
          type="submit"
          disabled={!password}
          style={{
            padding: '15px 40px',
            background: password ? '#667eea' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '25px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: password ? 'pointer' : 'not-allowed',
            boxShadow: password ? '0 4px 15px rgba(102, 126, 234, 0.4)' : 'none',
            width: '100%'
          }}
        >
          🔓 Login
        </button>
      </form>
      
      <p style={{ 
        marginTop: '20px',
        fontSize: '12px',
        color: '#999'
      }}>
        Default password: admin123
      </p>
    </div>
  )
}
