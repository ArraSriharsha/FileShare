import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register, googleAuth } from '../service/api.js';

const GoogleLogo = () => (
  <svg className="w-5 h-5 mr-2" viewBox="0 0 48 48">
    <g>
      <path fill="#4285F4" d="M24 9.5c3.54 0 6.7 1.22 9.19 3.22l6.85-6.85C35.64 2.36 30.18 0 24 0 14.82 0 6.71 5.82 2.69 14.09l7.98 6.19C12.13 13.13 17.57 9.5 24 9.5z" />
      <path fill="#34A853" d="M46.1 24.55c0-1.64-.15-3.22-.43-4.74H24v9.01h12.42c-.54 2.9-2.18 5.36-4.65 7.01l7.19 5.6C43.98 37.36 46.1 31.45 46.1 24.55z" />
      <path fill="#FBBC05" d="M10.67 28.28A14.5 14.5 0 0 1 9.5 24c0-1.49.25-2.93.7-4.28l-7.98-6.19A23.94 23.94 0 0 0 0 24c0 3.77.9 7.34 2.49 10.47l8.18-6.19z" />
      <path fill="#EA4335" d="M24 48c6.18 0 11.36-2.05 15.14-5.59l-7.19-5.6c-2.01 1.35-4.59 2.15-7.95 2.15-6.43 0-11.87-3.63-14.33-8.81l-8.18 6.19C6.71 42.18 14.82 48 24 48z" />
      <path fill="none" d="M0 0h48v48H0z" />
    </g>
  </svg>
);

const Spinner = () => (
  <div className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
);

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showSetPassword, setShowSetPassword] = useState(false);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  
  const [loginData, setLoginData] = useState({
    login: '',
    password: ''
  });

  const [setPasswordData, setSetPasswordData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Initialize Google OAuth
  useEffect(() => {
    const loadGoogleScript = () => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);

      script.onload = () => {
        if (window.google) {
          window.google.accounts.id.initialize({
            client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
            callback: handleGoogleSignIn,
            auto_select: false,
            cancel_on_tap_outside: true,
          });

          window.google.accounts.id.renderButton(
            document.getElementById('google-signin-button'),
            { 
              theme: 'outline', 
              size: 'large',
              width: '280',
              text: 'continue_with'
            }
          );
        }
      };
    };

    loadGoogleScript();
  }, []);

  const handleGoogleSignIn = async (response) => {
    if (response.credential) {
      setIsGoogleLoading(true);
      try {
        console.log('Google sign-in response received');
        console.log('Token length:', response.credential.length);
        
        const result = await googleAuth(response.credential);
        console.log('Backend response:', result);
        
        if (result && result.status === 200) {
          console.log('Google auth successful, redirecting...');
          window.location.href = '/';
        } else {
          console.error('Google auth failed:', result);
          alert('Google authentication failed. Please try again.');
        }
      } catch (error) {
        console.error('Google auth error:', error);
        console.error('Error response:', error.response?.data);
        alert(error.response?.data?.message || 'Google authentication failed. Please try again.');
      } finally {
        setIsGoogleLoading(false);
      }
    } else {
      console.error('No credential received from Google');
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const validateEmail = /^[^\s@]+@[^\s@]+\.(ac\.in|[a-z]{2,})$/.test(loginData.login);
      if (!validateEmail) {
        alert('Please enter a valid email');
        return;
      }
      const response = await login(loginData);
      if (response && response.status === 200) {
        // Success - cookies are automatically set by the server
        window.location.href = '/';
      } else {
        alert('Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle specific case for Google OAuth users who need to set password
      if (error.response?.data?.needsPassword) {
        alert('This account was created with Google OAuth. Please use Google Sign-In or click "Set Password for Google Account" to create a password.');
        setShowSetPassword(true);
        setSetPasswordData({ ...setPasswordData, email: loginData.login });
      } else {
        alert(error.response?.data?.message || 'Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }

  const handleSignUp = async (e) => {
    e.preventDefault();
    const validateFields = Object.values(formData).every(value => value.trim() !== '');
    if (!validateFields) {
      alert('Please fill all the fields');
      return;
    }
    const validateEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
    if (!validateEmail) {
      alert('Please enter a valid email');
      return;
    }
    setIsLoading(true);
    try {
      const response = await register(formData);
      if (response && response.status === 200) {
        // Success - cookies are automatically set by the server
        window.location.href = '/';
      } else {
        alert('Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  const handleSetPassword = async (e) => {
    e.preventDefault();
    
    // Validate email
    const validateEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(setPasswordData.email);
    if (!validateEmail) {
      alert('Please enter a valid email');
      return;
    }
    
    // Validate password
    if (setPasswordData.password.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }
    
    // Validate password confirmation
    if (setPasswordData.password !== setPasswordData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    
    setIsLoading(true);
    try {
      // Call API to set password for Google OAuth user
      const response = await fetch('https://api.airfetch.online/auth/set-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email: setPasswordData.email,
          password: setPasswordData.password
        })
      });
      
      if (response.ok) {
        alert('Password set successfully! You can now use email/password authentication.');
        setShowSetPassword(false);
        setSetPasswordData({ email: '', password: '', confirmPassword: '' });
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to set password. Please try again.');
      }
    } catch (error) {
      console.error('Set password error:', error);
      alert('Failed to set password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="flex h-screen w-screen bg-gradient-to-br from-gray-900 to-black items-center justify-center p-4">
      <div className="relative w-full max-w-4xl h-[600px] rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row">
        {/* Forms Side by Side */}
        <div className="flex w-full h-full flex-col lg:flex-row">
          {/* Sign In Form */}
          <div className="w-full lg:w-1/2 bg-white flex flex-col justify-center items-center p-4 sm:p-6 lg:p-10 z-10">
            <div className="w-full max-w-sm flex flex-col items-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <img src="/iconblack.svg" alt="icon" className="w-7 h-7 sm:w-9 sm:h-9" />
                <span className="font-bold text-black text-2xl sm:text-3xl">Air Fetch</span>
              </div>
              <p className="mb-6 sm:mb-8 text-center text-gray-800 text-sm sm:text-base">Sign in to access your files and manage your cloud storage.</p>
              <form className="w-full flex flex-col gap-3 sm:gap-4 animate-fade-in" onSubmit={handleSignIn}>
                <input type="email" placeholder="Email" className="px-3 sm:px-4 py-2 rounded-lg border border-gray-300 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base" 
                value={loginData.login} 
                onChange={(e) => setLoginData({ ...loginData, login: e.target.value })} 
                required />
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    className="px-3 sm:px-4 py-2 rounded-lg border border-gray-300 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full text-sm sm:text-base"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-xs sm:text-sm text-blue-500"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <button 
                  type="submit" 
                  className={`bg-blue-600 text-white py-2 rounded-lg font-semibold transition-colors text-sm sm:text-base ${
                    isLoading 
                      ? 'bg-blue-500 cursor-not-allowed opacity-75' 
                      : 'hover:bg-blue-700'
                  }`} 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <Spinner />
                      <span className="ml-2">Signing In...</span>
                    </div>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>
              <div className="mt-4 sm:mt-6 w-full">
                <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-gray-500">
                  <div className="h-px flex-1 bg-gray-400" />
                  Or
                  <div className="h-px flex-1 bg-gray-400" />
                </div>
              </div>
              <div className="mt-3 sm:mt-4 w-full flex justify-center">
                <div id="google-signin-button"></div>
                {isGoogleLoading && (
                  <div className="mt-2 text-center">
                    <Spinner />
                    <span className="ml-2 text-xs sm:text-sm text-gray-600">Signing in with Google...</span>
                  </div>
                )}
              </div>
              <div className="mt-6 sm:mt-8 text-center">
                <span className="text-opacity-80 text-sm sm:text-base">Don't have an account?</span>
                <button
                  className="ml-2 font-semibold underline transition-colors duration-300 hover:text-blue-400 text-sm sm:text-base"
                  onClick={() => setIsLogin(false)}
                  type="button"
                >
                  Sign Up
                </button>
              </div>
              <div className="mt-2 text-center">
                <button
                  className="text-xs sm:text-sm text-gray-500 underline hover:text-blue-400 transition-colors"
                  onClick={() => setShowSetPassword(true)}
                  type="button"
                >
                  Set Password for Google Account
                </button>
              </div>
            </div>
          </div>
          {/* Sign Up Form */}
          <div className="w-full lg:w-1/2 bg-white flex flex-col justify-center items-center p-4 sm:p-6 lg:p-10 z-10">
            <div className="w-full max-w-sm flex flex-col items-center">
              <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-800">Create Account</h1>
              <p className="mb-6 sm:mb-8 text-center text-gray-800 text-sm sm:text-base">Sign up to start storing and sharing your files securely.</p>
              <form className="w-full flex flex-col gap-3 sm:gap-4 animate-fade-in" onSubmit={handleSignUp} >
                <input type="text" placeholder="Username" className="px-3 sm:px-4 py-2 rounded-lg border border-gray-300 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base" 
                value={formData.name} 
                onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                required />
                <input type="email" placeholder="Email" className="px-3 sm:px-4 py-2 rounded-lg border border-gray-300 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base" 
                value={formData.email} 
                onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                required />
                <input type="password" placeholder="Password" className="px-3 sm:px-4 py-2 rounded-lg border border-gray-300 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base" 
                value={formData.password} 
                onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
                required />
                <button 
                  type="submit" 
                  className={`bg-blue-600 text-white py-2 rounded-lg font-semibold transition-colors text-sm sm:text-base ${
                    isLoading 
                      ? 'bg-blue-500 cursor-not-allowed opacity-75' 
                      : 'hover:bg-blue-700'
                  }`} 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <Spinner />
                      <span className="ml-2">Signing Up...</span>
                    </div>
                  ) : (
                    'Sign Up'
                  )}
                </button>
              </form>
              
              <div className="mt-6 sm:mt-8 text-center">
                <span className="text-opacity-80 text-sm sm:text-base">Already have an account?</span>
                <button
                  className="ml-2 font-semibold underline transition-colors duration-300 hover:text-blue-400 text-sm sm:text-base"
                  onClick={() => setIsLogin(true)}
                  type="button"
                >
                  Sign In
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* Overlay Panel - slides left/right above forms */}
        <div className={`absolute top-0 left-0 w-full lg:w-1/2 h-full z-20 transition-transform duration-700 bg-blue-600 flex flex-col justify-center items-center
          ${isLogin ? 'translate-x-full lg:translate-x-full' : 'translate-x-0 lg:translate-x-0'}
        `}>
          <div className="flex flex-col justify-center items-center h-full p-4 sm:p-6 lg:p-10 text-white">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-center">{isLogin ? 'Welcome Back!' : 'Hello, Friend!'}</h2>
            <p className="mb-6 sm:mb-8 text-base sm:text-lg text-center max-w-xs">
              {isLogin
                ? 'To keep connected with us please login with your personal info.' : 'Enter your personal details and start your journey with us.'}
            </p>
            <button
              className="bg-white text-blue-600 font-semibold px-6 sm:px-8 py-2 rounded-full shadow hover:bg-gray-100 transition-colors text-sm sm:text-base"
              onClick={() => setIsLogin(!isLogin)}
              type="button"
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </div>
        </div>
      </div>

      {/* Set Password Modal */}
      {showSetPassword && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">Set Password</h2>
              <button
                onClick={() => {
                  setShowSetPassword(false);
                  setSetPasswordData({ email: '', password: '', confirmPassword: '' });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <p className="text-gray-600 mb-4 text-sm sm:text-base">
              Set a password for your Google account to enable email/password authentication.
            </p>
            
            <form onSubmit={handleSetPassword} className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="Enter your Google account email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  value={setPasswordData.email}
                  onChange={(e) => setSetPasswordData({ ...setPasswordData, email: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  placeholder="Enter new password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  value={setPasswordData.password}
                  onChange={(e) => setSetPasswordData({ ...setPasswordData, password: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  placeholder="Confirm new password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  value={setPasswordData.confirmPassword}
                  onChange={(e) => setSetPasswordData({ ...setPasswordData, confirmPassword: e.target.value })}
                  required
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowSetPassword(false);
                    setSetPasswordData({ email: '', password: '', confirmPassword: '' });
                  }}
                  className="flex-1 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`flex-1 px-3 sm:px-4 py-2 rounded-lg text-white font-medium transition-colors text-sm sm:text-base ${
                    isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isLoading ? 'Setting Password...' : 'Set Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
