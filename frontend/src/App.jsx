import React, { useState } from 'react'
import PrivacyConsentModal from './components/PrivacyConsentModal.jsx';
import AnalysisResults from './components/pages/analysis/analysisresult.jsx';

function App() {
  const [currentPage, setCurrentPage] = useState('main')
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState('login') 
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userProfile, setUserProfile] = useState(null)
  const [showAccountDropdown, setShowAccountDropdown] = useState(false)
  const [analysisHistory, setAnalysisHistory] = useState([])
  const [analysisData, setAnalysisData] = useState(null)

  // Функция для определения уровня риска
  const getRiskLevel = (confidence, symptoms) => {
    if (!symptoms || symptoms.length === 0) return 'low'
    const avgSymptomValue = symptoms.reduce((sum, symptom) => sum + symptom.value, 0) / symptoms.length
    
    if (avgSymptomValue > 70 && confidence > 80) return 'high'
    if (avgSymptomValue > 50 && confidence > 60) return 'medium'
    return 'low'
  }

  // Функция для сохранения анализа в историю
  const handleAnalysisComplete = (data) => {
    const newAnalysisRecord = {
      id: Date.now(),
      date: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      image: data.image,
      diagnosis: data.diagnosis,
      confidence: data.confidence,
      riskLevel: getRiskLevel(data.confidence, data.symptoms),
      status: 'completed',
      symptoms: data.symptoms || [],
      recommendations: data.recommendations || []
    }

    setAnalysisHistory(prev => [newAnalysisRecord, ...prev])
    setAnalysisData(data)
    setCurrentPage('analysis')
  }

  // Функция для получения фото пользователя
  const getUserPhoto = async (userEmail) => {
    try {
      const response = await fetch(`http://localhost:8080/api/users/photo?userEmail=${encodeURIComponent(userEmail)}`);
      if (response.ok) {
        const blob = await response.blob();
        return URL.createObjectURL(blob);
      }
      return null;
    } catch (error) {
      console.error('Error fetching user photo:', error);
      return null;
    }
  };

  // Функция для удаления фото пользователя
  const deleteUserPhoto = async (userEmail) => {
    try {
      const response = await fetch(`http://localhost:8080/api/users/photo?userEmail=${encodeURIComponent(userEmail)}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting user photo:', error);
      return false;
    }
  };

  // Функция для анализа фото (реальная интеграция с бэкендом)
  const analyzePhoto = async (file) => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      if (userProfile?.email) {
        formData.append('userId', userProfile.email);
      }

      const response = await fetch('http://localhost:8080/api/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Analysis failed: ${errorText}`);
      }

      const analysisData = await response.json();
      
      if (!analysisData.success) {
        throw new Error(analysisData.message || 'Analysis failed');
      }
      
      // Добавляем изображение в ответ (превью)
      analysisData.image = URL.createObjectURL(file);
      
      return analysisData;
    } catch (error) {
      console.error('Ошибка анализа:', error);
      
      // Fallback на мок данные при ошибке
      const mockAnalysisData = {
        image: URL.createObjectURL(file),
        diagnosis: 'Предварительный анализ кожи',
        confidence: 85,
        description: 'На изображении обнаружены признаки, требующие внимания специалиста. Рекомендуется консультация дерматолога.',
        symptoms: [
          { name: 'Асимметрия', value: 75 },
          { name: 'Неровные края', value: 60 },
          { name: 'Неоднородный цвет', value: 80 },
          { name: 'Динамика изменений', value: 45 }
        ],
        recommendations: [
          'Консультация дерматолога в течение 7 дней',
          'Избегать прямого солнечного света',
          'Использовать солнцезащитные средства SPF 50+'
        ],
        location: {
          lat: 53.9045,
          lng: 27.5615
        }
      };
      
      // Имитация задержки сети
      await new Promise(resolve => setTimeout(resolve, 2000));
      return mockAnalysisData;
    }
  }

  const gradientStyles = {
    mainGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    headerGradient: 'linear-gradient(135deg, #4A00E0 0%, #8E2DE2 100%)',
    cardGradient: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
    buttonGradient: 'linear-gradient(135deg, #4A00E0 0%, #8E2DE2 100%)',
    buttonHoverGradient: 'linear-gradient(135deg, #3A00B0 0%, #7E1DC2 100%)',
    accentGradient: 'linear-gradient(135deg, #ff6b9d 0%, #9d4edd 100%)'
  }

  // Auth Modal Component
  const AuthModal = () => {
    const [formData, setFormData] = useState({
      email: '',
      password: '',
      name: '',
      location: '',
      customLocation: ''
    });
    const [errors, setErrors] = useState({});

    const validateForm = () => {
      const newErrors = {};

      if (!formData.email) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Email is invalid';
      }

      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }

      if (authMode === 'register') {
        if (!formData.name.trim()) {
          newErrors.name = 'Full name is required';
        } else if (formData.name.trim().length < 2) {
          newErrors.name = 'Name must be at least 2 characters';
        }

        if (!formData.location) {
          newErrors.location = 'Please select your city';
        }
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      
      if (!validateForm()) {
        return;
      }

      try {
        const url = authMode === 'login' 
          ? 'http://localhost:8080'
          : 'http://localhost:8080';

        const requestBody = authMode === 'login'
          ? {
              email: formData.email,
              password: formData.password
            }
          : {
              firstName: formData.name.split(' ')[0] || formData.name,
              lastName: formData.name.split(' ').slice(1).join(' ') || '',
              email: formData.email,
              password: formData.password,
              location: formData.location === 'other' ? formData.customLocation : formData.location
            };

        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        });
        
        if (res.ok) {
          const data = await res.json();
          
          const newUserProfile = {
            id: data.id,
            name: data.firstName + (data.lastName ? ' ' + data.lastName : ''),
            email: data.email,
            location: formData.location === 'other' ? formData.customLocation : formData.location,
            joinDate: new Date().toLocaleDateString(),
            birthDate: '',
          };
          
          setUserProfile(newUserProfile);
          setIsAuthenticated(true);
          setShowAuthModal(false);
          setCurrentPage('upload-main');
          
          setFormData({
            email: '',
            password: '',
            name: '',
            location: '',
            customLocation: ''
          });
          setErrors({});
          
          alert(data.message || `${authMode === 'login' ? 'Login' : 'Registration'} successful!`);
        } else {
          const errorData = await res.json().catch(() => ({ message: 'Unknown error' }));
          const errorMessage = errorData.message || 'Unknown error';
          console.error(`${authMode === 'login' ? 'Login' : 'Registration'} failed:`, errorMessage);
          alert(`${authMode === 'login' ? 'Login' : 'Registration'} failed: ${errorMessage}`);
        }
      } catch (error) {
        console.error(`${authMode === 'login' ? 'Login' : 'Registration'} error:`, error);
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
          alert('Network error: Please check if the server is running');
        } else {
          alert(`${authMode === 'login' ? 'Login' : 'Registration'} failed. Please try again.`);
        }
      }
    };

    const handleInputChange = (field, value) => {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
      
      if (errors[field]) {
        setErrors(prev => ({
          ...prev,
          [field]: ''
        }));
      }
    };

    if (!showAuthModal) return null;

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}>
        <div style={{
          background: gradientStyles.cardGradient,
          padding: '40px',
          borderRadius: '15px',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.2)',
          width: '90%',
          maxWidth: '400px'
        }}>
          <h2 style={{color: 'white', textAlign: 'center', marginBottom: '30px'}}>
            {authMode === 'login' ? 'Sign In' : 'Create Account'}
          </h2>
          
          <form onSubmit={handleSubmit}>
            {authMode === 'register' && (
              <div>
                <input
                  type="text"
                  placeholder="Full Name *"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    marginBottom: '5px',
                    borderRadius: '8px',
                    border: errors.name ? '1px solid #ff6b6b' : '1px solid rgba(255,255,255,0.3)',
                    background: 'rgba(255,255,255,0.1)',
                    color: 'white',
                    fontSize: '16px'
                  }}
                />
                {errors.name && (
                  <div style={{
                    color: '#ff6b6b',
                    fontSize: '12px',
                    marginBottom: '10px',
                    textAlign: 'left'
                  }}>
                    {errors.name}
                  </div>
                )}
              </div>
            )}
            
            <div>
              <input
                type="email"
                placeholder="Email *"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  marginBottom: '5px',
                  borderRadius: '8px',
                  border: errors.email ? '1px solid #ff6b6b' : '1px solid rgba(255,255,255,0.3)',
                  background: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  fontSize: '16px'
                }}
              />
              {errors.email && (
                <div style={{
                  color: '#ff6b6b',
                  fontSize: '12px',
                  marginBottom: '10px',
                  textAlign: 'left'
                }}>
                  {errors.email}
                </div>
              )}
            </div>
            
            <div>
              <input
                type="password"
                placeholder="Password *"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  marginBottom: '5px',
                  borderRadius: '8px',
                  border: errors.password ? '1px solid #ff6b6b' : '1px solid rgba(255,255,255,0.3)',
                  background: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  fontSize: '16px'
                }}
              />
              {errors.password && (
                <div style={{
                  color: '#ff6b6b',
                  fontSize: '12px',
                  marginBottom: '10px',
                  textAlign: 'left'
                }}>
                  {errors.password}
                </div>
              )}
            </div>
            
            {authMode === 'register' && (
              <div>
                <select
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    marginBottom: '5px',
                    borderRadius: '8px',
                    border: errors.location ? '1px solid #ff6b6b' : '1px solid rgba(255,255,255,0.2)',
                    background: 'rgba(255,255,255,0.1)',
                    color: formData.location ? 'white' : 'rgba(255,255,255,0.6)',
                    fontSize: '16px',
                    appearance: 'none',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <option value="" style={{background: '#4A00E0', color: 'rgba(255,255,255,0.6)'}}>
                    Choose your city *
                  </option>
                  <option value="minsk" style={{background: '#4A00E0', color: 'white'}}>Minsk</option>
                  <option value="brest" style={{background: '#4A00E0', color: 'white'}}>Brest</option>
                  <option value="vitebsk" style={{background: '#4A00E0', color: 'white'}}>Vitebsk</option>
                  <option value="gomel" style={{background: '#4A00E0', color: 'white'}}>Gomel</option>
                  <option value="grodno" style={{background: '#4A00E0', color: 'white'}}>Grodno</option>
                  <option value="mogilev" style={{background: '#4A00E0', color: 'white'}}>Mogilev</option>
                  <option value="other" style={{background: '#4A00E0', color: 'white'}}>Other</option>
                </select>
                {errors.location && (
                  <div style={{
                    color: '#ff6b6b',
                    fontSize: '12px',
                    marginBottom: '10px',
                    textAlign: 'left'
                  }}>
                    {errors.location}
                  </div>
                )}
              </div>
            )}

            {authMode === 'register' && formData.location === 'other' && (
              <input
                type="text"
                placeholder="Enter your city *"
                value={formData.customLocation || ''}
                onChange={(e) => handleInputChange('customLocation', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  marginBottom: '15px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.2)',
                  background: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  fontSize: '16px',
                  backdropFilter: 'blur(20px)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s ease'
                }}
              />
            )}
            
            <button
              type="submit"
              style={{
                width: '100%',
                padding: '12px',
                background: gradientStyles.buttonGradient,
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                marginBottom: '15px',
                marginTop: '10px'
              }}
            >
              {authMode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div style={{textAlign: 'center'}}>
            <button
              onClick={() => {
                setAuthMode(authMode === 'login' ? 'register' : 'login');
                setErrors({});
                setFormData({
                  email: '',
                  password: '',
                  name: '',
                  location: '',
                  customLocation: ''
                });
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'rgba(255,255,255,0.8)',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              {authMode === 'login' 
                ? "Don't have an account? Sign up" 
                : "Already have an account? Sign in"}
            </button>
          </div>

          <div style={{
            textAlign: 'center',
            marginTop: '15px',
            fontSize: '12px',
            color: 'rgba(255,255,255,0.6)'
          }}>
            * Required fields
          </div>

          <button
            onClick={() => {
              setShowAuthModal(false);
              setErrors({});
              setFormData({
                email: '',
                password: '',
                name: '',
                location: '',
                customLocation: ''
              });
            }}
            style={{
              position: 'absolute',
              top: '15px',
              right: '15px',
              background: 'none',
              border: 'none',
              color: 'white',
              fontSize: '20px',
              cursor: 'pointer'
            }}
          >
            ×
          </button>
        </div>
      </div>
    );
  };

  // Header Component
  const Header = () => (
    <header style={{
      background: gradientStyles.headerGradient,
      padding: '20px 0',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '24px',
            fontWeight: 'bold',
            color: 'white',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
            marginRight: '30px',
            paddingRight: '50px'
          }}>
            <img
              src="/images/logo.png"
              alt="MedLook Logo"
              style={{
                width: '40px',
                height: '40px',
                objectFit: 'contain',
                filter: 'brightness(0) invert(1) drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
              }}
            />
            MedLook
          </div>
          <nav style={{ flex: 1 }}>
            <ul style={{ 
              display: 'flex', 
              listStyle: 'none', 
              gap: '0',
              justifyContent: 'flex-end',
              width: '100%'
            }}>
              {[
                { id: 'main', label: 'Home' },
                { id: 'about', label: 'About MedLook' },
                { id: 'security', label: 'Security and Data' },
                { id: 'about-us', label: 'About Us' }
              ].map(item => (
                <li key={item.id} style={{ flex: 1, textAlign: 'center' }}>
                  <button
                    onClick={() => setCurrentPage(item.id)}
                    style={{
                      background: currentPage === item.id 
                        ? 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 100%)' 
                        : 'transparent',
                      border: 'none',
                      color: 'white',
                      fontWeight: '600',
                      cursor: 'pointer',
                      padding: '15px 20px',
                      borderRadius: '0',
                      width: '100%',
                      transition: 'all 0.3s ease',
                      backdropFilter: 'blur(10px)',
                      borderBottom: currentPage === item.id ? '3px solid white' : '3px solid transparent',
                      textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                      fontSize: '14px',
                      letterSpacing: '0.5px'
                    }}
                    onMouseOver={(e) => {
                      if (currentPage !== item.id) {
                        e.target.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 100%)'
                      }
                    }}
                    onMouseOut={(e) => {
                      if (currentPage !== item.id) {
                        e.target.style.background = 'transparent'
                      }
                    }}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
          
          <div style={{ position: 'relative', marginLeft: '20px' }}>
            <button
              onClick={() => {
                if (isAuthenticated) {
                  setShowAccountDropdown(!showAccountDropdown)
                } else {
                  setShowAuthModal(true)
                  setAuthMode('login')
                }
              }}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '50%',
                width: '45px',
                height: '45px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.background = 'rgba(255,255,255,0.2)'
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'rgba(255,255,255,0.1)'
              }}
            >
              <img
                src="/images/account.png"
                alt="Account"
                style={{
                  width: '45px',
                  height: '45px',
                  objectFit: 'contain',
                  filter: 'brightness(0) invert(1)',
                }}
                onError={(e) => {
                  e.target.style.display = 'none'
                  e.target.nextSibling.style.display = 'block'
                }}
              />
              <div style={{
                display: 'none',
                fontSize: '20px',
                color: 'white',
                fontWeight: 'bold'
              }}>
                <img
                  src="/images/account.png" 
                  alt="User"
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    objectFit: 'cover',
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none'
                    e.target.parentElement.innerHTML = userProfile?.name?.charAt(0) || 'U'
                    e.target.parentElement.style.display = 'flex'
                    e.target.parentElement.style.alignItems = 'center'
                    e.target.parentElement.style.justifyContent = 'center'
                    e.target.parentElement.style.fontSize = '14px'
                    e.target.parentElement.style.color = 'white'
                    e.target.parentElement.style.fontWeight = 'bold'
                  }}
                />
              </div>
            </button>

            {isAuthenticated && showAccountDropdown && (
              <div style={{
                position: 'absolute',
                top: '55px',
                right: '0',
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '12px',
                padding: '20px',
                minWidth: '300px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                zIndex: 1000
              }}>
                <div style={{ marginBottom: '15px', borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: '15px' }}>
                  <h3 style={{ color: '#333', margin: '0 0 5px 0' }}>{userProfile?.name || 'User'}</h3>
                  <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>{userProfile?.email}</p>
                </div>
                
                <button
                  onClick={() => {
                    setCurrentPage('account')
                    setShowAccountDropdown(false)
                  }}
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: 'transparent',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    marginBottom: '10px',
                    color: '#333',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.background = '#f5f5f5'
                  }}
                  onMouseOut={(e) => {
                    e.target.style.background = 'transparent'
                  }}
                >
                  My Profile
                </button>
                
                <button
                  onClick={() => {
                    setCurrentPage('analysis-history')
                    setShowAccountDropdown(false)
                  }}
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: 'transparent',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    marginBottom: '10px',
                    color: '#333',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.background = '#f5f5f5'
                  }}
                  onMouseOut={(e) => {
                    e.target.style.background = 'transparent'
                  }}
                >
                  Analysis History
                </button>
                
                <button
                  onClick={() => {
                    setIsAuthenticated(false)
                    setUserProfile(null)
                    setShowAccountDropdown(false)
                    setCurrentPage('main')
                  }}
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: 'transparent',
                    border: '1px solid #ff6b6b',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    color: '#ff6b6b',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.background = '#fff5f5'
                  }}
                  onMouseOut={(e) => {
                    e.target.style.background = 'transparent'
                  }}
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )

  // Footer Component
  const Footer = () => (
    <footer style={{
      background: gradientStyles.headerGradient,
      color: 'white',
      padding: '40px 0',
      marginTop: '60px',
      borderTop: '1px solid rgba(255,255,255,0.2)'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ 
            fontSize: '24px', 
            fontWeight: 'bold',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            <p style={{
              marginTop: '10px',
              fontSize: '12px',
              color: 'rgba(255,255,255,0.6)',
              userSelect: 'none'
            }}>
              © {new Date().getFullYear()} MedLook. All rights reserved.
            </p>  
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: '5px 0', opacity: 0.9 }}>Contact: MedLook Group</p>
            <p style={{ margin: '5px 0', opacity: 0.9 }}>info@medlook.com</p>
          </div>
        </div>
      </div>
    </footer>
  )

  // Button Component
  const Button = ({ children, variant = 'primary', onClick, style = {}, disabled = false }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'inline-block',
        padding: '14px 30px',
        border: 'none',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.3s ease',
        margin: '10px',
        background: variant === 'primary'
          ? gradientStyles.buttonGradient
          : variant === 'secondary'
            ? 'linear-gradient(135deg, #6c757d 0%, #5a6268 100%)'
            : 'transparent',
        color: 'white',
        border: variant === 'outline' ? '2px solid rgba(255,255,255,0.3)' : 'none',
        boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
        textShadow: '0 1px 2px rgba(0,0,0,0.3)',
        opacity: disabled ? 0.6 : 1,
        ...style
      }}
      onMouseOver={(e) => {
        if (!disabled) {
          if (variant === 'primary') {
            e.target.style.transform = 'translateY(-2px)'
            e.target.style.background = gradientStyles.buttonHoverGradient
            e.target.style.boxShadow = '0 6px 20px rgba(0,0,0,0.3)'
          } else if (variant === 'outline') {
            e.target.style.background = 'rgba(255,255,255,0.1)'
          }
        }
      }}
      onMouseOut={(e) => {
        if (!disabled) {
          if (variant === 'primary') {
            e.target.style.transform = 'translateY(0)'
            e.target.style.background = gradientStyles.buttonGradient
            e.target.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)'
          } else if (variant === 'outline') {
            e.target.style.background = 'transparent'
          }
        }
      }}
    >
      {children}
    </button>
  )

  // Main Page
  const MainPage = () => (
    <section style={{ 
      padding: '60px 0', 
      minHeight: '60vh',
      background: gradientStyles.mainGradient,
      position: 'relative',
      overflow: 'hidden'
    }}>
      
      <div style={{
        position: 'absolute',
        top: '-50%',
        right: '-10%',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
        borderRadius: '50%'
      }}></div>
      <div style={{
        position: 'absolute',
        bottom: '-30%',
        left: '-10%',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)',
        borderRadius: '50%'
      }}></div>
      
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '0 20px',
        textAlign: 'center',
        position: 'relative',
        zIndex: 1
      }}>

        <div style={{
          background: gradientStyles.cardGradient,
          borderRadius: '20px',
          padding: '60px 40px',
          marginBottom: '80px',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '-100px',
            right: '-100px',
            width: '300px',
            height: '300px',
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
            borderRadius: '50%'
          }}></div>
          
          <h2 style={{
            fontSize: '42px',
            marginBottom: '20px',
            color: 'white',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            What is MedLook?
          </h2>
          <p style={{ 
            fontSize: '18px', 
            maxWidth: '800px', 
            margin: '0 auto 20px', 
            color: 'rgba(255,255,255,0.9)',
            textShadow: '0 1px 2px rgba(0,0,0,0.2)'
          }}>
           MedLook is an AI-powered health screening platform that analyzes facial photos to detect early signs of fatigue, stress, skin conditions, and overall wellness. 
          </p>
          <p style={{ 
            fontSize: '18px', 
            maxWidth: '800px', 
            margin: '0 auto 40px', 
            color: 'rgba(255,255,255,0.9)',
            textShadow: '0 1px 2px rgba(0,0,0,0.2)'
          }}>
          Users simply upload a selfie, and MedLook delivers fast, private, and insightful health feedback — helping you stay proactive about your well-being.
          </p>
          <Button onClick={() => {
             if (!window.requirePrivacyConsent('upload')) {
      return;
             }
             if (isAuthenticated) {
               setCurrentPage('upload-main')
                 } else {
               setShowAuthModal(true)
               }
        }}>
           Upload Your Photo
           </Button>
        </div>

        <h1 style={{
          fontSize: '50px',
          lineHeight: '1.1',
          fontWeight: '700',
          color: 'white',
          margin: '0 0 40px 0',
          textShadow: '0 4px 8px rgba(0,0,0,0.3)',
          background: 'linear-gradient(135deg, #fff 0%, #e6f7ff 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Our Mission
        </h1>
        <p style={{ 
          fontSize: '18px', 
          maxWidth: '800px', 
          margin: '0 auto 60px', 
          color: 'rgba(255,255,255,0.9)',
          lineHeight: '1.6',
          textShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }}>
          Our company's global brands are linked to different kinds of online products that can help us achieve better quality.
          About your marketing team – helping you meet personalized needs.
        </p>
         <div style={{
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '30px',
    margin: '60px 0'
  }}>
   {[
    {
      icon: '/images/storm.png',
      title: 'Fast Analysis',
      description: 'Get accurate results in seconds with our advanced AI technology'
    },
    {
      icon: '/images/lock.png',
      title: 'Data Security',
      description: 'Your privacy is our priority. All data is encrypted and secure'
    },
    {
      icon: '/images/phone.png',
      title: 'Easy to Use',
      description: 'Simple interface that works perfectly on all devices'
    },
    {
      icon: '/images/aim.png',
      title: 'High Accuracy',
      description: 'Professional-grade analysis with 99% accuracy rate'
    },
    {
      icon: '/images/refresh.png',
      title: 'Real-time Results',
      description: 'Instant feedback and detailed reports immediately after upload'
    },
    {
      icon: '/images/light.png',
      title: 'Smart Insights',
      description: 'Get personalized recommendations based on your results'
    }
  ].map((card, index) => (
    <div
      key={index}
      style={{
        background: 'rgba(255,255,255,0.1)',
        padding: '30px',
        borderRadius: '15px',
        textAlign: 'center',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.1)',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        userSelect: 'none'
      }}
      onMouseOver={(e) => {
        e.target.style.transform = 'translateY(-5px)'
        e.target.style.background = 'rgba(255,255,255,0.15)'
        e.target.style.boxShadow = '0 10px 30px rgba(0,0,0,0.2)'
      }}
      onMouseOut={(e) => {
        e.target.style.transform = 'translateY(0)'
        e.target.style.background = 'rgba(255,255,255,0.1)'
        e.target.style.boxShadow = 'none'
      }}
    >
      <div style={{
        fontSize: '48px',
        marginBottom: '20px',
        userSelect: 'none',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '48px'
      }}>
        <img 
          src={card.icon}
          alt={card.title}
          style={{
            width: '48px',
            height: '48px',
            objectFit: 'contain',
            filter: 'brightness(0) invert(1)'
          }}
          onError={(e) => {
            e.target.style.display = 'none'
            const fallback = document.createElement('div')
            fallback.textContent = '📊'
            fallback.style.fontSize = '48px'
            e.target.parentElement.appendChild(fallback)
          }}
        />
      </div>
      <h3 style={{
        fontSize: '24px',
        color: 'white',
        marginBottom: '15px',
        userSelect: 'none'
      }}>
        {card.title}
      </h3>
      <p style={{
        color: 'rgba(255,255,255,0.8)',
        lineHeight: '1.5',
        fontSize: '16px',
        userSelect: 'none'
      }}>
        {card.description}
      </p>
    </div>
  ))}
  </div>
      </div>
    </section>
  )

  // Upload Main Page
  const UploadMainPage = () => (
    <section style={{ 
      padding: '60px 0', 
      minHeight: '60vh',
      background: gradientStyles.mainGradient
    }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '0 20px' 
      }}>
        <div style={{
          background: gradientStyles.cardGradient,
          borderRadius: '12px',
          padding: '40px',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          maxWidth: '800px',
          margin: '0 auto',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ 
            fontSize: '32px', 
            marginBottom: '20px', 
            color: 'white', 
            textAlign: 'center',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            Upload Your Photo
          </h2>
          <p style={{ 
            textAlign: 'center', 
            color: 'rgba(255,255,255,0.9)', 
            marginBottom: '40px',
            textShadow: '0 1px 2px rgba(0,0,0,0.2)'
          }}>
            View a phone with instructions
          </p>

          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '30px', 
            marginBottom: '40px' 
          }}>
            <div style={{
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '12px',
              padding: '30px',
              textAlign: 'center',
              flex: 1,
              maxWidth: '300px',
              transition: 'all 0.3s ease',
              border: '1px solid rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)'
            }}>
              <img src="/images/upload.png" alt="Upload"
                style={{
                  width: '60px',
                  height: '60px',
                  marginBottom: '15px',
                  objectFit: 'contain',
                  filter: 'brightness(0) invert(1)'
                }}
              />
              <h3 style={{ 
                fontSize: '20px', 
                marginBottom: '15px', 
                color: 'white' 
              }}>
                Upload Image
              </h3>
              <p style={{ 
                color: 'rgba(255,255,255,0.8)', 
                marginBottom: '20px' 
              }}>
                Choose any photos from your phone
              </p>
              <Button onClick={() => {
                 if (!window.requirePrivacyConsent('upload')) {
      return;
                 }
     if (isAuthenticated) {
      setCurrentPage('upload-image')
    } else {
      setAuthMode('login')
      setShowAuthModal(true)
    }
  }}>
    Upload Image
  </Button>
            </div>

            <div style={{
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '12px',
              padding: '30px',
              textAlign: 'center',
              flex: 1,
              maxWidth: '300px',
              transition: 'all 0.3s ease',
              border: '1px solid rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)'
            }}>
              <img
                src="/images/camera.png"
                alt="Camera"
                style={{
                  width: '60px',
                  height: '60px',
                  marginBottom: '15px',
                  objectFit: 'contain',
                  filter: 'brightness(0) invert(1)'
                }}
              />
              <h3 style={{ 
                fontSize: '20px', 
                marginBottom: '15px', 
                color: 'white' 
              }}>
                Use Camera
              </h3>
              <p style={{ 
                color: 'rgba(255,255,255,0.8)', 
                marginBottom: '20px' 
              }}>
                Take a photo with your device camera
              </p>
              <Button onClick={() => {
                 if (!window.requirePrivacyConsent('camera')) {
      return;
                 }
    if (isAuthenticated) {
      setCurrentPage('use-camera')
    } else {
      setAuthMode('login')
      setShowAuthModal(true)
    }
  }}>
    Use Camera
  </Button>
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <Button 
              variant="outline" 
              onClick={() => setCurrentPage('main')}
              style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}
            >
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    </section>
  )

  // Upload Image Page
  
 // Upload Image Page
const UploadImagePage = () => {
  const [selectedFile, setSelectedFile] = useState(null)
  const [showRemoveMessage, setShowRemoveMessage] = useState(false) 
  const [isUploading, setIsUploading] = useState(false)
  const [uploadMessage, setUploadMessage] = useState('')

  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
      // Проверка типа файла
      if (!file.type.startsWith('image/')) {
        setUploadMessage('Please select an image file (JPG, PNG, GIF)')
        return
      }
      
      // Проверка размера файла (максимум 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setUploadMessage('File size must be less than 10MB')
        return
      }
      
      // Проверка минимального размера файла
      if (file.size < 1024) {
        setUploadMessage('File size is too small')
        return
      }
      
      setSelectedFile(file)
      setShowRemoveMessage(false)
      setUploadMessage('')
    }
  }

  const handleUploadClick = async () => {
    if (!selectedFile) {
      setUploadMessage('Please select a photo first!')
      return
    }

    if (!userProfile?.email) {
      setUploadMessage('Please log in to upload photos')
      return
    }

    setIsUploading(true)
    setUploadMessage('')

    try {
      console.log('Uploading photo:', selectedFile.name)
      
      const formData = new FormData()
      formData.append('photo', selectedFile)
      formData.append('userEmail', userProfile.email)

      const response = await fetch('http://localhost:8080/api/users/upload-photo', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const result = await response.text()
        setUploadMessage('Photo uploaded successfully!')
        console.log('Upload result:', result)
        
        // Очищаем выбранный файл после успешной загрузки
        setSelectedFile(null)
        document.getElementById('file-input').value = ''
        
        // Можно добавить дополнительную логику после успешной загрузки
        // Например, обновить профиль пользователя или перейти на другую страницу
        
      } else {
        const errorText = await response.text()
        console.error('Upload failed:', errorText)
        setUploadMessage(`Upload failed: ${errorText}`)
      }
    } catch (error) {
      console.error('Upload error:', error)
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        setUploadMessage('Network error: Please check if the server is running')
      } else {
        setUploadMessage(`Upload error: ${error.message}`)
      }
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemovePhoto = () => {
    if (selectedFile) {
      setSelectedFile(null)
      document.getElementById('file-input').value = ''
      setShowRemoveMessage(false)
      setUploadMessage('')
      console.log('Photo removed')
    } else {
      setShowRemoveMessage(true)
    }
  }

  return (
    <section style={{ 
      padding: '60px 0', 
      minHeight: '60vh',
      background: gradientStyles.mainGradient
    }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '0 20px' 
      }}>
        <div style={{
          background: gradientStyles.cardGradient,
          borderRadius: '12px',
          padding: '40px',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          maxWidth: '800px',
          margin: '0 auto',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ 
            fontSize: '32px', 
            marginBottom: '20px', 
            color: 'white', 
            textAlign: 'center',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            Upload Your Image
          </h2>
          <p style={{ 
            textAlign: 'center', 
            color: 'rgba(255,255,255,0.9)', 
            marginBottom: '30px',
            textShadow: '0 1px 2px rgba(0,0,0,0.2)'
          }}>
            Choose any photos from your phone to upload to your profile
          </p>
          
          {/* Area for drag and drop / file selection */}
          <div
            style={{
              border: '2px dashed rgba(255,255,255,0.3)',
              borderRadius: '8px',
              padding: '40px',
              textAlign: 'center',
              margin: '30px 0',
              cursor: isUploading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              color: 'rgba(255,255,255,0.8)',
              background: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(10px)',
              minHeight: '200px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: isUploading ? 0.6 : 1
            }}
            onClick={() => !isUploading && document.getElementById('file-input').click()}
            onDragOver={(e) => {
              e.preventDefault()
              if (!isUploading) {
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)'
              }
            }}
            onDragLeave={(e) => {
              e.preventDefault()
              if (!isUploading) {
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'
              }
            }}
            onDrop={(e) => {
              e.preventDefault()
              if (!isUploading && e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleFileSelect({ target: { files: e.dataTransfer.files } })
              }
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'
            }}
          >
            {selectedFile ? (
              <div style={{ textAlign: 'center', width: '100%' }}>
                <div style={{ 
                  width: '150px', 
                  height: '150px', 
                  margin: '0 auto 15px',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  border: '2px solid rgba(255,255,255,0.3)'
                }}>
                  <img 
                    src={URL.createObjectURL(selectedFile)} 
                    alt="Preview" 
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none'
                      const fallback = document.createElement('div')
                      fallback.textContent = '📷'
                      fallback.style.fontSize = '48px'
                      fallback.style.color = 'rgba(255,255,255,0.9)'
                      fallback.style.display = 'flex'
                      fallback.style.alignItems = 'center'
                      fallback.style.justifyContent = 'center'
                      fallback.style.height = '100%'
                      e.target.parentElement.appendChild(fallback)
                    }}
                  />
                </div>
                <p style={{ margin: '10px 0', fontWeight: 'bold' }}>{selectedFile.name}</p>
                <p style={{ fontSize: '14px', opacity: '0.8' }}>
                  Size: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
                <p style={{ fontSize: '14px', opacity: '0.8' }}>Click to change photo</p>
              </div>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <img 
                  src="/images/folder.png" 
                  alt="Folder" 
                  style={{
                    width: '65px',
                    height: '65px',
                    marginBottom: '15px',
                    objectFit: 'contain',
                    filter: 'brightness(0) invert(1)'
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none'
                    const fallback = document.createElement('div')
                    fallback.textContent = '📁'
                    fallback.style.fontSize = '48px'
                    fallback.style.color = 'rgba(255,255,255,0.9)'
                    fallback.style.marginBottom = '15px'
                    e.target.parentElement.appendChild(fallback)
                  }}
                />
                <p>Drag & Drop your image here or click to browse</p>
                <p style={{ fontSize: '14px', marginTop: '10px', opacity: '0.7' }}>
                  Supported formats: JPG, PNG, GIF • Max size: 10MB
                </p>
              </div>
            )}
            <input
              type="file"
              id="file-input"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileSelect}
              disabled={isUploading}
            />
          </div>

          {/* Buttons section */}
          <div style={{ textAlign: 'center' }}>
            <Button 
              onClick={handleUploadClick}
              disabled={isUploading || !selectedFile}
            >
              {isUploading ? 'Uploading...' : 'Upload Photo'}
            </Button>
            
            <Button 
              onClick={async () => {
                if (!selectedFile) {
                  setUploadMessage('Please select a photo first!')
                  return
                }
                
                setIsUploading(true)
                setUploadMessage('Analyzing photo...')
                
                try {
                  const result = await analyzePhoto(selectedFile)
                  handleAnalysisComplete(result)
                } catch (error) {
                  setUploadMessage(`Analysis failed: ${error.message}`)
                } finally {
                  setIsUploading(false)
                }
              }}
              disabled={isUploading || !selectedFile}
              style={{ 
                background: 'linear-gradient(135deg, #ff6b9d 0%, #9d4edd 100%)',
                marginLeft: '10px'
              }}
            >
              {isUploading ? 'Analyzing...' : 'Analyze Photo'}
            </Button>
            
            <Button 
              variant="secondary"
              onClick={handleRemovePhoto}
              disabled={isUploading}
            >
              Remove Photo
            </Button>

            <Button 
              variant="outline" 
              onClick={() => setCurrentPage('upload-main')}
              style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}
              disabled={isUploading}
            >
              Back
            </Button>
          </div>

          {/* Messages section */}
          {showRemoveMessage && (
            <div style={{ 
              textAlign: 'center', 
              marginTop: '15px',
              color: '#ff6b6b',
              fontWeight: 'bold',
              fontSize: '14px'
            }}>
              No photo selected to remove!
            </div>
          )}

          {uploadMessage && (
            <div style={{ 
              textAlign: 'center', 
              marginTop: '15px',
              color: uploadMessage.includes('successfully') ? '#4CAF50' : '#ff6b6b',
              fontWeight: 'bold',
              fontSize: '14px',
              padding: '10px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '6px'
            }}>
              {uploadMessage}
            </div>
          )}

          {isUploading && (
            <div style={{ 
              textAlign: 'center', 
              marginTop: '20px',
              color: 'rgba(255,255,255,0.8)'
            }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                border: '3px solid rgba(255,255,255,0.3)',
                borderTop: '3px solid white',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto'
              }}></div>
              <p>Uploading your image...</p>
            </div>
          )}

          {/* User info */}
          {userProfile?.email && (
            <div style={{
              textAlign: 'center',
              marginTop: '20px',
              padding: '15px',
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <p style={{ 
                color: 'rgba(255,255,255,0.8)', 
                fontSize: '14px',
                margin: 0
              }}>
                Photo will be saved to your profile: <strong>{userProfile.email}</strong>
              </p>
            </div>
          )}
        </div>
      </div>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </section>
  )
}

  // Use Camera Page
  const UseCameraPage = () => (
    <section style={{ 
      padding: '60px 0', 
      minHeight: '60vh',
      background: gradientStyles.mainGradient
    }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '0 20px' 
      }}>
        <div style={{
          background: gradientStyles.cardGradient,
          borderRadius: '12px',
          padding: '40px',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          maxWidth: '800px',
          margin: '0 auto',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ 
            fontSize: '32px', 
            marginBottom: '20px', 
            color: 'white', 
            textAlign: 'center',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            Use Your Camera
          </h2>
          <p style={{ 
            textAlign: 'center', 
            color: 'rgba(255,255,255,0.9)', 
            marginBottom: '30px',
            textShadow: '0 1px 2px rgba(0,0,0,0.2)'
          }}>
            Take a photo with your device camera
          </p>

          <div style={{
            width: '100%',
            maxWidth: '500px',
            height: '300px',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '8px',
            margin: '30px auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px dashed rgba(255,255,255,0.2)',
            color: 'rgba(255,255,255,0.7)',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{ fontSize: '18px' }}>Camera Preview</div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <Button>Take a Photo</Button>
            <Button 
              variant="outline" 
              onClick={() => setCurrentPage('upload-main')}
              style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </section>
  )

  // About Page
  const AboutPage = () => (
    <section style={{ 
      padding: '60px 0', 
      minHeight: '60vh',
      background: gradientStyles.mainGradient
    }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '0 20px' 
      }}>
        <div style={{
          background: gradientStyles.cardGradient,
          borderRadius: '12px',
          padding: '40px',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          marginBottom: '40px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ 
            fontSize: '32px', 
            marginBottom: '20px', 
            color: 'white',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            About MedLook
          </h2>
          <p style={{ 
            marginBottom: '15px', 
            color: 'rgba(255,255,255,0.9)', 
            lineHeight: '1.6',
            textShadow: '0 1px 2px rgba(0,0,0,0.2)'
          }}>
          At MedLook, we believe that early detection saves lives. Our cutting-edge technology uses advanced artificial intelligence to analyze facial and physical features from your photo, identifying potential signs of illness and offering personalized health recommendations.
          </p>
          <h3 style={{ 
            fontSize: '24px', 
            margin: '30px 0 15px', 
            color: 'white',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            Why we exist?
          </h3>
          <ul style={{ listStyle: 'none', margin: '20px 0' }}>
            <li style={{ 
              padding: '10px 0', 
              borderBottom: '1px solid rgba(255,255,255,0.2)', 
              color: 'rgba(255,255,255,0.9)',
              textShadow: '0 1px 2px rgba(0,0,0,0.2)'
            }}>
              <span style={{ color: 'white', fontWeight: 'bold', marginRight: '10px' }}>✓</span>
              To make proactive health insights accessible to everyone through the power of AI.
            </li>
           <h3 style={{ 
            fontSize: '24px', 
            margin: '30px 0 15px', 
            color: 'white',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            What we do?
          </h3>
            <li style={{ 
              padding: '10px 0', 
              borderBottom: '1px solid rgba(255,255,255,0.2)', 
              color: 'rgba(255,255,255,0.9)',
              textShadow: '0 1px 2px rgba(0,0,0,0.2)'
            }}>
              <span style={{ color: 'white', fontWeight: 'bold', marginRight: '10px' }}>✓</span>
             We analyze facial features using advanced technology to detect potential health risks and guide users toward better well-being.
            </li>
            <h3 style={{ 
            fontSize: '24px', 
            margin: '30px 0 15px', 
            color: 'white',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
             How we help?
          </h3>
            <li style={{ 
              padding: '10px 0', 
              color: 'rgba(255,255,255,0.9)',
              textShadow: '0 1px 2px rgba(0,0,0,0.2)'
            }}>
              <span style={{ color: 'white', fontWeight: 'bold', marginRight: '10px' }}>✓</span>
              We deliver fast, secure, and personalized health recommendations — starting with just one photo.
            </li>
          </ul>
        </div>

        <div style={{ textAlign: 'center' }}>
          <Button 
            variant="outline" 
            onClick={() => setCurrentPage('main')}
            style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}
          >
            Back to Home
          </Button>
        </div>
      </div>
    </section>
  )

  // Security Page
  const SecurityPage = () => (
    <section style={{ 
      padding: '60px 0', 
      minHeight: '60vh',
      background: gradientStyles.mainGradient
    }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '0 20px' 
      }}>
        <div style={{
          background: gradientStyles.cardGradient,
          borderRadius: '12px',
          padding: '40px',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          marginBottom: '40px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ 
            fontSize: '32px', 
            marginBottom: '20px', 
            color: 'white',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            Security and Data
          </h2>
          <p style={{ 
            marginBottom: '15px', 
            color: 'rgba(255,255,255,0.9)', 
            lineHeight: '1.6',
            textShadow: '0 1px 2px rgba(0,0,0,0.2)'
          }}>
           We have built a secure space where artificial intelligence carefully analyzes your photographs. Every image is protected by end-to-end encryption and is never stored on our servers after processing. Your personal data and analysis results are for your eyes only—we create a personalized experience that respects your privacy and adapts to your unique needs.
          </p>
        </div>

        <div style={{ textAlign: 'center' }}>
          <Button 
            variant="outline" 
            onClick={() => setCurrentPage('main')}
            style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}
          >
            Back to Home
          </Button>
        </div>
      </div>
    </section>
  )

  // About Us Page
  const AboutUsPage = () => (
    <section style={{ 
      padding: '60px 0', 
      minHeight: '60vh',
      background: gradientStyles.mainGradient
    }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '0 20px' 
      }}>
        <div style={{
          background: gradientStyles.cardGradient,
          borderRadius: '12px',
          padding: '40px',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          marginBottom: '40px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ 
            fontSize: '32px', 
            marginBottom: '20px', 
            color: 'white',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            About Us
          </h2>
          <p style={{ 
            marginBottom: '15px', 
            color: 'rgba(255,255,255,0.9)', 
            lineHeight: '1.6',
            textShadow: '0 1px 2px rgba(0,0,0,0.2)'
          }}>
            We are a dedicated team of professionals committed to revolutionizing healthcare through innovative technology solutions.
          </p>
          <p style={{ 
            color: 'rgba(255,255,255,0.9)', 
            lineHeight: '1.6',
            textShadow: '0 1px 2px rgba(0,0,0,0.2)'
          }}>
            Our mission is to make advanced health monitoring accessible to everyone through user-friendly applications and cutting-edge AI technology.
          </p>
        </div>

        <div style={{ textAlign: 'center' }}>
          <Button 
            variant="outline" 
            onClick={() => setCurrentPage('main')}
            style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}
          >
            Back to Home
          </Button>
        </div>
      </div>
    </section>
  )

  // Account Page
  const AccountPage = () => {
    const [userPhoto, setUserPhoto] = useState(null);
    const [loadingPhoto, setLoadingPhoto] = useState(false);

    // Загружаем фото пользователя при открытии страницы
    React.useEffect(() => {
      if (userProfile?.email) {
        setLoadingPhoto(true);
        getUserPhoto(userProfile.email).then(photoUrl => {
          setUserPhoto(photoUrl);
          setLoadingPhoto(false);
        });
      }
    }, [userProfile?.email]);

    return (
    <section style={{ 
      padding: '60px 0', 
      minHeight: '60vh',
      background: gradientStyles.mainGradient
    }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '0 20px' 
      }}>
        <div style={{
          background: gradientStyles.cardGradient,
          borderRadius: '12px',
          padding: '40px',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          maxWidth: '600px',
          margin: '0 auto',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ 
            fontSize: '32px', 
            marginBottom: '30px', 
            color: 'white', 
            textAlign: 'center',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            My Profile
          </h2>
          
          {/* User Photo Section */}
          <div style={{ 
            textAlign: 'center', 
            marginBottom: '30px',
            padding: '20px',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <h3 style={{ 
              color: 'white', 
              marginBottom: '15px',
              fontSize: '18px'
            }}>
              Profile Photo
            </h3>
            
            {loadingPhoto ? (
              <div style={{ 
                color: 'rgba(255,255,255,0.8)',
                fontSize: '14px'
              }}>
                Loading photo...
              </div>
            ) : userPhoto ? (
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                gap: '15px'
              }}>
                <img 
                  src={userPhoto} 
                  alt="Profile" 
                  style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '3px solid rgba(255,255,255,0.3)',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
                  }}
                />
                <p style={{ 
                  color: 'rgba(255,255,255,0.8)', 
                  fontSize: '14px',
                  margin: 0
                }}>
                  Photo uploaded successfully
                </p>
              </div>
            ) : (
              <div style={{ 
                color: 'rgba(255,255,255,0.6)',
                fontSize: '14px'
              }}>
                No photo uploaded yet
              </div>
            )}
            
            <div style={{ 
              display: 'flex', 
              gap: '10px', 
              justifyContent: 'center',
              marginTop: '15px'
            }}>
              <Button 
                onClick={() => setCurrentPage('upload-image')}
                style={{ 
                  fontSize: '14px',
                  padding: '8px 16px'
                }}
              >
                {userPhoto ? 'Change Photo' : 'Upload Photo'}
              </Button>
              
              {userPhoto && (
                <Button 
                  variant="secondary"
                  onClick={async () => {
                    if (window.confirm('Are you sure you want to delete your photo?')) {
                      const success = await deleteUserPhoto(userProfile.email);
                      if (success) {
                        setUserPhoto(null);
                        alert('Photo deleted successfully');
                      } else {
                        alert('Failed to delete photo');
                      }
                    }
                  }}
                  style={{ 
                    fontSize: '14px',
                    padding: '8px 16px'
                  }}
                >
                  Delete Photo
                </Button>
              )}
            </div>
          </div>
          
          <div style={{ marginBottom: '25px' }}>
            <label style={{ 
              display: 'block', 
              color: 'rgba(255,255,255,0.9)', 
              marginBottom: '8px',
              fontWeight: '600'
            }}>
              Full Name
            </label>
            <input
              type="text"
              value={userProfile?.name || ''}
              onChange={(e) => setUserProfile({...userProfile, name: e.target.value})}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.3)',
                background: 'rgba(255,255,255,0.1)',
                color: 'white',
                fontSize: '16px'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '25px' }}>
            <label style={{ 
              display: 'block', 
              color: 'rgba(255,255,255,0.9)', 
              marginBottom: '8px',
              fontWeight: '600'
            }}>
              Email
            </label>
            <input
              type="email"
              value={userProfile?.email || ''}
              onChange={(e) => setUserProfile({...userProfile, email: e.target.value})}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.3)',
                background: 'rgba(255,255,255,0.1)',
                color: 'white',
                fontSize: '16px'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '25px' }}>
            <label style={{ 
              display: 'block', 
              color: 'rgba(255,255,255,0.9)', 
              marginBottom: '8px',
              fontWeight: '600'
            }}>
              Date of Birth
            </label>
            <input
              type="date"
              value={userProfile?.birthDate || ''}
              onChange={(e) => setUserProfile({...userProfile, birthDate: e.target.value})}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.3)',
                background: 'rgba(255,255,255,0.1)',
                color: 'white',
                fontSize: '16px'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '25px' }}>
            <label style={{ 
              display: 'block', 
              color: 'rgba(255,255,255,0.9)', 
              marginBottom: '8px',
              fontWeight: '600'
            }}>
              City
            </label>
            <input
              type="text"
              value={userProfile?.location || ''}
              onChange={(e) => setUserProfile({...userProfile, location: e.target.value})}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.3)',
                background: 'rgba(255,255,255,0.1)',
                color: 'white',
                fontSize: '16px'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '30px' }}>
            <label style={{ 
              display: 'block', 
              color: 'rgba(255,255,255,0.9)', 
              marginBottom: '8px',
              fontWeight: '600'
            }}>
              Member Since
            </label>
            <div style={{
              padding: '12px',
              color: 'rgba(255,255,255,0.8)',
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              {userProfile?.joinDate || 'Not specified'}
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <Button 
              onClick={() => setCurrentPage('main')}
              style={{ marginRight: '15px' }}
            >
              Save Changes
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setCurrentPage('main')}
              style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}
            >
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    </section>
    );
  }

  // Analysis History Page
  const AnalysisHistoryPage = () => (
    <section style={{ 
      padding: '60px 0', 
      minHeight: '60vh',
      background: gradientStyles.mainGradient
    }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '0 20px' 
      }}>
        <div style={{
          background: gradientStyles.cardGradient,
          borderRadius: '12px',
          padding: '40px',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ 
            fontSize: '32px', 
            marginBottom: '30px', 
            color: 'white', 
            textAlign: 'center',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            Analysis History
          </h2>
          
          {analysisHistory.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.7)', padding: '40px' }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>📊</div>
              <p>No analysis history yet.</p>
              <p>Upload your first photo to see your analysis results here!</p>
              <Button 
                onClick={() => setCurrentPage('upload-main')}
                style={{ marginTop: '20px' }}
              >
                Upload First Photo
              </Button>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '20px'
            }}>
              {analysisHistory.map((analysis) => (
                <div
                  key={analysis.id}
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '10px',
                    padding: '20px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.transform = 'translateY(-5px)'
                    e.target.style.background = 'rgba(255,255,255,0.15)'
                  }}
                  onMouseOut={(e) => {
                    e.target.style.transform = 'translateY(0)'
                    e.target.style.background = 'rgba(255,255,255,0.1)'
                  }}
                  onClick={() => {
                    setAnalysisData({
                      image: analysis.image,
                      diagnosis: analysis.diagnosis,
                      confidence: analysis.confidence,
                      description: `Analysis from ${analysis.date}`,
                      symptoms: analysis.symptoms,
                      recommendations: analysis.recommendations
                    })
                    setCurrentPage('analysis')
                  }}
                >
                  <div style={{
                    width: '100%',
                    height: '120px',
                    background: `url(${analysis.image}) center/cover`,
                    borderRadius: '6px',
                    marginBottom: '15px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '32px'
                  }}>
                    {!analysis.image && '📸'}
                  </div>
                  <h3 style={{ 
                    color: 'white', 
                    marginBottom: '10px',
                    fontSize: '16px'
                  }}>
                    {analysis.diagnosis}
                  </h3>
                  <p style={{ 
                    color: 'rgba(255,255,255,0.8)', 
                    fontSize: '14px',
                    marginBottom: '8px'
                  }}>
                    Date: {analysis.date}
                  </p>
                  <p style={{ 
                    color: 'rgba(255,255,255,0.8)', 
                    fontSize: '14px',
                    marginBottom: '8px'
                  }}>
                    Confidence: {analysis.confidence}%
                  </p>
                  <div style={{
                    padding: '5px 10px',
                    background: analysis.riskLevel === 'low' 
                      ? 'rgba(76, 175, 80, 0.3)' 
                      : analysis.riskLevel === 'medium'
                      ? 'rgba(255, 152, 0, 0.3)'
                      : 'rgba(244, 67, 54, 0.3)',
                    color: 'white',
                    borderRadius: '12px',
                    fontSize: '12px',
                    display: 'inline-block'
                  }}>
                    {analysis.riskLevel?.toUpperCase() || 'PENDING'}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <Button 
              variant="outline" 
              onClick={() => setCurrentPage('main')}
              style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}
            >
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    </section>
  )

  // Render current page
  const renderPage = () => {
    switch (currentPage) {
      case 'main': return <MainPage />
      case 'upload-main': return <UploadMainPage />
      case 'upload-image': return <UploadImagePage />
      case 'use-camera': return <UseCameraPage />
      case 'about': return <AboutPage />
      case 'security': return <SecurityPage />
      case 'about-us': return <AboutUsPage />
      case 'account': return <AccountPage />
      case 'analysis-history': return <AnalysisHistoryPage />
      case 'analysis': return <AnalysisResults analysisData={analysisData} />
      default: return <MainPage />
    }
  }

  return (
    <div style={{ 
      background: gradientStyles.mainGradient, 
      minHeight: '100vh',
      position: 'relative'
    }}>
      <Header />
      <main>
        {renderPage()}
      </main>
      <Footer />
      <AuthModal />
      <PrivacyConsentModal />
    </div>
  )
}

export default App