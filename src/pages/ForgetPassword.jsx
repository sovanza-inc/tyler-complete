import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../assets/css/forgot.css';

const ForgetPassword = () => {
  const [formData, setFormData] = useState({
    email: '',
    otp: ['', '', '', ''], // Array to store each digit of the OTP
    newPassword: '',
    confirmPassword: '',
  });
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(120); // 120 seconds
  const navigate = useNavigate();
  const otpInputs = useRef([]); // Refs for OTP input fields

  // Timer logic
  useEffect(() => {
    let interval;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (timer === 0) {
      setError('OTP expired. Please request a new OTP.');
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  // Handle OTP input change
  const handleOtpChange = (index, value) => {
    const newOtp = [...formData.otp];
    newOtp[index] = value.replace(/\D/g, ''); // Allow only digits
    setFormData({ ...formData, otp: newOtp });

    // Auto-focus to the next input
    if (value && index < 3) {
      otpInputs.current[index + 1].focus();
    }
  };

  // Handle OTP input backspace
  const handleOtpBackspace = (index) => {
    if (index > 0 && !formData.otp[index]) {
      otpInputs.current[index - 1].focus();
    }
  };

  // Validate OTP
  const validateOTP = () => {
    if (formData.otp.some((digit) => !digit)) {
      setError('Please enter a valid 4-digit OTP');
      return false;
    }
    return true;
  };

  // Handle Verify OTP
  const handleVerifyOTP = async () => {
    if (!validateOTP()) return;

    setIsLoading(true);
    setError('');

    try {
      const otp = formData.otp.join(''); // Combine OTP digits into a single string
      const response = await fetch('http://localhost:5000/api/auth/confirm-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: formData.email, otp: otp.toString() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid OTP');
      }

      // Move to new password step
      setStep(3);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear error when user starts typing
    if (error) setError('');
  };

  const validateEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      setError('Email is required');
      return false;
    }
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    return true;
  };

  const validateNewPassword = () => {
    if (!formData.newPassword || !formData.confirmPassword) {
      setError('All fields are required');
      return false;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (formData.newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    return true;
  };

  const handleSendOTP = async () => {
    if (!validateEmail()) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/generate-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send OTP');
      }

      // Move to OTP verification step and reset timer
      setStep(2);
      setTimer(120);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!validateNewPassword()) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          newPassword: formData.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      // Redirect to success page
      navigate('/password-reset-success');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Forgot Password</h2>
          <p>
            {step === 1 && "Enter your email address, and we'll send you an OTP."}
            {step === 2 && "Enter the OTP sent to your email."}
            {step === 3 && "Set a new password for your account."}
          </p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (step === 1) handleSendOTP();
            else if (step === 2) handleVerifyOTP();
            else if (step === 3) handleResetPassword();
          }}
          className="auth-form"
        >
          {step === 1 && (
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                disabled={isLoading}
                autoComplete="email"
              />
            </div>
          )}

          {step === 2 && (
            <>
              <div className="otp-input-group">
                {[0, 1, 2, 3].map((index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength={1}
                    value={formData.otp[index]}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace') {
                        handleOtpBackspace(index);
                      }
                    }}
                    ref={(el) => (otpInputs.current[index] = el)}
                    disabled={isLoading}
                    className="otp-input"
                  />
                ))}
              </div>
              <div className="otp-timer">
                Time remaining: {Math.floor(timer / 60)}:{timer % 60 < 10 ? `0${timer % 60}` : timer % 60}
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="Enter new password"
                  disabled={isLoading}
                />
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm new password"
                  disabled={isLoading}
                />
              </div>
            </>
          )}

          <button type="submit" disabled={isLoading}>
            {isLoading
              ? 'Processing...'
              : step === 1
              ? 'Send OTP'
              : step === 2
              ? 'Verify OTP'
              : 'Reset Password'}
          </button>
        </form>

        <div className="auth-footer">
          {step === 1 && (
            <>
              Skip, I'll <Link to="/signin">Sign In now</Link>
            </>
          )}
          {step === 2 && (
            <button
              onClick={() => setStep(1)}
              className="auth-link-back"
              disabled={isLoading}
            >
              Go Back
            </button>
          )}
          {step === 3 && (
            <button
              onClick={() => setStep(2)}
              className="auth-link-back"
              disabled={isLoading}
            >
              Go Back
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgetPassword;