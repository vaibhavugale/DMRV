import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:3333/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      login(data.token, data.user);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'An error occurred during login');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-background">
        <div className="glass-circle circle-1"></div>
        <div className="glass-circle circle-2"></div>
      </div>
      
      <div className="login-card-container">
        <div className="login-card">
          <div className="login-header">
            <div className="login-logo">
              <div className="logo-icon">🌿</div>
              <div className="logo-text">
                <span className="brand-name">DMRV</span>
                <span className="brand-sub">Admin Portal</span>
              </div>
            </div>
            <h1>Welcome Back</h1>
            <p>Enter your credentials to access the dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {error && (
              <div className="login-error">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-with-icon">
                <span className="input-icon">✉️</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@dmrv.org"
                  required
                  className="login-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-with-icon">
                <span className="input-icon">🔒</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="login-input"
                />
              </div>
            </div>

            <div className="form-actions">
              <div className="remember-me">
                <input type="checkbox" id="remember" />
                <label htmlFor="remember">Remember me</label>
              </div>
              <a href="#" className="forgot-password">Forgot password?</a>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`login-button ${isSubmitting ? 'loading' : ''}`}
            >
              {isSubmitting ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <div className="login-footer">
            <p>© 2026 DMRV Project. Securing and Tracking Natural Capital.</p>
          </div>
        </div>
      </div>

      <style>{`
        .login-page {
          height: 100vh;
          width: 100vw;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #064e3b;
          overflow: hidden;
          position: relative;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
        }

        .login-background {
          position: absolute;
          inset: 0;
          z-index: 1;
        }

        .glass-circle {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.5;
        }

        .circle-1 {
          width: 500px;
          height: 500px;
          background: #10b981;
          top: -100px;
          right: -100px;
          animation: float 15s infinite alternate;
        }

        .circle-2 {
          width: 400px;
          height: 400px;
          background: #34d399;
          bottom: -50px;
          left: -50px;
          animation: float 12s infinite alternate-reverse;
        }

        @keyframes float {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }

        .login-card-container {
          z-index: 2;
          width: 100%;
          max-width: 440px;
          padding: 20px;
        }

        .login-card {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 24px;
          padding: 40px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          color: white;
        }

        .login-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .login-logo {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-bottom: 24px;
        }

        .logo-icon {
          font-size: 32px;
          background: rgba(16, 185, 129, 0.2);
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .brand-name {
          display: block;
          font-size: 24px;
          font-weight: 800;
          letter-spacing: -0.5px;
          line-height: 1;
        }

        .brand-sub {
          font-size: 12px;
          color: #a7f3d0;
          text-transform: uppercase;
          letter-spacing: 2px;
          font-weight: 600;
        }

        .login-header h1 {
          font-size: 28px;
          font-weight: 700;
          margin: 0 0 8px 0;
          letter-spacing: -0.5px;
        }

        .login-header p {
          color: #94a3b8;
          font-size: 14px;
          margin: 0;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .login-error {
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #fca5a5;
          padding: 12px;
          border-radius: 12px;
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-label {
          font-size: 13px;
          font-weight: 600;
          color: #cbd5e1;
          margin-left: 4px;
        }

        .input-with-icon {
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 16px;
          opacity: 0.6;
        }

        .login-input {
          width: 100%;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
          padding: 12px 14px 12px 42px;
          border-radius: 12px;
          font-size: 15px;
          transition: all 0.2s;
          outline: none;
        }

        .login-input:focus {
          background: rgba(255, 255, 255, 0.1);
          border-color: #10b981;
          box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.15);
        }

        .login-input::placeholder {
          color: rgba(255, 255, 255, 0.3);
        }

        .form-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 13px;
        }

        .remember-me {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #94a3b8;
          cursor: pointer;
        }

        .remember-me input {
          cursor: pointer;
        }

        .forgot-password {
          color: #10b981;
          font-weight: 600;
          text-decoration: none;
        }

        .forgot-password:hover {
          text-decoration: underline;
        }

        .login-button {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          border: none;
          padding: 14px;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.3);
          margin-top: 10px;
        }

        .login-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 25px -5px rgba(16, 185, 129, 0.4);
          background: linear-gradient(135deg, #34d399, #10b981);
        }

        .login-button:active {
          transform: translateY(0);
        }

        .login-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .login-footer {
          margin-top: 40px;
          text-align: center;
          color: #64748b;
          font-size: 12px;
          line-height: 1.6;
        }
      `}</style>
    </div>
  );
}
