import { useState, useEffect } from 'react';

const PrivacyConsentModal = () => {
  const [showModal, setShowModal] = useState(false);
  const [blockedAction, setBlockedAction] = useState(null);

 useEffect(() => {
  const hasSeenModalThisSession = sessionStorage.getItem('privacyModalShown');
  const hasConsented = localStorage.getItem('privacyConsent');
  
  if (!hasConsented && !hasSeenModalThisSession) {
    setShowModal(true);
    sessionStorage.setItem('privacyModalShown', 'true');
  }
}, []);

  const handleAccept = () => {
    localStorage.setItem('privacyConsent', 'true');
    setShowModal(false);
    setBlockedAction(null);
  };

  const handleDecline = () => {
    setShowModal(false);
  };

  const requireConsent = (action) => {
    const hasConsented = localStorage.getItem('privacyConsent');
    if (!hasConsented) {
      setBlockedAction(action);
      setShowModal(true);
      return false;
    }
    return true;
  };

  useEffect(() => {
    window.requirePrivacyConsent = requireConsent;
  }, []);

  if (!showModal) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(10px)'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '30px',
        borderRadius: '15px',
        maxWidth: '500px',
        width: '90%',
        color: 'white',
        textAlign: 'center',
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
      }}>
        <h2 style={{ marginBottom: '20px', fontSize: '24px' }}>
          🔒 Data Privacy & Security Required
        </h2>
        
        <div style={{
          textAlign: 'left',
          marginBottom: '25px',
          lineHeight: '1.6',
          fontSize: '14px',
          background: 'rgba(255,255,255,0.1)',
          padding: '15px',
          borderRadius: '8px',
          backdropFilter: 'blur(10px)'
        }}>
          <p><strong>Action Blocked: {blockedAction === 'upload' ? 'Photo Upload' : 'Camera Access'}</strong></p>
          <p>To use this feature, you need to accept our data privacy policy.</p>
          
          <div style={{ margin: '15px 0' }}>
            <p>📸 <strong>Why we need access:</strong> To process and store your photos securely</p>
            <p>🛡️ <strong>Security:</strong> All photos are encrypted and protected</p>
            <p>🔐 <strong>Privacy:</strong> Your media remains confidential</p>
            <p>⚙️ <strong>Usage:</strong> Photos are used only for your requested features</p>
          </div>

          <p style={{ fontSize: '12px', opacity: '0.8', fontStyle: 'italic' }}>
            You must accept to continue with {blockedAction === 'upload' ? 'photo upload' : 'camera access'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
          <button
            onClick={handleDecline}
            style={{
              padding: '12px 25px',
              border: '2px solid rgba(255,255,255,0.3)',
              background: 'transparent',
              color: 'white',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'all 0.3s ease'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleAccept}
            style={{
              padding: '12px 25px',
              border: 'none',
              background: 'rgba(255,255,255,0.9)',
              color: '#667eea',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
              transition: 'all 0.3s ease'
            }}
          >
            Accept & Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrivacyConsentModal;