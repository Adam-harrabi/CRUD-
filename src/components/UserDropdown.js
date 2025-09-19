import React, { useState, useEffect, useRef } from 'react';

const UserDropdown = ({ onRefresh }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const dropdownRef = useRef(null);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem("token");
      console.log("Token found:", !!token); // Debug log
      
      if (!token) {
        console.log("No token - user not logged in");
        setUserData(null);
        setLoading(false);
        return;
      }

      const response = await fetch("http://localhost:5000/api/auth/me", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token is invalid/expired
          console.log("Token invalid - clearing localStorage");
          localStorage.clear();
          setUserData(null);
          setLoading(false);
          return;
        }
        throw new Error("Failed to fetch user data");
      }

      const data = await response.json();
      console.log("API Response:", data); // Debug log to see what you're getting
      setUserData(data.user);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching user:", error);
      setError(error.message);
      setLoading(false);
    }
  };

  // Expose refresh method to parent component
  useEffect(() => {
    if (onRefresh) {
      onRefresh.current = fetchUserData;
    }
  }, [onRefresh]);

  // Fetch user data from backend
  useEffect(() => {
    fetchUserData();
    
    // Listen for storage changes (like when user logs in from another tab)
    const handleStorageChange = () => {
      console.log("Storage changed - refetching user data");
      fetchUserData();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const toggleDropdown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Toggle clicked, current state:", isOpen); // Debug log
    setIsOpen(!isOpen);
  };

  const handleSignOut = (e) => {
    e.stopPropagation();
    localStorage.clear();
    window.location.href = '/signin';
  };

  const handleProfileClick = (e) => {
    e.stopPropagation();
    window.location.href = '/profile';
  };

  // Show loading state
  if (loading) {
    return (
      <div style={{
        position: 'fixed',
        bottom: '10px',
        left: '10px',
        zIndex: 1000
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: '#e0e0e0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          color: '#666',
          border: '3px solid #fff',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
        }}>
          Loading...
        </div>
      </div>
    );
  }

  // Don't show anything if user is not logged in
  if (!loading && !userData && !error) {
    return null;
  }

  // Show error state
  if (error) {
    return (
      <div style={{
        position: 'fixed',
        bottom: '10px',
        left: '10px',
        zIndex: 1000
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: '#dc3545',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px',
          color: '#fff',
          border: '3px solid #fff',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
          cursor: 'pointer'
        }}
        onClick={toggleDropdown}
        title={`Error: ${error}`}
        >
          !
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={dropdownRef}
      style={{
        position: 'fixed',
        bottom: '10px',
        left: '10px',
        zIndex: 1000
      }}
    >
      <div 
        onClick={toggleDropdown}
        style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          overflow: 'hidden',
          cursor: 'pointer',
          backgroundColor: '#e0e0e0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px',
          fontWeight: 'bold',
          color: '#666',
          border: '3px solid #fff',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
          userSelect: 'none',
          transition: 'transform 0.1s ease',
          transform: isOpen ? 'scale(0.95)' : 'scale(1)'
        }}
        onMouseEnter={(e) => {
          if (!isOpen) e.target.style.backgroundColor = '#d0d0d0';
        }}
        onMouseLeave={(e) => {
          if (!isOpen) e.target.style.backgroundColor = '#e0e0e0';
        }}
      >
        {userData 
          ? `${userData.firstName?.[0] || ''}${userData.lastName?.[0] || ''}`.toUpperCase() 
          : 'JD'}
      </div>
      
      {isOpen && (
        <div style={{
          position: 'absolute',
          bottom: '70px',
          left: '0',
          background: '#fff',
          border: '1px solid #ddd',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          width: '220px',
          zIndex: 1001,
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <style>
            {`
              @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
              }
            `}
          </style>
          
          {userData && (
            <>
              <div style={{
                padding: '12px',
                borderBottom: '1px solid #ddd',
                textAlign: 'center',
                backgroundColor: '#f8f9fa'
              }}>
                <strong style={{ color: '#333' }}>
                  {userData.firstName} {userData.lastName}
                </strong>
                <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                  {userData.email}
                </div>
              </div>
              
              <ul style={{
                listStyle: 'none',
                margin: 0,
                padding: 0
              }}>
                <li 
                  onClick={handleProfileClick}
                  style={{
                    padding: '12px 16px',
                    cursor: 'pointer',
                    borderBottom: '1px solid #f0f0f0',
                    transition: 'background-color 0.2s',
                    userSelect: 'none'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f4f4f4'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  👤 Your Profile
                </li>
                
                <li 
                  onClick={handleSignOut}
                  style={{
                    padding: '12px 16px',
                    cursor: 'pointer',
                    color: '#dc3545',
                    transition: 'background-color 0.2s',
                    userSelect: 'none'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f4f4f4'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  🚪 Sign Out
                </li>
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default UserDropdown;