'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../context/AuthContext';
import API from '../../../services/api';
import RoleBadge from '../../../components/molecules/RoleBadge';
import Button from '../../../components/atoms/Button';
import Input from '../../../components/atoms/Input';
import Select from '../../../components/atoms/Select';
import FormField from '../../../components/molecules/FormField';
import {
  User,
  Mail,
  Building2,
  Phone,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Save,
  MessageSquare,
  Camera,
  Trash2,
  Sparkles,
  GraduationCap,
  Hash,
  Layers,
} from 'lucide-react';

export default function ProfilePage() {
  const { user, updateUserData } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('AI&DS');
  const [customDepartment, setCustomDepartment] = useState('');
  const [clubRole, setClubRole] = useState('MEMBER');
  const [customClubRole, setCustomClubRole] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [year, setYear] = useState('3rd Year');
  const [section, setSection] = useState('A');
  const [customSection, setCustomSection] = useState('');
  const [photo, setPhoto] = useState('');

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);

  const standardDepartments = ['AI&DS', 'CSE', 'IT', 'AI&ML', 'ECE', 'EEE'];
  const departmentOptions = [
    { label: 'AI&DS (Artificial Intelligence & Data Science)', value: 'AI&DS' },
    { label: 'CSE (Computer Science & Engineering)', value: 'CSE' },
    { label: 'IT (Information Technology)', value: 'IT' },
    { label: 'AI&ML (Artificial Intelligence & Machine Learning)', value: 'AI&ML' },
    { label: 'ECE (Electronics & Communication Engineering)', value: 'ECE' },
    { label: 'EEE (Electrical & Electronics Engineering)', value: 'EEE' },
    { label: 'Others (Type manually)', value: 'OTHERS' },
  ];

  const standardClubRoles = [
    'TREASURER',
    'MEMBER',
    'FACULTY',
    'TECH TEAM',
    'SECRETARY',
    'CHAIRPERSON',
    'CAPTURE_CREW',
  ];
  const clubRoleOptions = [
    { label: 'TREASURER', value: 'TREASURER' },
    { label: 'MEMBER', value: 'MEMBER' },
    { label: 'FACULTY', value: 'FACULTY' },
    { label: 'TECH TEAM', value: 'TECH TEAM' },
    { label: 'SECRETARY', value: 'SECRETARY' },
    { label: 'CHAIRPERSON', value: 'CHAIRPERSON' },
    { label: 'CAPTURE_CREW', value: 'CAPTURE_CREW' },
    { label: 'OTHERS (Type manually)', value: 'OTHERS' },
  ];

  const yearOptions = [
    { label: '1st Year', value: '1st Year' },
    { label: '2nd Year', value: '2nd Year' },
    { label: '3rd Year', value: '3rd Year' },
    { label: '4th Year', value: '4th Year' },
    { label: 'Faculty / Staff', value: 'Faculty / Staff' },
  ];

  const sectionOptions = [
    { label: 'Section A', value: 'A' },
    { label: 'Section B', value: 'B' },
    { label: 'Section C', value: 'C' },
    { label: 'Section D', value: 'D' },
    { label: 'Other Section (Type manually)', value: 'OTHER' },
  ];

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');

      // Department initialization
      const userDept = user.department || 'AI&DS';
      if (standardDepartments.includes(userDept)) {
        setDepartment(userDept);
        setCustomDepartment('');
      } else {
        setDepartment('OTHERS');
        setCustomDepartment(userDept);
      }

      // Club Role initialization
      const userClubRole = user.clubRole || 'MEMBER';
      if (standardClubRoles.includes(userClubRole)) {
        setClubRole(userClubRole);
        setCustomClubRole('');
      } else {
        setClubRole('OTHERS');
        setCustomClubRole(userClubRole);
      }

      setRollNo(user.rollNo || '');
      setYear(user.year || '3rd Year');

      // Section initialization
      const userSection = user.section || 'A';
      if (['A', 'B', 'C', 'D'].includes(userSection)) {
        setSection(userSection);
        setCustomSection('');
      } else {
        setSection('OTHER');
        setCustomSection(userSection);
      }

      setPhoto(user.photo || '');
    }
  }, [user]);

  if (!user) return null;

  // Handle Photo selection & compression to Base64
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg('Profile photo must be under 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhoto(reader.result);
      setErrorMsg('');
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPhoto('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    const resolvedDepartment = department === 'OTHERS' ? customDepartment.trim() || 'AI&DS' : department;
    const resolvedClubRole = clubRole === 'OTHERS' ? customClubRole.trim() || 'MEMBER' : clubRole;
    const resolvedSection = section === 'OTHER' ? customSection.trim() || 'A' : section;

    try {
      const payload = {
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        department: resolvedDepartment,
        rollNo: rollNo.trim(),
        year: year.trim(),
        section: resolvedSection,
        photo,
      };

      // Only Admin can update the club role
      if (user.role === 'ADMIN') {
        payload.clubRole = resolvedClubRole;
      }

      const res = await API.put(`/users/${user._id}`, payload);

      if (res.data.success) {
        updateUserData(res.data.data);
        setSuccessMsg('Your profile credentials and club details have been updated successfully!');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const activeClubRoleDisplay = clubRole === 'OTHERS' ? customClubRole || 'Club Member' : clubRole;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <User className="w-6 h-6 text-blue-600" />
          User Profile & Club Membership Details
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage your personal details, academic roll number, department, and contact information.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-xs text-emerald-800 font-semibold shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-xs text-rose-800 font-semibold shadow-xs">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Profile Card */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
        {/* Profile Header Banner with Avatar */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 border-b border-slate-100 pb-6 text-center sm:text-left">
          <div className="relative group">
            {photo ? (
              <img
                src={photo}
                alt={fullName || user.fullName}
                className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-lg ring-2 ring-blue-500/20"
              />
            ) : (
              <div className="w-24 h-24 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-2xl flex items-center justify-center font-black text-3xl shadow-lg ring-2 ring-blue-500/20">
                {(fullName || user.fullName)?.charAt(0) || 'U'}
              </div>
            )}

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-2 -right-2 p-2 bg-blue-600 text-white rounded-xl shadow-md hover:bg-blue-700 transition-colors cursor-pointer"
              title="Upload profile photo"
            >
              <Camera className="w-4 h-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </div>

          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                {fullName || user.fullName}
              </h2>
              <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                {activeClubRoleDisplay}
              </span>
            </div>

            <p className="text-xs text-slate-500 font-mono">
              @{user.username} • {user.email}
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1 text-[11px] text-slate-600">
              <RoleBadge role={user.role} />
              <span className="bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-md text-[10px]">
                {department === 'OTHERS' ? customDepartment || 'Other Dept' : department}
              </span>
              {rollNo && (
                <span className="bg-slate-100 text-slate-700 font-mono font-bold px-2 py-0.5 rounded-md text-[10px]">
                  Roll: {rollNo}
                </span>
              )}
            </div>

            {photo && (
              <div className="pt-1 flex items-center justify-center sm:justify-start">
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remove Photo
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Form Fields */}
        <form onSubmit={handleSave} className="space-y-5">
          {/* Section 1: Personal Credentials */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Personal & Contact Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Full Name" required>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </FormField>

              <FormField label="Email Address" required helpText="Used for system login & notifications">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@panimalar.ac.in"
                  required
                />
              </FormField>
            </div>

            <FormField
              label="Mobile Number"
              required
              helpText="Standard 10-digit number (e.g. 9087516907)"
            >
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 9087516907"
                required
              />
            </FormField>
          </div>

          {/* Section 2: College & Club Profile */}
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Department & Academic Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Department Dropdown */}
              <FormField label="Department" required>
                <Select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  options={departmentOptions}
                  required
                />
              </FormField>

              {/* If OTHERS: Custom Department Input */}
              {department === 'OTHERS' ? (
                <FormField label="Specify Department Name" required>
                  <Input
                    value={customDepartment}
                    onChange={(e) => setCustomDepartment(e.target.value)}
                    placeholder="e.g. Mechatronics, MBA"
                    required
                  />
                </FormField>
              ) : (
                <FormField label="College Roll Number / Reg No" required>
                  <Input
                    value={rollNo}
                    onChange={(e) => setRollNo(e.target.value)}
                    placeholder="e.g. 2024PECAI458"
                    required
                  />
                </FormField>
              )}
            </div>

            {department === 'OTHERS' && (
              <FormField label="College Roll Number / Reg No" required>
                <Input
                  value={rollNo}
                  onChange={(e) => setRollNo(e.target.value)}
                  placeholder="e.g. 2024PECAI458"
                  required
                />
              </FormField>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Year of Study */}
              <FormField label="Year of Study" required>
                <Select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  options={yearOptions}
                  required
                />
              </FormField>

              {/* Section */}
              <FormField label="Section" required>
                <Select
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  options={sectionOptions}
                  required
                />
              </FormField>
            </div>

            {section === 'OTHER' && (
              <FormField label="Specify Section Name" required>
                <Input
                  value={customSection}
                  onChange={(e) => setCustomSection(e.target.value)}
                  placeholder="e.g. Section E, CS-1"
                  required
                />
              </FormField>
            )}
          </div>

          {/* Section 3: Club Designation & Role */}
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Club Role & Designation
              </h3>
              {user.role !== 'ADMIN' && (
                <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                  Managed by Administrator
                </span>
              )}
            </div>

            {user.role === 'ADMIN' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Role Playing in Club" required>
                  <Select
                    value={clubRole}
                    onChange={(e) => setClubRole(e.target.value)}
                    options={clubRoleOptions}
                    required
                  />
                </FormField>

                {/* If OTHERS: Manual Role Typing Input */}
                {clubRole === 'OTHERS' && (
                  <FormField label="Type Role Manually" required helpText="Enter specific role in the club">
                    <Input
                      value={customClubRole}
                      onChange={(e) => setCustomClubRole(e.target.value)}
                      placeholder="e.g. Event Coordinator, Creative Lead"
                      required
                    />
                  </FormField>
                )}
              </div>
            ) : (
              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Your Assigned Club Role</p>
                  <p className="text-base font-extrabold text-blue-900 mt-0.5">{activeClubRoleDisplay}</p>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-400 font-medium block">Role changes restricted</span>
                  <span className="text-[10px] text-slate-400 block">Contact Administrator to update</span>
                </div>
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-medium">
              Profile updates take effect immediately across all club modules.
            </span>
            <Button
              variant="primary"
              type="submit"
              loading={saving}
              className="font-bold bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20"
            >
              <Save className="w-4 h-4 mr-1.5" /> Save Profile & Details
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
