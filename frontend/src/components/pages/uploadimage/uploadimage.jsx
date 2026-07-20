import React, { useState } from 'react'
import Button from '../../../components/ui/button/button'
import './UploadImagePage.css'

const UploadImagePage = ({ onNavigate }) => {
  const [selectedFile, setSelectedFile] = useState(null)

  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleDrop = (event) => {
    event.preventDefault()
    const file = event.dataTransfer.files[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleDragOver = (event) => {
    event.preventDefault()
  }

  return (
    <section className="upload-image-page">
      <div className="container">
        <div className="upload-section">
          <h2>Upload Your Image</h2>
          <p className="text-center">Choose any photos from your phone</p>
          
          <div 
            className="upload-area"
            onClick={() => document.getElementById('file-input').click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            {selectedFile ? (
              <>
                <div className="upload-icon">✅</div>
                <p>Selected file: {selectedFile.name}</p>
                <p>Click to change file</p>
              </>
            ) : (
              <>
                <div className="upload-icon">📁</div>
                <p>Drag & Drop your image here or click to browse</p>
              </>
            )}
            <input 
              type="file" 
              id="file-input" 
              accept="image/*" 
              className="hidden" 
              onChange={handleFileSelect}
            />
          </div>
          
          <div className="text-center">
            <Button>Analyze Photo</Button>
            <Button variant="secondary">Reduce Photo</Button>
            <Button 
              variant="outline"
              onClick={() => onNavigate('upload-main')}
            >
              Back
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default UploadImagePage