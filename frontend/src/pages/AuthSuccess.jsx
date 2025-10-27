import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaSpinner } from 'react-icons/fa';

const AuthSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      // Store token in localStorage
      localStorage.setItem('token', token);
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } else {
      // No token, redirect to signin with error
      navigate('/signin?error=auth_failed');
    }
  }, [searchParams, navigate]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      gap: '1rem'
    }}>
      <FaSpinner style={{ fontSize: '3rem', animation: 'spin 1s linear infinite' }} />
      <h2>Authenticating...</h2>
      <p>Please wait while we sign you in.</p>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AuthSuccess;
