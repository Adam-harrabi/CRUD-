import React from 'react';

const AccessDenied = () => {
  const handleGoBack = () => {
    const userRole = localStorage.getItem('userRole');
    if (userRole === 'sos') {
      window.location.href = '/provide-access';
    } else if (userRole === 'admin') {
      window.location.href = '/dashboard';
    } else {
      window.location.href = '/signin';
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
      fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif'
    }}>
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        padding: '3rem 2rem',
        borderRadius: '16px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.1)',
        textAlign: 'center',
        maxWidth: '450px',
        width: '100%',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <div style={{
          color: '#dc2626',
          marginBottom: '1.5rem',
          animation: 'pulse 2s infinite'
        }}>
          <svg
            width="80"
            height="80"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ margin: '0 auto', filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))' }}
          >
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
        </div>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: '700',
          color: '#4a5568',
          WebkitBackgroundClip: 'text',
          
          marginBottom: '1rem',
          letterSpacing: '-0.02em'
        }}>
          Access Denied
        </h1>
        <p style={{
          color: '#4a5568',
          marginBottom: '2.5rem',
          lineHeight: '1.6',
          fontSize: '1.1rem'
        }}>
          You don't have permission to access this page. Please contact your administrator if you believe this is an error.
        </p>
        <button 
          onClick={handleGoBack}
          style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
            color: 'white',
            padding: '1rem 2rem',
            border: 'none',
            borderRadius: '12px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}
          onMouseOver={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.5)';
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
          }}
        >
          Go Back to Home
        </button>
      </div>
    </div>
  );
};

export default AccessDenied;