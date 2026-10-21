'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import API from '../../../services/api';
import Button from '../../../components/atoms/Button';
import Input from '../../../components/atoms/Input';
import Select from '../../../components/atoms/Select';
import FormField from '../../../components/molecules/FormField';
import RoleBadge from '../../../components/molecules/RoleBadge';
import {
  Users,
  PlusCircle,
  KeyRound,
  UserCheck,
  UserX,
  Phone,
  Edit2,
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  GraduationCap,
  Trash2,
  Wallet,
  Eye,
  EyeOff,
  FileSpreadsheet,
  FileText,
} from 'lucide-react';
import { exportToStyledExcel, exportToStyledPDF } from '../../../utils/exportHelper';

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'all'

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);

  const [selectedUser, setSelectedUser] = useState(null);
  const [walletUser, setWalletUser] = useState(null);
  const [walletAmount, setWalletAmount] = useState('');
  const [walletAction, setWalletAction] = useState('ADD');
  const [walletNote, setWalletNote] = useState('');

  const [newPassword, setNewPassword] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showAddUserPassword, setShowAddUserPassword] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    role: 'MEMBER',
    clubRole: 'MEMBER',
    customClubRole: '',
    department: 'AI&DS',
    customDepartment: '',
    rollNo: '',
    year: '3rd Year',
    section: 'A',
    customSection: '',
    phone: '',
    photo: '',
  });

  const [editFormData, setEditFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    department: 'AI&DS',
    customDepartment: '',
    clubRole: 'MEMBER',
    customClubRole: '',
    rollNo: '',
    year: '3rd Year',
    section: 'A',
    customSection: '',
    role: 'MEMBER',
    photo: '',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await API.get('/users');
      if (res.data.success) {
        setUsers(res.data.data);
        const pendingCount = res.data.data.filter((u) => u.approvalStatus === 'PENDING').length;
        if (currentUser?.role === 'TREASURER' || (pendingCount === 0 && activeTab === 'pending')) {
          setActiveTab('all');
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const pendingUsers = users.filter((u) => u.approvalStatus === 'PENDING');
  const visibleUsers = currentUser?.role === 'TREASURER'
    ? users.filter((u) => u.approvalStatus === 'APPROVED' || (u.approvalStatus === undefined && u.isApproved !== false))
    : users;

  const handleApprove = async (user) => {
    if (!confirm(`Are you sure you want to approve login access for ${user.fullName} (${user.email})?`)) {
      return;
    }

    try {
      setActionLoading(true);
      const res = await API.patch(`/users/${user._id}/approve`);
      if (res.data.success) {
        setMessage({ type: 'success', text: `Approved ${user.fullName}. An approval email has been sent to them.` });
        fetchUsers();
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || err.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenReject = (user) => {
    setSelectedUser(user);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const handleConfirmReject = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      setActionLoading(true);
      const res = await API.patch(`/users/${selectedUser._id}/reject`, {
        reason: rejectionReason,
      });
      if (res.data.success) {
        setShowRejectModal(false);
        setMessage({ type: 'success', text: `Registration rejected for ${selectedUser.fullName}.` });
        fetchUsers();
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || err.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenWalletModal = (user) => {
    setWalletUser(user);
    setWalletAmount('');
    setWalletAction('ADD');
    setWalletNote('');
    setShowWalletModal(true);
  };

  const handleWalletSubmit = async (e) => {
    e.preventDefault();
    if (!walletUser) return;

    try {
      setActionLoading(true);
      const res = await API.post(`/users/${walletUser._id}/wallet`, {
        amount: Number(walletAmount),
        action: walletAction,
        note: walletNote,
      });

      if (res.data.success) {
        setShowWalletModal(false);
        setMessage({
          type: 'success',
          text: `Wallet updated for ${walletUser.fullName}! New Balance: ₹${(res.data.data?.walletBalance || 0).toLocaleString('en-IN')}`,
        });
        fetchUsers();
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || err.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const resolvedDepartment = formData.department === 'OTHERS' ? formData.customDepartment.trim() || 'AI&DS' : formData.department;
      const resolvedClubRole = formData.clubRole === 'OTHERS' ? formData.customClubRole.trim() || 'MEMBER' : formData.clubRole;
      const resolvedSection = formData.section === 'OTHER' ? formData.customSection.trim() || 'A' : formData.section;

      const payload = {
        ...formData,
        department: resolvedDepartment,
        clubRole: resolvedClubRole,
        section: resolvedSection,
      };

      const res = await API.post('/users', payload);
      if (res.data.success) {
        setShowAddModal(false);
        setFormData({
          username: '',
          email: '',
          password: '',
          fullName: '',
          role: 'MEMBER',
          clubRole: 'MEMBER',
          customClubRole: '',
          department: 'AI&DS',
          customDepartment: '',
          rollNo: '',
          year: '3rd Year',
          section: 'A',
          customSection: '',
          phone: '',
          photo: '',
        });
        setMessage({ type: 'success', text: 'New user created successfully (pre-approved).' });
        fetchUsers();
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);
    const isCustomDept = user.department && !standardDepartments.includes(user.department);
    const isCustomClub = user.clubRole && !standardClubRoles.includes(user.clubRole);
    const isCustomSec = user.section && !['A', 'B', 'C', 'D'].includes(user.section);

    setEditFormData({
      fullName: user.fullName || '',
      email: user.email || '',
      phone: user.phone || '',
      department: isCustomDept ? 'OTHERS' : (user.department || 'AI&DS'),
      customDepartment: isCustomDept ? user.department : '',
      clubRole: isCustomClub ? 'OTHERS' : (user.clubRole || 'MEMBER'),
      customClubRole: isCustomClub ? user.clubRole : '',
      rollNo: user.rollNo || '',
      year: user.year || '3rd Year',
      section: isCustomSec ? 'OTHER' : (user.section || 'A'),
      customSection: isCustomSec ? user.section : '',
      role: user.role || 'MEMBER',
      photo: user.photo || '',
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    try {
      const resolvedDepartment = editFormData.department === 'OTHERS' ? editFormData.customDepartment.trim() || 'AI&DS' : editFormData.department;
      const resolvedClubRole = editFormData.clubRole === 'OTHERS' ? editFormData.customClubRole.trim() || 'MEMBER' : editFormData.clubRole;
      const resolvedSection = editFormData.section === 'OTHER' ? editFormData.customSection.trim() || 'A' : editFormData.section;

      const payload = {
        fullName: editFormData.fullName,
        email: editFormData.email,
        phone: editFormData.phone,
        department: resolvedDepartment,
        rollNo: editFormData.rollNo,
        year: editFormData.year,
        section: resolvedSection,
        photo: editFormData.photo,
      };

      if (currentUser?.role === 'ADMIN') {
        payload.role = editFormData.role;
        payload.clubRole = resolvedClubRole;
      }

      const res = await API.put(`/users/${selectedUser._id}`, payload);
      if (res.data.success) {
        setShowEditModal(false);
        setMessage({ type: 'success', text: 'User details updated successfully.' });
        fetchUsers();
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      const res = await API.patch(`/users/${userId}/status`);
      if (res.data.success) {
        fetchUsers();
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post(`/users/${selectedUser._id}/reset-password`, {
        newPassword,
      });
      if (res.data.success) {
        setShowResetModal(false);
        setNewPassword('');
        alert(`Password reset successfully for ${selectedUser.email}`);
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleDeleteUser = async (user) => {
    if (
      !confirm(
        `Are you sure you want to permanently delete user account for ${user.fullName} (${user.email})? This will permanently delete their login credentials.`
      )
    ) {
      return;
    }

    try {
      setActionLoading(true);
      const res = await API.delete(`/users/${user._id}`);
      if (res.data.success) {
        setMessage({ type: 'success', text: `User ${user.fullName} deleted permanently.` });
        fetchUsers();
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || err.message });
    } finally {
      setActionLoading(false);
    }
  };

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

  const roleOptions = [
    { label: 'ADMIN', value: 'ADMIN' },
    { label: 'FACULTY COORDINATOR', value: 'FACULTY_COORDINATOR' },
    { label: 'FINANCER', value: 'FINANCER' },
    { label: 'TREASURER', value: 'TREASURER' },
    { label: 'MEMBER', value: 'MEMBER' },
  ];

  // Export to Excel (.xlsx) matching structured model format
  const exportToExcel = async () => {
    const listToExport = activeTab === 'pending' ? pendingUsers : users;
    if (listToExport.length === 0) {
      alert('No user records available to export.');
      return;
    }

    try {
      const headers = [
        '#',
        'Roll Number / ID',
        'Student Name',
        'Section',
        'Department',
        'Club Role',
        'Access Role',
        'Mobile Number',
        'Wallet Balance (INR)',
        'Status',
        'Joined At',
      ];

      const rows = listToExport.map((u, idx) => [
        idx + 1,
        u.rollNo || '-',
        u.fullName || '-',
        u.section || '-',
        u.department || 'AI&DS',
        u.clubRole || 'MEMBER',
        u.role || 'MEMBER',
        u.phone || '-',
        u.walletBalance || 0,
        u.isApproved ? 'Approved / Active' : 'Pending Approval',
        new Date(u.createdAt).toLocaleString('en-IN'),
      ]);

      await exportToStyledExcel({
        filename: `Panimalar_Members_${activeTab === 'pending' ? 'Pending' : 'All'}_${new Date().toISOString().slice(0, 10)}.xlsx`,
        sheetName: 'Members_Directory',
        reportTitle: 'EXPENSE TRACKER',
        metaInfo: `User Accounts & Directory | Records: ${listToExport.length} | Exported: ${new Date().toLocaleString('en-IN')}`,
        headers,
        rows,
        columnAlignments: [
          'center', // #
          'center', // Roll Number / ID
          'left',   // Student Name
          'center', // Section
          'center', // Department
          'center', // Club Role
          'center', // Access Role
          'center', // Mobile Number
          'right',  // Wallet Balance (INR)
          'center', // Status
          'center', // Joined At
        ],
      });
    } catch (err) {
      console.error('Export Excel failed:', err);
      alert('Failed to export Excel: ' + (err.message || 'Unknown error'));
    }
  };

  // Export to PDF matching structured model format
  const exportToPDF = async () => {
    const listToExport = activeTab === 'pending' ? pendingUsers : users;
    if (listToExport.length === 0) {
      alert('No user records available to export.');
      return;
    }

    try {
      const headers = [
        '#',
        'Roll No / ID',
        'Student Name',
        'Sec',
        'Dept',
        'Club Role',
        'Role',
        'Phone',
        'Wallet',
        'Status',
        'Joined At',
      ];

      const rows = listToExport.map((u, idx) => [
        idx + 1,
        u.rollNo || '-',
        u.fullName || '-',
        u.section || '-',
        u.department || 'AI&DS',
        u.clubRole || 'MEMBER',
        u.role || 'MEMBER',
        u.phone || '-',
        `Rs. ${(u.walletBalance || 0).toLocaleString('en-IN')}`,
        u.isApproved ? 'Approved' : 'Pending',
        new Date(u.createdAt).toLocaleDateString('en-IN'),
      ]);

      await exportToStyledPDF({
        filename: `Panimalar_Members_${activeTab === 'pending' ? 'Pending' : 'All'}_${new Date().toISOString().slice(0, 10)}.pdf`,
        reportTitle: 'EXPENSE TRACKER',
        metaInfo: `User Directory & Approval Roster | Records: ${listToExport.length} | Exported: ${new Date().toLocaleString('en-IN')}`,
        headers,
        rows,
        orientation: 'landscape',
        columnStyles: {
          0: { halign: 'center', cellWidth: 10 },
          1: { halign: 'center', cellWidth: 28 },
          2: { halign: 'left' },
          3: { halign: 'center', cellWidth: 14 },
          4: { halign: 'center', cellWidth: 20 },
          5: { halign: 'center', cellWidth: 24 },
          6: { halign: 'center', cellWidth: 24 },
          7: { halign: 'center', cellWidth: 26 },
          8: { halign: 'right', cellWidth: 22 },
          9: { halign: 'center', cellWidth: 22 },
          10: { halign: 'center', cellWidth: 22 },
        },
      });
    } catch (err) {
      console.error('Export PDF failed:', err);
      alert('Failed to export PDF: ' + (err.message || 'Unknown error'));
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-blue-600" />
            User Accounts & Login Approvals
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Admin, Faculty Coordinator & Treasurer portal to view users, track approvals, and monitor member wallet allocations.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2.5">
          {['ADMIN', 'FACULTY_COORDINATOR'].includes(currentUser?.role) && (
            <Button variant="primary" size="md" onClick={() => setShowAddModal(true)} className="font-bold">
              <PlusCircle className="w-4 h-4 mr-2" /> Add Pre-Approved User
            </Button>
          )}

          <div className="flex items-center gap-2.5 ml-auto sm:ml-0">
            <button
              onClick={exportToExcel}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
              title="Export to Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-4 h-4" /> Export Excel
            </button>
            <button
              onClick={exportToPDF}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
              title="Export to PDF"
            >
              <FileText className="w-4 h-4" /> Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* Alert Banner */}
      {message.text && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between text-xs font-semibold ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
          <button
            onClick={() => setMessage({ type: '', text: '' })}
            className="text-slate-400 hover:text-slate-600 ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        {['ADMIN', 'FACULTY_COORDINATOR'].includes(currentUser?.role) && (
          <button
            onClick={() => setActiveTab('pending')}
            className={`pb-3 px-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'pending'
                ? 'border-amber-500 text-amber-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Pending Approvals</span>
            {pendingUsers.length > 0 && (
              <span className="bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse">
                {pendingUsers.length}
              </span>
            )}
          </button>
        )}

        <button
          onClick={() => setActiveTab('all')}
          className={`pb-3 px-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'all'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>
            {currentUser?.role === 'TREASURER'
              ? `Approved Users & Wallets (${users.filter(u => u.approvalStatus === 'APPROVED' || u.isApproved !== false).length})`
              : `All Users Directory (${users.length})`}
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: PENDING APPROVALS QUEUE                                             */}
      {/* ========================================================================= */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-500">Loading pending approval requests...</div>
          ) : pendingUsers.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-xs">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">No Pending Requests</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                All user accounts and login credentials are currently reviewed and approved. When a new user registers, their request will appear here for Faculty and Admin approval.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingUsers.map((u) => (
                <div
                  key={u._id}
                  className="bg-white rounded-2xl border border-amber-200 shadow-sm p-5 space-y-4 relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500" />
                  
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-extrabold text-slate-900">{u.fullName}</h4>
                        <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                          Pending Approval
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 font-mono">{u.email}</p>
                      <p className="text-xs text-slate-400">Username: @{u.username}</p>
                    </div>

                    <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 font-black flex items-center justify-center text-sm">
                      {u.fullName?.charAt(0) || 'U'}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-slate-400 text-[10px] font-bold uppercase block">Department & Year</span>
                      <span className="font-semibold text-slate-800">{u.department || 'N/A'} ({u.year || 'N/A'})</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] font-bold uppercase block">Phone</span>
                      <span className="font-semibold text-slate-800">{u.phone || 'No phone'}</span>
                    </div>
                    <div className="col-span-2 pt-1 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Requested On:</span>
                      <span className="font-medium text-slate-600">
                        {new Date(u.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Actions for Faculty and Admin */}
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenReject(u)}
                      disabled={actionLoading}
                      className="text-rose-600 border-rose-200 hover:bg-rose-50"
                    >
                      <UserX className="w-3.5 h-3.5 mr-1 text-rose-500" />
                      Reject
                    </Button>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleApprove(u)}
                      disabled={actionLoading}
                      className="bg-emerald-600 hover:bg-emerald-700 border-emerald-600 shadow-sm font-bold text-white"
                    >
                      <UserCheck className="w-3.5 h-3.5 mr-1" />
                      Approve Login Access
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: ALL USERS DIRECTORY                                                */}
      {/* ========================================================================= */}
      {activeTab === 'all' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 font-bold text-slate-900 text-sm flex items-center justify-between">
            <span>{currentUser?.role === 'TREASURER' ? 'Approved Users & Wallets' : 'System Users Directory'}</span>
            <span className="text-xs font-semibold text-slate-500">Total: {visibleUsers.length}</span>
          </div>
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-500">Loading user accounts...</div>
          ) : visibleUsers.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500">No users found.</div>
          ) : (
            <>
              {/* Mobile View: Responsive Cards (No Horizontal Scrolling) */}
              <div className="md:hidden p-3 space-y-3">
                {visibleUsers.map((u) => {
                  const isPending = u.approvalStatus === 'PENDING';
                  const isApproved = u.approvalStatus === 'APPROVED' || (u.approvalStatus === undefined && u.isApproved !== false);
                  const isRejected = u.approvalStatus === 'REJECTED';

                  return (
                    <div
                      key={u._id}
                      className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          {u.photo ? (
                            <img
                              src={u.photo}
                              alt={u.fullName}
                              className="w-9 h-9 rounded-xl object-cover border border-slate-200 shadow-xs flex-shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 font-black flex items-center justify-center text-xs flex-shrink-0">
                              {u.fullName?.charAt(0) || 'U'}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-extrabold text-slate-900 text-xs sm:text-sm truncate">
                              {u.fullName}
                            </p>
                            <p className="text-[11px] text-slate-500 truncate">{u.email}</p>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                              <span>@{u.username}</span>
                              {u.rollNo && <span>• Roll: {u.rollNo}</span>}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <RoleBadge role={u.role} />
                          {u.clubRole && (
                            <span className="text-[8px] font-black text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded uppercase">
                              {u.clubRole}
                            </span>
                          )}
                          {isPending ? (
                            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 text-[9px] font-extrabold rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                              <Clock className="w-2.5 h-2.5" /> PENDING
                            </span>
                          ) : isRejected ? (
                            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 text-[9px] font-extrabold rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                              <XCircle className="w-2.5 h-2.5" /> REJECTED
                            </span>
                          ) : (
                            <div className="flex items-center gap-1">
                              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 text-[9px] font-extrabold rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle2 className="w-2.5 h-2.5" /> APPROVED
                              </span>
                              {!u.isActive && (
                                <span className="inline-block px-1 py-0.5 text-[8px] font-bold rounded bg-slate-100 text-slate-500">
                                  Disabled
                                </span>
                              )}
                              {currentUser?.role === 'ADMIN' && (
                                <button
                                  type="button"
                                  onClick={() => handleToggleStatus(u._id)}
                                  className="text-[8px] font-bold text-slate-400 hover:text-slate-700 underline cursor-pointer"
                                >
                                  {u.isActive ? 'Deactivate' : 'Activate'}
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-[11px] bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <div>
                          <span className="text-slate-400 font-bold block text-[9px] uppercase">Wallet</span>
                          <span className="text-emerald-700 font-bold font-mono truncate block">
                            ₹{(u.walletBalance || 0).toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-bold block text-[9px] uppercase">Dept & Year</span>
                          <span className="text-slate-700 font-semibold truncate block">
                            {u.department || 'AI&DS'} {u.year ? `(${u.year})` : ''}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-bold block text-[9px] uppercase">Mobile</span>
                          <span className="text-slate-700 font-semibold font-mono truncate block">
                            {u.phone || 'None'}
                          </span>
                        </div>
                      </div>

                      {/* Mobile action buttons */}
                      <div className="pt-2 flex flex-wrap items-center justify-end gap-1.5 border-t border-slate-100">
                        {isPending && ['ADMIN', 'FACULTY_COORDINATOR'].includes(currentUser?.role) && (
                          <>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleApprove(u)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-1 px-2.5"
                            >
                              <UserCheck className="w-3.5 h-3.5 mr-1" /> Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenReject(u)}
                              className="text-rose-600 border-rose-200 text-xs py-1 px-2.5"
                            >
                              <UserX className="w-3.5 h-3.5 mr-1" /> Reject
                            </Button>
                          </>
                        )}

                        {['ADMIN', 'FACULTY_COORDINATOR'].includes(currentUser?.role) && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleOpenWalletModal(u)}
                            className={`bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-1.5 px-3 flex items-center justify-center shadow-xs cursor-pointer ${
                              currentUser?.role === 'FACULTY_COORDINATOR' ? 'w-full py-2.5 text-xs' : ''
                            }`}
                            title="Manage member wallet"
                          >
                            <Wallet className="w-3.5 h-3.5 mr-1.5" />
                            {currentUser?.role === 'FACULTY_COORDINATOR' ? 'Add / Manage Wallet Funds' : 'Wallet'}
                          </Button>
                        )}

                        {/* Edit ONLY for Admin (Removed for Faculty Coordinator) */}
                        {currentUser?.role === 'ADMIN' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditClick(u)}
                            className="text-xs py-1 px-2 cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit
                          </Button>
                        )}

                        {/* Reset Password ONLY for Admin (Faculty cannot access) */}
                        {currentUser?.role === 'ADMIN' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(u);
                              setShowResetModal(true);
                            }}
                            className="text-xs py-1 px-2 cursor-pointer"
                          >
                            <KeyRound className="w-3.5 h-3.5 mr-1" /> Reset Pwd
                          </Button>
                        )}

                        {/* Delete ONLY for Admin (Removed for Faculty Coordinator) */}
                        {currentUser?.role === 'ADMIN' && (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDeleteUser(u)}
                            className="bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white border border-rose-200 font-bold text-xs py-1 px-2 cursor-pointer"
                            title="Delete login account"
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop View: Full Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-bold tracking-wider">
                    <tr>
                      <th className="px-6 py-4">User</th>
                      <th className="px-6 py-4">Role</th>
                      <th className="px-6 py-4">Wallet Balance</th>
                      <th className="px-6 py-4">Mobile Number</th>
                      <th className="px-6 py-4">Department</th>
                      <th className="px-6 py-4">Approval Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {visibleUsers.map((u) => {
                      const isPending = u.approvalStatus === 'PENDING';
                      const isApproved = u.approvalStatus === 'APPROVED' || (u.approvalStatus === undefined && u.isApproved !== false);
                      const isRejected = u.approvalStatus === 'REJECTED';

                      return (
                        <tr key={u._id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {u.photo ? (
                                <img
                                  src={u.photo}
                                  alt={u.fullName}
                                  className="w-10 h-10 rounded-xl object-cover border border-slate-200 shadow-xs flex-shrink-0"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 font-black flex items-center justify-center text-xs flex-shrink-0">
                                  {u.fullName?.charAt(0) || 'U'}
                                </div>
                              )}
                              <div>
                                <p className="font-bold text-slate-900 leading-tight">{u.fullName}</p>
                                <p className="text-xs text-slate-500 mt-0.5">{u.email} (@{u.username})</p>
                                {u.rollNo && (
                                  <p className="text-[10px] text-slate-400 font-mono font-medium">Roll: {u.rollNo}</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <RoleBadge role={u.role} />
                              {u.clubRole && (
                                <span className="block text-[9px] font-black text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded w-fit uppercase">
                                  {u.clubRole}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                              <Wallet className="w-3.5 h-3.5 text-emerald-600" />
                              ₹{(u.walletBalance || 0).toLocaleString('en-IN')}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {u.phone ? (
                              <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-slate-800 bg-slate-100/80 px-2.5 py-1 rounded-lg w-fit">
                                <Phone className="w-3.5 h-3.5 text-blue-600" />
                                <span>{u.phone}</span>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400 italic">No phone set</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-xs font-semibold text-slate-700">
                            <div>
                              <span className="font-bold text-slate-800">{u.department || 'AI&DS'}</span>
                              <p className="text-[11px] text-slate-500">
                                {u.year || ''} {u.section ? `• Sec ${u.section}` : ''}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {isPending ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-extrabold rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                                <Clock className="w-3 h-3" /> PENDING
                              </span>
                            ) : isRejected ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-extrabold rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                                <XCircle className="w-3 h-3" /> REJECTED
                              </span>
                            ) : (
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-extrabold rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  <CheckCircle2 className="w-3 h-3" /> APPROVED
                                </span>
                                {!u.isActive && (
                                  <span className="inline-block px-1.5 py-0.5 text-[9px] font-bold rounded bg-slate-100 text-slate-500">
                                    Disabled
                                  </span>
                                )}
                                {/* Deactivate/Activate: ONLY for Admin */}
                                {currentUser?.role === 'ADMIN' && (
                                  <button
                                    type="button"
                                    onClick={() => handleToggleStatus(u._id)}
                                    className="text-[10px] font-bold text-slate-400 hover:text-slate-700 underline cursor-pointer ml-1"
                                    title={u.isActive ? 'Deactivate user account' : 'Activate user account'}
                                  >
                                    {u.isActive ? 'Deactivate' : 'Activate'}
                                  </button>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* If pending: both Admin and Faculty Coordinator can approve/reject */}
                              {isPending && ['ADMIN', 'FACULTY_COORDINATOR'].includes(currentUser?.role) && (
                                <>
                                  <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={() => handleApprove(u)}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                                    title="Approve Login Credentials"
                                  >
                                    <UserCheck className="w-3.5 h-3.5 mr-1" /> Approve
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleOpenReject(u)}
                                    className="text-rose-600 border-rose-200"
                                    title="Reject Registration"
                                  >
                                    <UserX className="w-3.5 h-3.5 mr-1" /> Reject
                                  </Button>
                                </>
                              )}

                              {/* Wallet management for Admin and Faculty Coordinator */}
                              {['ADMIN', 'FACULTY_COORDINATOR'].includes(currentUser?.role) && (
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => handleOpenWalletModal(u)}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                                  title="Add or manage wallet funds"
                                >
                                  <Wallet className="w-3.5 h-3.5 mr-1" /> Wallet
                                </Button>
                              )}

                              {/* Edit User Details: ONLY for Admin (Removed for Faculty Coordinator) */}
                              {currentUser?.role === 'ADMIN' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditClick(u)}
                                  title="Edit User Details"
                                >
                                  <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit
                                </Button>
                              )}

                              {/* Reset Password ONLY for Admin (Faculty cannot access) */}
                              {currentUser?.role === 'ADMIN' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedUser(u);
                                    setShowResetModal(true);
                                  }}
                                  title="Reset Password"
                                >
                                  <KeyRound className="w-3.5 h-3.5 mr-1" /> Reset Pwd
                                </Button>
                              )}

                              {/* Delete User Login: ONLY for Admin (Removed for Faculty Coordinator) */}
                              {currentUser?.role === 'ADMIN' && (
                                <Button
                                  variant="danger"
                                  size="sm"
                                  onClick={() => handleDeleteUser(u)}
                                  title="Delete User Login"
                                  className="bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white border border-rose-200 font-bold"
                                >
                                  <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* REJECT USER MODAL */}
      {showRejectModal && selectedUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 rounded-2xl border border-slate-200 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">
              Reject Registration for {selectedUser.fullName}
            </h3>
            <p className="text-xs text-slate-500">
              This will decline access for {selectedUser.email}. You can provide an optional explanation to be included in the email notice.
            </p>
            <form onSubmit={handleConfirmReject} className="space-y-4">
              <FormField label="Rejection Reason (Optional)">
                <Input
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Unverified college credentials"
                />
              </FormField>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" type="button" onClick={() => setShowRejectModal(false)}>
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  type="submit"
                  loading={actionLoading}
                  className="font-bold"
                >
                  Confirm Rejection
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD USER MODAL (Admin) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-2xl w-full p-6 rounded-2xl border border-slate-200 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Create New System User & Profile</h3>
                <p className="text-xs text-slate-500">Add an approved member/official with academic details & credentials</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Full Name" required>
                  <Input
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g. Arun Kumar"
                    required
                  />
                </FormField>

                <FormField label="Username" required>
                  <Input
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="arunkumar"
                    required
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Email Address" required>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="arun@panimalar.ac.in"
                    required
                  />
                </FormField>

                <FormField label="Password" required>
                  <div className="relative">
                    <Input
                      type={showAddUserPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="••••••••"
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAddUserPassword(!showAddUserPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors p-1"
                      tabIndex={-1}
                      title={showAddUserPassword ? 'Hide password' : 'View password'}
                    >
                      {showAddUserPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </FormField>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="System Access Role" required>
                  <Select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    options={roleOptions}
                    required
                  />
                </FormField>

                <FormField label="Role Playing in Club" required>
                  <Select
                    value={formData.clubRole}
                    onChange={(e) => setFormData({ ...formData, clubRole: e.target.value })}
                    options={clubRoleOptions}
                    required
                  />
                </FormField>
              </div>

              {formData.clubRole === 'OTHERS' && (
                <FormField label="Specify Club Role Manually" required>
                  <Input
                    value={formData.customClubRole}
                    onChange={(e) => setFormData({ ...formData, customClubRole: e.target.value })}
                    placeholder="e.g. Creative Lead, PR Coordinator"
                    required
                  />
                </FormField>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Department" required>
                  <Select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    options={departmentOptions}
                    required
                  />
                </FormField>

                {formData.department === 'OTHERS' ? (
                  <FormField label="Specify Department Name" required>
                    <Input
                      value={formData.customDepartment}
                      onChange={(e) => setFormData({ ...formData, customDepartment: e.target.value })}
                      placeholder="e.g. Mechatronics"
                      required
                    />
                  </FormField>
                ) : (
                  <FormField label="College Roll Number / Reg No" required>
                    <Input
                      value={formData.rollNo}
                      onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                      placeholder="e.g. 2024PECAI458"
                      required
                    />
                  </FormField>
                )}
              </div>

              {formData.department === 'OTHERS' && (
                <FormField label="College Roll Number / Reg No" required>
                  <Input
                    value={formData.rollNo}
                    onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                    placeholder="e.g. 2024PECAI458"
                    required
                  />
                </FormField>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Year of Study" required>
                  <Select
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    options={yearOptions}
                    required
                  />
                </FormField>

                <FormField label="Section" required>
                  <Select
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    options={sectionOptions}
                    required
                  />
                </FormField>
              </div>

              {formData.section === 'OTHER' && (
                <FormField label="Specify Section Name" required>
                  <Input
                    value={formData.customSection}
                    onChange={(e) => setFormData({ ...formData, customSection: e.target.value })}
                    placeholder="e.g. Section E, CS-1"
                    required
                  />
                </FormField>
              )}

              <FormField
                label="Mobile Number"
                required
                helpText="Standard 10-digit mobile number (e.g. 9087516907)"
              >
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g. 9087516907"
                  required
                />
              </FormField>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button variant="outline" type="button" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" className="font-bold">
                  Create User & Profile
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-2xl w-full p-6 rounded-2xl border border-slate-200 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Edit User Profile Details</h3>
                <p className="text-xs text-slate-500">Updating profile and credentials for {selectedUser.email}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Full Name" required>
                  <Input
                    value={editFormData.fullName}
                    onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                    required
                  />
                </FormField>

                <FormField label="Email Address" required>
                  <Input
                    type="email"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    required
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  label="System Role"
                  required
                  helpText={currentUser?.role !== 'ADMIN' ? 'Only Admin can modify system roles' : undefined}
                >
                  <Select
                    value={editFormData.role}
                    onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                    options={roleOptions}
                    disabled={currentUser?.role !== 'ADMIN'}
                  />
                </FormField>

                <FormField
                  label="Role Playing in Club"
                  required
                  helpText={currentUser?.role !== 'ADMIN' ? 'Only Admin can modify club roles' : undefined}
                >
                  <Select
                    value={editFormData.clubRole}
                    onChange={(e) => setEditFormData({ ...editFormData, clubRole: e.target.value })}
                    options={clubRoleOptions}
                    disabled={currentUser?.role !== 'ADMIN'}
                  />
                </FormField>
              </div>

              {editFormData.clubRole === 'OTHERS' && (
                <FormField label="Specify Club Role Manually" required>
                  <Input
                    value={editFormData.customClubRole}
                    onChange={(e) => setEditFormData({ ...editFormData, customClubRole: e.target.value })}
                    placeholder="e.g. Tech Lead, Logistics"
                    disabled={currentUser?.role !== 'ADMIN'}
                    required
                  />
                </FormField>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Department" required>
                  <Select
                    value={editFormData.department}
                    onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })}
                    options={departmentOptions}
                  />
                </FormField>

                {editFormData.department === 'OTHERS' ? (
                  <FormField label="Specify Department Name" required>
                    <Input
                      value={editFormData.customDepartment}
                      onChange={(e) => setEditFormData({ ...editFormData, customDepartment: e.target.value })}
                      placeholder="e.g. Civil Engineering"
                      required
                    />
                  </FormField>
                ) : (
                  <FormField label="College Roll Number / Reg No" required>
                    <Input
                      value={editFormData.rollNo}
                      onChange={(e) => setEditFormData({ ...editFormData, rollNo: e.target.value })}
                      placeholder="e.g. 2024PECAI458"
                      required
                    />
                  </FormField>
                )}
              </div>

              {editFormData.department === 'OTHERS' && (
                <FormField label="College Roll Number / Reg No" required>
                  <Input
                    value={editFormData.rollNo}
                    onChange={(e) => setEditFormData({ ...editFormData, rollNo: e.target.value })}
                    placeholder="e.g. 2024PECAI458"
                    required
                  />
                </FormField>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Year of Study" required>
                  <Select
                    value={editFormData.year}
                    onChange={(e) => setEditFormData({ ...editFormData, year: e.target.value })}
                    options={yearOptions}
                  />
                </FormField>

                <FormField label="Section" required>
                  <Select
                    value={editFormData.section}
                    onChange={(e) => setEditFormData({ ...editFormData, section: e.target.value })}
                    options={sectionOptions}
                  />
                </FormField>
              </div>

              {editFormData.section === 'OTHER' && (
                <FormField label="Specify Section Name" required>
                  <Input
                    value={editFormData.customSection}
                    onChange={(e) => setEditFormData({ ...editFormData, customSection: e.target.value })}
                    placeholder="e.g. Section E, CS-1"
                    required
                  />
                </FormField>
              )}

              <FormField
                label="Mobile Number"
                required
                helpText="Standard 10-digit mobile number (e.g. 9087516907)"
              >
                <Input
                  type="tel"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                  placeholder="e.g. 9087516907"
                  required
                />
              </FormField>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button variant="outline" type="button" onClick={() => setShowEditModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" className="font-bold">
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESET PASSWORD MODAL */}
      {showResetModal && selectedUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 rounded-2xl border border-slate-200 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Reset Password for {selectedUser.fullName}</h3>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <FormField label="New Secure Password" required>
                <div className="relative">
                  <Input
                    type={showResetPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password..."
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetPassword(!showResetPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors p-1"
                    tabIndex={-1}
                    title={showResetPassword ? 'Hide password' : 'View password'}
                  >
                    {showResetPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </FormField>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" type="button" onClick={() => setShowResetModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Confirm Password Reset
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MANAGE USER WALLET MODAL (Admin & Faculty Coordinator) */}
      {showWalletModal && walletUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 rounded-2xl border border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <Wallet className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Manage User Wallet</h3>
                  <p className="text-xs text-slate-500">{walletUser.fullName} ({walletUser.role})</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowWalletModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current Wallet Balance</p>
                <p className="text-xl font-black text-emerald-600">₹{(walletUser.walletBalance || 0).toLocaleString('en-IN')}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Allocated</p>
                <p className="text-xs font-bold text-slate-700">₹{(walletUser.totalWalletAllocated || 0).toLocaleString('en-IN')}</p>
              </div>
            </div>

            <form onSubmit={handleWalletSubmit} className="space-y-4">
              <FormField label="Transaction Type" required>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setWalletAction('ADD')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      walletAction === 'ADD'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    + Add Funds (Credit)
                  </button>
                  <button
                    type="button"
                    onClick={() => setWalletAction('DEDUCT')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      walletAction === 'DEDUCT'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    - Deduct Funds (Debit)
                  </button>
                </div>
              </FormField>

              <FormField label="Amount (₹)" required>
                <Input
                  type="number"
                  value={walletAmount}
                  onChange={(e) => setWalletAmount(e.target.value)}
                  placeholder="e.g. 5000"
                  min="0.01"
                  step="0.01"
                  required
                />
              </FormField>

              <FormField label="Reason / Allocation Note" helpText="Explanation for member and audit logs">
                <Input
                  value={walletNote}
                  onChange={(e) => setWalletNote(e.target.value)}
                  placeholder="e.g. Advance allowance for event materials"
                />
              </FormField>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setShowWalletModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  loading={actionLoading}
                  className={walletAction === 'ADD' ? 'bg-emerald-600 hover:bg-emerald-700 font-bold' : 'bg-rose-600 hover:bg-rose-700 font-bold'}
                >
                  {walletAction === 'ADD' ? 'Add Funds to Wallet' : 'Deduct from Wallet'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
