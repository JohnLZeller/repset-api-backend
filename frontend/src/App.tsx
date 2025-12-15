import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [apiStatus, setApiStatus] = useState<string>('Checking...')

  useEffect(() => {
    // Test connection to backend API
    fetch('/api/auth/csrf/')
      .then((response) => {
        if (response.ok) {
          setApiStatus('Connected')
        } else {
          setApiStatus('Error: ' + response.status)
        }
      })
      .catch(() => {
        setApiStatus('Not connected')
      })
  }, [])

  return (
    <div className="app">
      <header className="app-header">
        <h1>Repset</h1>
        <p>Frontend + Backend Docker Setup</p>
      </header>
      <main className="app-main">
        <div className="status-card">
          <h2>Backend API Status</h2>
          <p className={`status ${apiStatus === 'Connected' ? 'connected' : 'disconnected'}`}>
            {apiStatus}
          </p>
        </div>
        <div className="info-card">
          <h2>Getting Started</h2>
          <ul>
            <li>Frontend: <code>http://localhost:5173</code></li>
            <li>Backend API: <code>http://localhost:8000</code></li>
            <li>Admin: <code>http://localhost:8000/admin</code></li>
          </ul>
        </div>
      </main>
    </div>
  )
}

export default App
