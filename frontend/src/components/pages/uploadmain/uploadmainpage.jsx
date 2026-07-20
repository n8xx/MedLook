import React from 'react'
import Button from '../../../components/ui/button/button'
import './UploadMainPage.css'

const UploadMainPage = ({ onNavigate }) => {
  return (
    <section className="upload-main-page">
      <div className="container">
        <div className="upload-section">
          <h2>Upload Your Photo</h2>
          <p className="text-center">View a phone with instructions</p>
          
          <div className="upload-options">
            <div className="upload-option">
              <div className="option-icon">📁</div>
              <h3>Upload Image</h3>
              <p>Choose any photos from your phone</p>
              <Button 
                onClick={() => onNavigate('upload-image')}
              >
                Upload Image
              </Button>
            </div>
            <div className="upload-option">
              <div className="option-icon">📷</div>
              <h3>Use Camera</h3>
              <p>Take a photo with your device camera</p>
              <Button 
                onClick={() => onNavigate('use-camera')}
              >
                Use Camera
              </Button>
            </div>
          </div>
          
          <div className="text-center" style={{ marginTop: '40px' }}>
            <Button 
              variant="outline"
              onClick={() => onNavigate('main')}
            >
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default UploadMainPage