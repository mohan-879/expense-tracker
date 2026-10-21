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

  // Quick Demo fill
  const handleQuickLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  // Handle Request Admin Reset (Manual Reset Policy)
  const handleRequestAdminReset = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await API.post('/auth/forgot-password', { email: forgotEmail });
      if (res.data.success) {
        setSuccessMsg(
          res.data.message ||
          'Your reset request has been logged and sent to the Administrator. Please contact the Admin to complete the manual verification and receive your new credentials.'
        );
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to submit reset request to administrator.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-10 sm:px-6 lg:px-8">
      {/* College & Club Branding Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="relative w-20 h-20 rounded-full overflow-hidden border-4 border-cyan-500 shadow-xl shadow-cyan-500/20 mx-auto bg-slate-950">
          <img
            src="/logo.jpg"
            alt="Data Science Club Logo"
            className="w-full h-full object-cover"
          />
        </div>
        <h2 className="mt-4 text-2xl font-black text-slate-900 tracking-tight">
          DSCLUB EXPENSE TRACKER
        </h2>
        <p className="mt-1 text-xs font-semibold text-cyan-700 uppercase tracking-wider">
          Data Science Club – Empowering the Future with AI
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-slate-200/80 sm:px-10">

          {/* Success Banner */}
          {successMsg && (
            <div className="mb-6 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-xs text-emerald-800 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-700 font-semibold">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 1. SIGN IN MODE                                                           */}
          {/* ========================================================================= */}
          {mode === 'login' && (
            <>
              <div className="mb-6 text-center">
                <h3 className="text-lg font-bold text-slate-900">Sign In to Your Account</h3>
                <p className="text-xs text-slate-500 mt-1">Enter your credentials to access the expense portal</p>
              </div>

              <form className="space-y-4" onSubmit={handleSubmit}>
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

              {/* No dynamic creation notice */}
              <div className="mt-5 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-center">
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  <strong>Account Policy:</strong> New accounts are created exclusively by the <strong>System Administrator</strong>. Public sign-up is disabled. Please contact the Admin or Faculty Coordinator to receive login access.
                </p>
              </div>

              {/* Quick Demo Credentials Switcher */}
              <div className="mt-6 pt-5 border-t border-slate-200">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center mb-2.5">
                  Quick Role Login (Click to fill)
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('admin@clubfund.edu', 'admin123')}
                    className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 text-left transition-colors"
                  >
                    🔴 Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('faculty@clubfund.edu', 'faculty1')}
                    className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 text-left transition-colors"
                  >
                    🟣 Faculty
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('treasurer@clubfund.edu', 'treas123')}
                    className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 text-left transition-colors"
                  >
                    🟡 Treasurer
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('financer@clubfund.edu', 'finance1')}
                    className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 text-left transition-colors"
                  >
                    🟢 Financer
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('arun@clubfund.edu', 'member12')}
                    className="col-span-2 p-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg text-blue-700 text-center transition-colors"
                  >
                    🔵 Member (Arun)
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ========================================================================= */}
          {/* 2. MANUAL FORGOT PASSWORD & ADMIN CONTACT                                  */}
          {/* ========================================================================= */}
          {mode === 'forgot' && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => {
                    setError('');
                    setSuccessMsg('');
                    setMode('login');
                  }}
                  className="p-1 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Manual Password Reset
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Contact Administrator to change account password manually
                  </p>
                </div>
              </div>

              {/* Policy Notice Box */}
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-2 mb-4">
                <div className="flex items-center gap-1.5 font-bold text-amber-800">
                  <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                  <span>Security & Audit Policy</span>
                </div>
                <p className="leading-relaxed">
                  Dynamic self-service password resets are disabled. All credentials must be verified and changed <strong>manually by the System Administrator</strong>.
                </p>
              </div>

              {/* Administrator Contact Details */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5 text-xs text-slate-700 mb-4">
                <p className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  Administrator Contact Details:
                </p>
                <div className="space-y-1 text-xs">
                  <p>
                    <strong>Email:</strong>{' '}
                    <a href="mailto:admin@clubfund.edu" className="text-blue-600 font-mono hover:underline">
                      admin@clubfund.edu
                    </a>
                  </p>
                  <p>
                    <strong>Department:</strong> Panimalar Data Science Club & Computer Science
                  </p>
                  <p>
                    <strong>Office Location:</strong> Department Admin Desk / Faculty Coordinator Office
                  </p>
                </div>
                <p className="text-[11px] text-slate-500 italic pt-1 border-t border-slate-200">
                  The admin will manually verify your identity in the Users management panel and update your credentials.
                </p>
              </div>

              {/* Request form to alert administrator */}
              <form onSubmit={handleRequestAdminReset} className="space-y-3.5">
                <FormField label="Your Registered Email Address" required helpText="Enter your email to alert the Administrator for a manual reset">
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
                  <KeyRound className="w-4 h-4 mr-2" /> Notify Administrator for Reset
                </Button>
              </form>

              <div className="text-center pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setError('');
                    setSuccessMsg('');
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

                    <div className="grid grid-cols-2 gap-3">
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

                    <div className="grid grid-cols-2 gap-3">
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

                    <div className="grid grid-cols-2 gap-3">
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
  );
}
