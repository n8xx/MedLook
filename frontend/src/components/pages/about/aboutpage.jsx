import React from 'react'
import Button from '../../../components/ui/button/button'
import './AboutPage.css'

const AboutPage = ({ onNavigate }) => {
  return (
    <section className="about-page">
      <div className="container">
        <div className="content-section">
          <h2>About MedLook</h2>
          <p>As MedLook was familiar than early detection teams like CVx, multiple-edge technology professionals will feel comfortable in a sudden switch and playback between them more photos. Most likely a potential sign of illness and arthritis (particularly health) recommendations.</p>
          
          <h3>You use:</h3>
          <ul className="feature-list">
            <li>We use a product which helps us establish transparent through the power of AI.</li>
            <li>The design tools become very advanced technology to deliver practical results into our goals and ensure better visibility.</li>
            <li>To deliver first, second, and personalized health recommendations – among which we provide.</li>
          </ul>
        </div>
        
        <div className="text-center">
          <Button 
            variant="outline"
            onClick={() => onNavigate('main')}
          >
            Back to Home
          </Button>
        </div>
      </div>
    </section>
  )
}

export default AboutPage