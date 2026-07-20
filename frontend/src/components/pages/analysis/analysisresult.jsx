import React from 'react';
import './analysisresult.css';

const AnalysisResults = ({ analysisData }) => {
  const {
    image,
    diagnosis,
    confidence,
    description,
    symptoms = [],
    recommendations = [],
    location = { lat: 53.9, lng: 27.5 }
  } = analysisData || {};

  return (
    <section style={{ 
      padding: '60px 0', 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div className="analysis-results">
        <div className="analysis-header">
          <h1>Analysis Results</h1>
          <p className="analysis-subtitle">AI-powered health diagnostics</p>
        </div>

        <div className="analysis-content">
          <div className="left-column">
            <div className="image-section">
              <img 
                src={image || '/placeholder-image.jpg'} 
                alt="Analyzed image" 
                className="analysis-image"
              />
              <div className="image-overlay">
                <span className="confidence-badge">
                  Analysis confidence: {confidence || 0}%
                </span>
              </div>
            </div>

            <div className="text-analysis">
              <h3>AI Analysis</h3>
              <div className="diagnosis-card">
                <h4>{diagnosis || 'Diagnosis in progress...'}</h4>
                <p>{description || 'Analysis description loading...'}</p>
              </div>

              <div className="recommendations">
                <h4>Recommendations</h4>
                <ul>
                  {(recommendations.length > 0 ? recommendations : ['Recommendations loading...']).map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Right column - chart and map */}
          <div className="right-column">
            {/* Circular chart */}
            <div className="chart-section">
              <h3>Symptom Severity</h3>
              <div className="pie-chart-container">
                <div className="pie-chart">
                  {(symptoms.length > 0 ? symptoms : [
                    { name: 'Symptom 1', value: 0 },
                    { name: 'Symptom 2', value: 0 }
                  ]).map((symptom, index) => (
                    <div
                      key={symptom.name}
                      className="pie-segment"
                      style={{
                        '--value': symptom.value,
                        '--color': `hsla(${index * 90}, 70%, 50%, 0.8)`,
                        '--index': index
                      }}
                    ></div>
                  ))}
                </div>
                <div className="chart-legend">
                  {(symptoms.length > 0 ? symptoms : [
                    { name: 'Loading...', value: 0 }
                  ]).map((symptom, index) => (
                    <div key={symptom.name} className="legend-item">
                      <span 
                        className="color-dot"
                        style={{backgroundColor: `hsla(${index * 90}, 70%, 50%, 0.8)`}}
                      ></span>
                      <span>{symptom.name}</span>
                      <span className="value">{symptom.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Medical services */}
            <div className="map-section">
              <h3>Healthcare Services</h3>
              <div className="map-container">
                <div className="yandex-map">
                  <div className="map-placeholder">
                    Healthcare Facilities Map
                    <br />
                    <small>Location: {location.lat}, {location.lng}</small>
                  </div>
                </div>
                
                <div className="medical-links">
                  <a 
                    href="https://talon.by" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="medical-link"
                  >
                     Book Doctor Appointment via Talon.by
                  </a>
                  <a 
                    href="https://tabletka.by" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="medical-link"
                  >
                     Find Medications on Tabletka.by
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AnalysisResults;