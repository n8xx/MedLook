import React from 'react'
import './Header.css'

const Header = ({ currentPage, onNavigate }) => {
  const navItems = [
    { id: 'main', label: 'Home' },
    { id: 'about', label: 'About MedLook' },
    { id: 'security', label: 'Security and Data' },
    { id: 'upload-main', label: 'Upload Your Photo' }
  ]

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="logo">
            <span>⚕️</span>
            MedLook
          </div>
          <nav>
            <ul>
              {navItems.map(item => (
                <li key={item.id}>
                  <button
                    className={`nav-link ${currentPage === item.id ? 'active' : ''}`}
                    onClick={() => onNavigate(item.id)}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header