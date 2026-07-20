import React from 'react'
import Button from '../../../components/ui/button/button'
import './MainPage.css'

const MainPage = ({ onNavigate }) => {
  return (
    <section className="main-page">
      <div className="container">
        <div className="hero">
          <h1>What is MedLook?</h1>
          <p>MedLook is a big business and offers unique product, retail, mobile, and online products to support the digital market.</p>
          <p>We have made our own work with customers, signs of fatigue, stress, inflammation, increased durability.</p>
          <Button 
            variant="primary"
            onClick={() => onNavigate('upload-main')}
          >
            Upload Your Photo
          </Button>
        </div>
        
        <div className="content-section">
          <h2>Our Mission</h2>
          <p>Our company's global brands are linked to different kinds of online products that can help us achieve better quality.</p>
          <p>About your marketing team – helping you meet personalized needs.</p>
        </div>
      </div>
    </section>
  )
}

export default MainPage