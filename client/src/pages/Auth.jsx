import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../service/api.js';
import { register } from '../service/api.js';

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
  const handleSignIn = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
    const validateEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
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
      alert(error.response?.data?.message || 'Login failed. Please try again.');
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
  return (
    <div className="flex h-screen w-screen bg-gradient-to-br from-gray-900 to-black items-center justify-center">
      <div className="relative w-full max-w-4xl h-[600px] rounded-3xl shadow-2xl overflow-hidden flex">
        {/* Forms Side by Side */}
        <div className="flex w-full h-full">
          {/* Sign In Form */}
          <div className="w-1/2 bg-white flex flex-col justify-center items-center p-10 z-10">
            <div className="w-full max-w-sm flex flex-col items-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <img src="/iconblack.svg" alt="icon" className="w-9 h-9" />
                <span className="font-bold text-black text-3xl">Air Fetch</span>
              </div>
              <p className="mb-8 text-center text-gray-800">Sign in to access your files and manage your cloud storage.</p>
              <form className="w-full flex flex-col gap-4 animate-fade-in" onSubmit={handleSignIn}>
                <input type="email" placeholder="Email" className="px-4 py-2 rounded-lg border border-gray-300 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                value={loginData.login} 
                onChange={(e) => setLoginData({ ...loginData, login: e.target.value })} 
                required />
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    className="px-4 py-2 rounded-lg border border-gray-300 b  g-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-blue-500"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <button 
                  type="submit" 
                  className={`bg-blue-600 text-white py-2 rounded-lg font-semibold transition-colors ${
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
              <div className="mt-6 w-full">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <div className="h-px flex-1 bg-gray-400" />
                  Or
                  <div className="h-px flex-1 bg-gray-400" />
                </div>
              </div>
              <div className="mt-4 w-full">
                <button className="flex items-center justify-center w-full bg-white text-gray-800 font-semibold py-2 rounded-lg shadow hover:bg-gray-100 transition-colors border border-gray-300">
                  <GoogleLogo />
                  <span>Sign in with Google</span>
                </button>
              </div>
              <div className="mt-8">
                <span className="text-opacity-80">Don't have an account?</span>
                <button
                  className="ml-2 font-semibold underline transition-colors duration-300 hover:text-blue-400"
                  onClick={() => setIsLogin(false)}
                  type="button"
                >
                  Sign Up
                </button>
              </div>
            </div>
          </div>
          {/* Sign Up Form */}
          <div className="w-1/2 bg-white flex flex-col justify-center items-center p-10 z-10">
            <div className="w-full max-w-sm flex flex-col items-center">
              <h1 className="text-3xl font-bold mb-4 text-gray-800">Create Account</h1>
              <p className="mb-8 text-center text-gray-800">Sign up to start storing and sharing your files securely.</p>
              <form className="w-full flex flex-col gap-4 animate-fade-in" onSubmit={handleSignUp} >
                <input type="text" placeholder="Username" className="px-4 py-2 rounded-lg border border-gray-300 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                value={formData.name} 
                onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                required />
                <input type="email" placeholder="Email" className="px-4 py-2 rounded-lg border border-gray-300 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                value={formData.email} 
                onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                required />
                <input type="password" placeholder="Password" className="px-4 py-2 rounded-lg border border-gray-300 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                value={formData.password} 
                onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
                required />
                <button 
                  type="submit" 
                  className={`bg-blue-600 text-white py-2 rounded-lg font-semibold transition-colors ${
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
              <div className="mt-6 w-full">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <div className="h-px flex-1 bg-gray-400" />
                  Or
                  <div className="h-px flex-1 bg-gray-400" />
                </div>
              </div>
              <div className="mt-4 w-full">
                <button className="flex items-center justify-center w-full bg-white text-gray-800 font-semibold py-2 rounded-lg shadow hover:bg-gray-100 transition-colors border border-gray-300">
                  <GoogleLogo />
                  <span>Sign up with Google</span>
                </button>
              </div>
              <div className="mt-8">
                <span className="text-opacity-80">Already have an account?</span>
                <button
                  className="ml-2 font-semibold underline transition-colors duration-300 hover:text-blue-400"
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
        <div className={`absolute top-0 left-0 w-1/2 h-full z-20 transition-transform duration-700 bg-blue-600 flex flex-col justify-center items-center
          ${isLogin ? 'translate-x-full' : 'translate-x-0'}
        `}>
          <div className="flex flex-col justify-center items-center h-full p-10 text-white">
            <h2 className="text-3xl font-bold mb-4">{isLogin ? 'Welcome Back!' : 'Hello, Friend!'}</h2>
            <p className="mb-8 text-lg text-center max-w-xs">
              {isLogin
                ? 'To keep connected with us please login with your personal info.' : 'Enter your personal details and start your journey with us.'}
            </p>
            <button
              className="bg-white text-blue-600 font-semibold px-8 py-2 rounded-full shadow hover:bg-gray-100 transition-colors"
              onClick={() => setIsLogin(!isLogin)}
              type="button"
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
