import React from 'react'
import Button from '../../../components/ui/button/button'
import './SecurityPage.css'

const SecurityPage = ({ onNavigate }) => {
  return (
    <section className="security-page">
      <div className="container">
        <div className="content-section">
          <h2>Security and Data</h2>
          <p>We have built an open space for our artificial intelligence workflow program per personprint. Every image is provided by us on our web program and we have access to other personal computers.</p>
          <p>Our new proprietary software has been developed to help us create a personalized experience that supports your ability to navigate to your unique worlds.</p>
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

export default SecurityPage