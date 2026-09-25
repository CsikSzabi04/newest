import { useState } from 'react'
import { Link } from 'react-router-dom'
import './Header.css'

export default function Header({ children }) {
  const [logoFailed, setLogoFailed] = useState(false)

  return (
    <header className="header">
      <Link to="/" className="brand">
        {logoFailed ? (
          <span className="brand-fallback">PM</span>
        ) : (
          <img
            src="/logo.png"
            alt="Phoenix Mechano"
            className="brand-logo"
            onError={() => setLogoFailed(true)}
          />
        )}
        <span className="brand-text">
          <strong>PHOENIX MECHANO</strong>
          <small>Targoncakezelő</small>
        </span>
      </Link>

      <div className="header-actions">{children}</div>
    </header>
  )
}
