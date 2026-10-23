'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import API from '../../../services/api';
import Button from '../../../components/atoms/Button';
import Input from '../../../components/atoms/Input';
import FormField from '../../../components/molecules/FormField';
import {
  AlertCircle,
  CheckCircle2,
  KeyRound,
  Mail,
  ArrowLeft,
  UserPlus,
  Lock,
  Clock,
  ShieldCheck,
  Eye,
  EyeOff,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  // Mode: 'login' | 'forgot' | 'register'
  const [mode, setMode] = useState('login');

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Forgot password state
  const [forgotStep, setForgotStep] = useState(1); // 1 = enter email, 2 = enter otp & new password
  const [forgotEmail, setForgotEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Register form state
  const [regForm, setRegForm] = useState({
    fullName: '',
    username: '',
    email: '',
    phone: '',
    department: 'Computer Science',
    year: '3rd Year',
    studentId: '',
    password: '',
    confirmPassword: '',
  });
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [registeredSuccess, setRegisteredSuccess] = useState(false);

  // Handle standard Login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed. Please check your credentials.');
      setLoading(false);
    }
  };

  // Handle Request Password Reset OTP
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await API.post('/auth/forgot-password', { email: forgotEmail });
      if (res.data.success) {
        setForgotStep(2);
        setSuccessMsg(
          res.data.message || `A 6-digit OTP code has been sent to ${forgotEmail}. Please check your inbox.`
        );
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to send OTP code. Please verify your email.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Verify OTP & Reset Password
  const handleVerifyOtpAndReset = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);

    try {
      const res = await API.post('/auth/reset-password-otp', {
        email: forgotEmail,
        otp: otp.trim(),
        newPassword,
      });

      if (res.data.success) {
        setSuccessMsg('Your password has been successfully reset! You can now sign in with your new password.');
        setEmail(forgotEmail);
        setPassword('');
        setOtp('');
        setNewPassword('');
        setConfirmPassword('');
        setForgotStep(1);
        setMode('login');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to reset password. Please check your OTP code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen min-h-[100dvh] bg-slate-100 flex flex-col justify-center py-6 sm:py-10 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md mx-auto my-auto flex flex-col justify-center">
        {/* College & Club Branding Header */}
        <div className="w-full text-center">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-[3px] sm:border-4 border-cyan-500 shadow-lg sm:shadow-xl shadow-cyan-500/20 mx-auto bg-slate-950">
            <img
              src="/logo.jpg"
              alt="Data Science Club Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <h2 className="mt-3 sm:mt-4 text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            DSCLUB EXPENSE TRACKER
          </h2>
          <p className="mt-1 text-[11px] sm:text-xs font-semibold text-cyan-700 uppercase tracking-wide sm:tracking-wider px-2">
            Data Science Club – Empowering the Future with AI
          </p>
        </div>

        <div className="mt-4 sm:mt-6 w-full">
          <div className="bg-white py-6 px-5 sm:py-8 sm:px-10 shadow-xl rounded-2xl border border-slate-200/80">

            {/* Success Banner */}
            {successMsg && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-xs text-emerald-800 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span className="break-words">{successMsg}</span>
              </div>
            )}

            {/* Error Banner */}
            {error && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-700 font-semibold">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span className="break-words">{error}</span>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 1. SIGN IN MODE                                                           */}
            {/* ========================================================================= */}
            {mode === 'login' && (
              <>
                <div className="mb-4 sm:mb-6 text-center">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">Sign In to Your Account</h3>
                  <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1">Enter your credentials to access the expense portal</p>
                </div>

                <form className="space-y-3.5 sm:space-y-4" onSubmit={handleSubmit}>
                  <FormField label="Email Address" required>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="user@clubfund.edu"
                      required
                    />
                  </FormField>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Password <span className="text-rose-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setError('');
                          setSuccessMsg('');
                          setForgotEmail(email);
                          setForgotStep(1);
                          setMode('forgot');
                        }}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors p-1"
                        tabIndex={-1}
                        title={showPassword ? 'Hide password' : 'View password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full font-bold shadow-md shadow-blue-500/20 mt-2"
                    loading={loading}
                  >
                    Sign In to DSCLUB Portal
                  </Button>
                </form>
              </>
            )}

            {/* ========================================================================= */}
            {/* 2. FORGOT PASSWORD (OTP VERIFICATION VIA EMAIL)                           */}
            {/* ========================================================================= */}
            {mode === 'forgot' && (
              <div>
                {/* Header */}
                <div className="flex items-center gap-2 mb-4 sm:mb-5">
                  <button
                    type="button"
                    onClick={() => {
                      setError('');
                      setSuccessMsg('');
                      if (forgotStep === 2) {
                        setForgotStep(1);
                      } else {
                        setMode('login');
                      }
                    }}
                    className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                    title="Go Back"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900">
                      {forgotStep === 1 ? 'Reset Your Password' : 'Enter Verification OTP'}
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      {forgotStep === 1
                        ? 'We will send a 6-digit OTP code to your registered email'
                        : `Enter the code sent to ${forgotEmail}`}
                    </p>
                  </div>
                </div>

                {/* STEP 1: Enter Email */}
                {forgotStep === 1 && (
                  <form onSubmit={handleSendOtp} className="space-y-3.5 sm:space-y-4">
                    <div className="p-3 sm:p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 space-y-1">
                      <p className="font-semibold flex items-center gap-1.5 text-blue-800">
                        <Mail className="w-3.5 h-3.5" /> Email Verification
                      </p>
                      <p className="text-[11px] text-blue-700 leading-relaxed">
                        Enter your account email address. A one-time password (OTP) will be sent to your inbox to securely reset your credentials.
                      </p>
                    </div>

                    <FormField label="Registered Email Address" required>
                      <div className="relative">
                        <Input
                          type="email"
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          placeholder="yourname@clubfund.edu"
                          required
                          className="pl-9"
                        />
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      </div>
                    </FormField>

                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      className="w-full font-bold shadow-md shadow-blue-500/20"
                      loading={loading}
                    >
                      <KeyRound className="w-4 h-4 mr-2" /> Send 6-Digit OTP Code
                    </Button>
                  </form>
                )}

                {/* STEP 2: Enter OTP & New Password */}
                {forgotStep === 2 && (
                  <form onSubmit={handleVerifyOtpAndReset} className="space-y-3.5 sm:space-y-4">
                    {/* Email confirmation chip */}
                    <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs gap-2">
                      <div className="min-w-0 flex-1 truncate">
                        <span className="text-slate-500 text-[11px]">OTP sent to:</span>{' '}
                        <strong className="text-slate-900 font-mono text-[11px] sm:text-xs truncate">{forgotEmail}</strong>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setForgotStep(1);
                          setError('');
                          setSuccessMsg('');
                        }}
                        className="text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer flex-shrink-0"
                      >
                        Change
                      </button>
                    </div>

                    <FormField label="6-Digit Verification Code (OTP)" required helpText="Check your email inbox or spam folder">
                      <Input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        placeholder="• • • • • •"
                        required
                        className="text-center font-mono text-base sm:text-lg tracking-[0.25em] sm:tracking-[0.35em] font-bold text-blue-700 placeholder:tracking-normal placeholder:font-normal placeholder:text-slate-400"
                      />
                    </FormField>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                        New Password <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Input
                          type={showNewPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="At least 6 characters"
                          required
                          minLength={6}
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors p-1"
                          tabIndex={-1}
                        >
                          {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Confirm New Password <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Re-enter new password"
                          required
                          minLength={6}
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors p-1"
                          tabIndex={-1}
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      className="w-full font-bold shadow-md shadow-blue-500/20 mt-2"
                      loading={loading}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" /> Reset Password & Sign In
                    </Button>

                    <div className="text-center pt-2">
                      <button
                        type="button"
                        disabled={loading}
                        onClick={handleSendOtp}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800 disabled:opacity-50 cursor-pointer"
                      >
                        Didn't receive the email? Resend OTP
                      </button>
                    </div>
                  </form>
                )}

                <div className="text-center pt-3 sm:pt-4 border-t border-slate-100 mt-4 sm:mt-5">
                  <button
                    type="button"
                    onClick={() => {
                      setError('');
                      setSuccessMsg('');
                      setForgotStep(1);
                      setMode('login');
                    }}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
                  >
                    Return to Sign In
                  </button>
                </div>
              </div>
            )}

          {/* ========================================================================= */}
          {/* Registration from login is disabled - accounts created solely by admin */}
          {false && (
            <div>
              {registeredSuccess ? (
                <div className="text-center py-4 space-y-4">
                  <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                    <Clock className="w-8 h-8 animate-pulse" />
                  </div>
                  <h3 className="text-lg font-black text-slate-900">
                    Registration Request Submitted!
                  </h3>
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-left text-xs text-amber-900 space-y-2">
                    <p className="font-bold flex items-center gap-1.5 text-amber-800">
                      <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                      Pending Approval Required
                    </p>
                    <p className="leading-relaxed">
                      Your login credentials have been saved. Before you can log in, your request must be approved by the{' '}
                      <strong>Faculty Coordinator</strong> or <strong>System Administrator</strong>.
                    </p>
                    <p className="text-[11px] text-amber-700">
                      You will receive an email once your account has been approved.
                    </p>
                  </div>

                  <Button
                    type="button"
                    variant="primary"
                    size="md"
                    onClick={() => {
                      setMode('login');
                      setRegisteredSuccess(false);
                    }}
                    className="w-full font-bold"
                  >
                    Return to Sign In
                  </Button>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <button
                      type="button"
                      onClick={() => {
                        setError('');
                        setSuccessMsg('');
                        setMode('login');
                      }}
                      className="p-1 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        Request Portal Access
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Requires approval by Faculty Coordinator or Admin
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleRegister} className="space-y-3.5">
                    <FormField label="Full Name" required>
                      <Input
                        value={regForm.fullName}
                        onChange={(e) => setRegForm({ ...regForm, fullName: e.target.value })}
                        placeholder="e.g. John Doe"
                        required
                      />
                    </FormField>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <FormField label="Username" required>
                        <Input
                          value={regForm.username}
                          onChange={(e) => setRegForm({ ...regForm, username: e.target.value.toLowerCase().replace(/\s+/g, '') })}
                          placeholder="johndoe"
                          required
                        />
                      </FormField>

                      <FormField label="Mobile Number" required>
                        <Input
                          type="tel"
                          value={regForm.phone}
                          onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                          placeholder="9876543210"
                          required
                        />
                      </FormField>
                    </div>

                    <FormField label="Email Address" required>
                      <Input
                        type="email"
                        value={regForm.email}
                        onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                        placeholder="john@example.com"
                        required
                      />
                    </FormField>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <FormField label="Department" required>
                        <Input
                          value={regForm.department}
                          onChange={(e) => setRegForm({ ...regForm, department: e.target.value })}
                          placeholder="Computer Science"
                          required
                        />
                      </FormField>

                      <FormField label="Year of Study" required>
                        <Input
                          value={regForm.year}
                          onChange={(e) => setRegForm({ ...regForm, year: e.target.value })}
                          placeholder="3rd Year"
                          required
                        />
                      </FormField>
                    </div>

                    <FormField label="Student ID / Roll No. (Optional)">
                      <Input
                        value={regForm.studentId}
                        onChange={(e) => setRegForm({ ...regForm, studentId: e.target.value })}
                        placeholder="e.g. 21CS042"
                      />
                    </FormField>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <FormField label="Password" required>
                        <div className="relative">
                          <Input
                            type={showRegPassword ? 'text' : 'password'}
                            value={regForm.password}
                            onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                            placeholder="••••••••"
                            required
                            className="pr-9"
                          />
                          <button
                            type="button"
                            onClick={() => setShowRegPassword(!showRegPassword)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors p-1"
                            tabIndex={-1}
                            title={showRegPassword ? 'Hide password' : 'View password'}
                          >
                            {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </FormField>

                      <FormField label="Confirm Password" required>
                        <div className="relative">
                          <Input
                            type={showRegConfirmPassword ? 'text' : 'password'}
                            value={regForm.confirmPassword}
                            onChange={(e) => setRegForm({ ...regForm, confirmPassword: e.target.value })}
                            placeholder="••••••••"
                            required
                            className="pr-9"
                          />
                          <button
                            type="button"
                            onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors p-1"
                            tabIndex={-1}
                            title={showRegConfirmPassword ? 'Hide password' : 'View password'}
                          >
                            {showRegConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </FormField>
                    </div>

                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600">
                      🔒 Your account will be submitted for approval. You cannot log in until approved by Admin or Faculty Coordinator.
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      className="w-full font-bold shadow-md shadow-blue-500/20"
                      loading={loading}
                    >
                      Submit Registration Request
                    </Button>

                    <div className="text-center pt-1">
                      <button
                        type="button"
                        onClick={() => setMode('login')}
                        className="text-xs font-semibold text-slate-500 hover:text-slate-800"
                      >
                        Already have an account? Sign In
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  </div>
);
}
