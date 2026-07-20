import React from 'react'
import Button from '../../../components/ui/button/button'
import './UseCameraPage.css'

const UseCameraPage = ({ onNavigate }) => {
  return (
    <section className="use-camera-page">
      <div className="container">
        <div className="upload-section">
          <h2>Use Your Camera</h2>
          <p className="text-center">Take a photo with your device camera</p>
          
          <div className="camera-preview">
            <div className="camera-placeholder">Camera Preview</div>
          </div>
          
          <div className="text-center">
            <Button>Take a Photo</Button>
            <Button 
              variant="outline"
              onClick={() => onNavigate('upload-main')}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default UseCameraPage