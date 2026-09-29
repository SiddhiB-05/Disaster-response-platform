import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, UserCheck, Lock, Mail, Building2, UserPlus, LogIn, Award, MapPin, AlertCircle, CheckCircle2, KeyRound } from 'lucide-react';
import { authService } from '../services/api';

export default function LoginPage({ currentUser, onLoginSuccess, onLogout, onNavigate }) {
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Login Form state
  const [loginId, setLoginId] = useState('OFF-191-SDMA');
  const [loginPassword, setLoginPassword] = useState('disaster123');

  // Signup Form state
  const [fullName, setFullName] = useState('');
  const [officerId, setOfficerId] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('State Disaster Management Authority (SDMA)');
  const [role, setRole] = useState('Government Officer');
  const [district, setDistrict] = useState('Rourkela Zone');
  const [badgeNumber, setBadgeNumber] = useState('');
  const [signupPassword, setSignupPassword] = useState('');

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const res = await authService.login({
        officer_id_or_email: loginId,
        password: loginPassword,
      });

      setSuccessMessage(`Welcome back, ${res.user.full_name}! Officer clearance granted.`);
      if (onLoginSuccess) {
        onLoginSuccess(res.user, res.token);
      }
    } catch (err) {
      console.error("Login error:", err);
      const detail = err.response?.data?.detail || "Invalid Officer credentials. Please check Officer ID/Email and password.";
      setErrorMessage(detail);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (id, pwd) => {
    setLoginId(id);
    setLoginPassword(pwd);
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const res = await authService.login({
        officer_id_or_email: id,
        password: pwd,
      });

      setSuccessMessage(`Logged in as ${res.user.full_name} (${res.user.department})`);
      if (onLoginSuccess) {
        onLoginSuccess(res.user, res.token);
      }
    } catch (err) {
      const detail = err.response?.data?.detail || "Quick login failed.";
      setErrorMessage(detail);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const res = await authService.signup({
        full_name: fullName,
        officer_id: officerId,
        email: email,
        password: signupPassword,
        department: department,
        role: role,
        district: district,
        badge_number: badgeNumber || `BDG-${Math.floor(1000 + Math.random() * 9000)}`
      });

      setSuccessMessage(`Account created successfully! Officer Clearance Code: ${res.user.public_ref}`);
      if (onLoginSuccess) {
        onLoginSuccess(res.user, res.token);
      }
    } catch (err) {
      console.error("Signup error:", err);
      const detail = err.response?.data?.detail || "Failed to register Officer. Check if Officer ID/Email is already registered.";
      setErrorMessage(detail);
    } finally {
      setLoading(false);
    }
  };

  // If already logged in, show Officer Profile Status card
  if (currentUser) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#121E12] border-2 border-[#6DBE5A] rounded-lg p-6 text-white shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <ShieldCheck className="w-64 h-64 text-[#6DBE5A]" />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#6DBE5A]/30 pb-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#6DBE5A] text-black font-black flex items-center justify-center text-xl font-mono border-2 border-black">
                {currentUser.full_name?.charAt(0) || 'O'}
              </div>
              <div>
                <span className="px-2 py-0.5 bg-[#6DBE5A]/20 text-[#6DBE5A] border border-[#6DBE5A]/50 text-[10px] font-mono font-bold uppercase rounded">
                  AUTHENTICATED OFFICER
                </span>
                <h2 className="text-xl font-mono font-bold uppercase text-white tracking-wide">
                  {currentUser.full_name}
                </h2>
                <p className="text-xs text-gray-300 font-mono">
                  Officer ID: <span className="text-amber-400 font-bold">{currentUser.officer_id}</span> | {currentUser.department}
                </p>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="px-4 py-2 bg-red-700 hover:bg-red-600 text-white font-mono font-bold text-xs rounded border border-black shadow"
            >
              LOGOUT OFFICER SESSION
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs mb-6">
            <div className="bg-[#1A2A19] p-3 rounded border border-white/10">
              <div className="text-gray-400 text-[11px]">ROLE / DESIGNATION</div>
              <div className="font-bold text-white mt-1 text-sm">{currentUser.role || "Government Officer"}</div>
            </div>
            <div className="bg-[#1A2A19] p-3 rounded border border-white/10">
              <div className="text-gray-400 text-[11px]">ASSIGNED ZONE / DISTRICT</div>
              <div className="font-bold text-amber-300 mt-1 text-sm">{currentUser.district || "Rourkela Zone"}</div>
            </div>
            <div className="bg-[#1A2A19] p-3 rounded border border-white/10">
              <div className="text-gray-400 text-[11px]">OFFICER BADGE NO.</div>
              <div className="font-bold text-emerald-400 mt-1 text-sm">{currentUser.badge_number || currentUser.public_ref || "SDMA-191"}</div>
            </div>
          </div>

          <div className="bg-[#0D160C] p-4 rounded border border-[#6DBE5A]/40 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-mono font-bold text-[#6DBE5A] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> AUTHORIZED COMMAND CLEARANCE ACTIVE
              </h4>
              <p className="text-xs text-gray-300 mt-1 font-mono">
                You have full clearance to execute AI Risk Assessments, Trigger SDMA Relocation Protocols, and Dispatch Resources.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onNavigate('relocation')}
                className="px-4 py-2 bg-[#6DBE5A] text-black font-mono font-bold text-xs rounded border border-black hover:bg-[#85d472]"
              >
                GO TO SDMA RELOCATION PLANNER →
              </button>
              <button
                onClick={() => onNavigate('map')}
                className="px-4 py-2 bg-amber-500 text-black font-mono font-bold text-xs rounded border border-black hover:bg-amber-400"
              >
                OPEN TACTICAL GIS MAP →
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Government Officer Information Badge */}
        <div className="md:col-span-5 bg-[#121E12] border-2 border-black p-6 rounded-lg text-white font-mono shadow-xl">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-4">
            <div className="w-10 h-10 rounded bg-[#6DBE5A] border border-black flex items-center justify-center text-black font-black">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white tracking-wide uppercase">GOVERNMENT OFFICER PORTAL</h3>
              <p className="text-[11px] text-gray-400">SIH 191 • Disaster Intelligence Platform</p>
            </div>
          </div>

          <p className="text-xs text-gray-300 leading-relaxed mb-6">
            Authorized portal for Disaster Management Officers, District Magistrates, NDRF Commanders, and Field Operators to access real-time risk maps, carrying capacity optimization, and AI relocation planning.
          </p>

          <div className="space-y-3 text-xs">
            <div className="flex items-start gap-2.5 p-2 bg-[#1A2A19] rounded border border-white/5">
              <Award className="w-4 h-4 text-[#6DBE5A] shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">SDMA Officer Accreditation</strong>
                <p className="text-[11px] text-gray-400">Secure role-based access for early warning protocols.</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5 p-2 bg-[#1A2A19] rounded border border-white/5">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">Red Zone Command</strong>
                <p className="text-[11px] text-gray-400">Interactive GIS Map & AI Relocation Matrix access.</p>
              </div>
            </div>
          </div>

          {/* Quick Demo Credentials */}
          <div className="mt-6 pt-4 border-t border-white/10">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block mb-2">
              ⚡ QUICK DEMO OFFICER LOGIN
            </span>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('OFF-191-SDMA', 'disaster123')}
                className="w-full text-left p-2.5 bg-[#1C2E1B] hover:bg-[#253D24] border border-[#6DBE5A]/40 rounded text-xs transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-white">Commander Rajesh Sharma</div>
                  <div className="text-[10px] text-gray-400">Officer ID: OFF-191-SDMA (SDMA HQ)</div>
                </div>
                <span className="px-2 py-1 bg-[#6DBE5A] text-black font-extrabold text-[10px] rounded">LOGIN</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('OFF-502-NDRF', 'disaster123')}
                className="w-full text-left p-2.5 bg-[#1C2E1B] hover:bg-[#253D24] border border-amber-500/40 rounded text-xs transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-white">Inspector Anita Roy</div>
                  <div className="text-[10px] text-gray-400">Officer ID: OFF-502-NDRF (NDRF Battalion)</div>
                </div>
                <span className="px-2 py-1 bg-amber-500 text-black font-extrabold text-[10px] rounded">LOGIN</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Login / Signup Form Card */}
        <div className="md:col-span-7 bg-white text-black border-2 border-black rounded-lg shadow-2xl overflow-hidden font-mono">
          
          {/* Header Tabs */}
          <div className="flex border-b-2 border-black bg-gray-100">
            <button
              onClick={() => { setIsSignup(false); setErrorMessage(''); setSuccessMessage(''); }}
              className={`flex-1 py-3 px-4 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 border-r border-black transition-all ${
                !isSignup ? 'bg-[#162415] text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <LogIn className="w-4 h-4" /> OFFICER LOGIN
            </button>
            <button
              onClick={() => { setIsSignup(true); setErrorMessage(''); setSuccessMessage(''); }}
              className={`flex-1 py-3 px-4 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                isSignup ? 'bg-[#162415] text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <UserPlus className="w-4 h-4" /> OFFICER SIGNUP
            </button>
          </div>

          <div className="p-6">
            {/* Feedback Banners */}
            {errorMessage && (
              <div className="mb-4 p-3 bg-red-100 border border-red-500 text-red-800 text-xs rounded flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="mb-4 p-3 bg-emerald-100 border border-emerald-500 text-emerald-800 text-xs rounded flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {!isSignup ? (
              /* LOGIN FORM */
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">
                    Officer ID or Official Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <UserCheck className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={loginId}
                      onChange={(e) => setLoginId(e.target.value)}
                      placeholder="e.g. OFF-191-SDMA or officer@dsma.gov.in / officer.sih@sdma.gov.in"
                      className="w-full pl-9 pr-3 py-2 text-xs border-2 border-black rounded focus:outline-none focus:ring-2 focus:ring-[#6DBE5A]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase mb-1">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                    <input
                      type="password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Enter password"
                      className="w-full pl-9 pr-3 py-2 text-xs border-2 border-black rounded focus:outline-none focus:ring-2 focus:ring-[#6DBE5A]"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 bg-[#162415] hover:bg-[#233822] text-[#6DBE5A] font-extrabold text-xs uppercase rounded border-2 border-black shadow-[3px_3px_0px_#000] transition-all active:translate-y-0.5 disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {loading ? 'AUTHENTICATING OFFICER...' : 'LOGIN TO DISASTER PLATFORM →'}
                  </button>
                </div>
              </form>
            ) : (
              /* SIGNUP FORM */
              <form onSubmit={handleSignup} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Inspector Ramesh Kumar"
                      className="w-full px-3 py-1.5 text-xs border-2 border-black rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase mb-1">Officer ID *</label>
                    <input
                      type="text"
                      required
                      value={officerId}
                      onChange={(e) => setOfficerId(e.target.value)}
                      placeholder="e.g. OFF-7892-DEOC"
                      className="w-full px-3 py-1.5 text-xs border-2 border-black rounded"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase mb-1">Official Govt Email *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. ramesh.k@sdma.gov.in"
                      className="w-full px-3 py-1.5 text-xs border-2 border-black rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase mb-1">Password *</label>
                    <input
                      type="password"
                      required
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="Create password"
                      className="w-full px-3 py-1.5 text-xs border-2 border-black rounded"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase mb-1">Department / Agency *</label>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border-2 border-black rounded bg-white"
                    >
                      <option value="State Disaster Management Authority (SDMA)">State Disaster Management Authority (SDMA)</option>
                      <option value="National Disaster Response Force (NDRF)">National Disaster Response Force (NDRF)</option>
                      <option value="District Emergency Operations Center (DEOC)">District Emergency Operations Center (DEOC)</option>
                      <option value="State Revenue & Disaster Management Dept">State Revenue & Disaster Management Dept</option>
                      <option value="Fire & Rescue Services">Fire & Rescue Services</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase mb-1">Role / Rank *</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border-2 border-black rounded bg-white"
                    >
                      <option value="Government Officer">Government Officer</option>
                      <option value="Field Response Commander">Field Response Commander</option>
                      <option value="District Magistrate / Admin">District Magistrate / Admin</option>
                      <option value="GIS & Data Analyst">GIS & Data Analyst</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase mb-1">District / Jurisdiction</label>
                    <input
                      type="text"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      placeholder="e.g. Rourkela Zone"
                      className="w-full px-3 py-1.5 text-xs border-2 border-black rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase mb-1">Badge Number (Optional)</label>
                    <input
                      type="text"
                      value={badgeNumber}
                      onChange={(e) => setBadgeNumber(e.target.value)}
                      placeholder="e.g. SDMA-4029"
                      className="w-full px-3 py-1.5 text-xs border-2 border-black rounded"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 bg-[#6DBE5A] hover:bg-[#5da84c] text-black font-extrabold text-xs uppercase rounded border-2 border-black shadow-[3px_3px_0px_#000] transition-all active:translate-y-0.5 disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {loading ? 'CREATING OFFICER PROFILE...' : 'REGISTER GOVERNMENT OFFICER ACCOUNT →'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
