'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import API from '../../../services/api';
import AmountText from '../../../components/atoms/AmountText';
import Button from '../../../components/atoms/Button';
import Input from '../../../components/atoms/Input';
import Textarea from '../../../components/atoms/Textarea';
import Select from '../../../components/atoms/Select';
import FormField from '../../../components/molecules/FormField';
import { Calendar, PlusCircle, MapPin, AlertCircle, Pencil, Trash2 } from 'lucide-react';

export default function EventsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    venue: 'Main Campus',
    allocatedBudget: '',
  });
  const [editFormData, setEditFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    venue: '',
    allocatedBudget: '',
    status: 'ACTIVE',
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await API.get('/events');
      if (res.data.success) {
        setEvents(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleEventStatus = async (ev) => {
    try {
      setActionLoading(true);
      const isCurrentlyActive = ev.isActive !== false && ev.status !== 'COMPLETED' && ev.status !== 'CANCELLED';
      const nextActive = !isCurrentlyActive;
      const res = await API.patch(`/events/${ev._id}/toggle-status`, { isActive: nextActive });
      if (res.data.success) {
        setMessage({
          type: 'success',
          text: `Event '${ev.name}' is now ${nextActive ? 'ACTIVE (Open for Expenses)' : 'ENDED / CLOSED (Expenses in this name will not be showed when submitting)'}`,
        });
        fetchEvents();
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || err.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteEvent = async (ev) => {
    if (
      !confirm(
        `Are you sure you want to permanently delete event "${ev.name}"? Any linked expenses will be safely unlinked.`
      )
    ) {
      return;
    }

    try {
      setActionLoading(true);
      const res = await API.delete(`/events/${ev._id}`);
      if (res.data.success) {
        setMessage({ type: 'success', text: `Event '${ev.name}' deleted successfully.` });
        fetchEvents();
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || err.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        allocatedBudget: formData.allocatedBudget !== '' ? Number(formData.allocatedBudget) : 0,
      };
      const res = await API.post('/events', payload);
      if (res.data.success) {
        setShowAddModal(false);
        setMessage({ type: 'success', text: `Event '${formData.name}' created successfully.` });
        setFormData({
          name: '',
          description: '',
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0],
          venue: 'Main Campus',
          allocatedBudget: '',
        });
        fetchEvents();
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleOpenEditModal = (ev) => {
    setEditingEvent(ev);
    setEditFormData({
      name: ev.name || '',
      description: ev.description || '',
      startDate: ev.startDate ? new Date(ev.startDate).toISOString().split('T')[0] : '',
      endDate: ev.endDate ? new Date(ev.endDate).toISOString().split('T')[0] : '',
      venue: ev.venue || 'Main Campus',
      allocatedBudget: ev.allocatedBudget !== undefined && ev.allocatedBudget !== null ? String(ev.allocatedBudget) : '',
      status: ev.status || 'ACTIVE',
    });
    setShowEditModal(true);
  };

  const handleUpdateEvent = async (e) => {
    e.preventDefault();
    if (!editingEvent) return;
    try {
      setActionLoading(true);
      const payload = {
        ...editFormData,
        allocatedBudget: editFormData.allocatedBudget !== '' ? Number(editFormData.allocatedBudget) : 0,
      };
      const res = await API.put(`/events/${editingEvent._id}`, payload);
      if (res.data.success) {
        setShowEditModal(false);
        setEditingEvent(null);
        setMessage({ type: 'success', text: `Event '${editFormData.name}' updated successfully.` });
        fetchEvents();
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const userRole = user?.role ? String(user.role).toUpperCase() : '';
  const canManageEvents = !userRole || ['ADMIN', 'FACULTY_COORDINATOR', 'TREASURER', 'FINANCER'].includes(userRole);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-600" /> Event Management & Allocations
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Organize club events, set optional event-specific budgets, monitor automatic expense tracking, and toggle or delete events.
          </p>
        </div>

        {canManageEvents && (
          <Button
            variant="primary"
            size="md"
            onClick={() => {
              setFormData({
                name: '',
                description: '',
                startDate: new Date().toISOString().split('T')[0],
                endDate: new Date().toISOString().split('T')[0],
                venue: 'Main Campus',
                allocatedBudget: '',
              });
              setShowAddModal(true);
            }}
            className="font-bold shadow-md shadow-blue-500/20 w-full sm:w-auto"
          >
            <PlusCircle className="w-4 h-4 mr-2" /> Create New Event
          </Button>
        )}
      </div>

      {/* Action Notification Banner */}
      {message.text && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between text-xs font-semibold ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <span>{message.text}</span>
          <button
            onClick={() => setMessage({ type: '', text: '' })}
            className="text-slate-400 hover:text-slate-600 ml-4 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-2 p-12 text-center text-xs text-slate-500">Loading events...</div>
        ) : events.length === 0 ? (
          <div className="col-span-2 p-12 text-center text-xs text-slate-500">No events created yet.</div>
        ) : (
          events.map((ev) => {
            const util = ev.budgetUtilization || {};
            const percent = util.percentageUsed || 0;
            const paidExpenses = (ev.expenses || []).filter((x) => ['PAID', 'VERIFIED'].includes(x.status));
            const isEnded = ev.isActive === false || ev.status === 'COMPLETED' || ev.status === 'CANCELLED';

            return (
              <div
                key={ev._id}
                className={`bg-white p-6 rounded-2xl border transition-all shadow-xs space-y-4 ${
                  isEnded ? 'border-slate-300/80 bg-slate-50/60 opacity-90' : 'border-slate-200/80'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      {isEnded ? (
                        <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase bg-rose-50 text-rose-700 border border-rose-200 rounded-md">
                          ENDED (OFF)
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md">
                          {ev.status || 'ACTIVE'}
                        </span>
                      )}
                      {isEnded && (
                        <span className="text-[10px] font-medium text-slate-400">
                          (Hidden from expense submissions)
                        </span>
                      )}
                    </div>
                    <h3 className={`text-lg font-extrabold mt-2 ${isEnded ? 'text-slate-700' : 'text-slate-900'}`}>
                      {ev.name}
                    </h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" /> {ev.venue}
                    </p>
                  </div>

                  <div className="text-right flex-shrink-0 flex flex-col items-end gap-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Allocated Budget</p>
                    {ev.allocatedBudget > 0 ? (
                      <AmountText amount={ev.allocatedBudget} size="md" />
                    ) : (
                      <span className="text-xs font-bold text-slate-400 italic">Optional (Not Set)</span>
                    )}

                    {canManageEvents && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <button
                          type="button"
                          disabled={actionLoading}
                          onClick={() => handleOpenEditModal(ev)}
                          className="p-1.5 text-blue-600 hover:text-white hover:bg-blue-600 bg-blue-50 rounded-lg border border-blue-200 transition-all cursor-pointer shadow-2xs"
                          title="Edit event"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={actionLoading}
                          onClick={() => handleDeleteEvent(ev)}
                          className="p-1.5 text-rose-600 hover:text-white hover:bg-rose-600 bg-rose-50 rounded-lg border border-rose-200 transition-all cursor-pointer shadow-2xs"
                          title="Delete event"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {ev.description || 'No description provided.'}
                </p>

                {/* Management Controls: Dynamic Active/Ended switch, Edit, and Delete Option */}
                {canManageEvents && (
                  <div className="p-3 bg-slate-100/70 rounded-xl border border-slate-200/70 flex flex-wrap items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-700">Status:</span>
                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={() => handleToggleEventStatus(ev)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                          isEnded
                            ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                            : 'bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-300'
                        }`}
                        title={isEnded ? 'Turn event ON to allow expense submissions' : 'Turn event OFF to end event and hide from expense submissions'}
                      >
                        <span className={`w-2 h-2 rounded-full ${isEnded ? 'bg-white' : 'bg-amber-600 animate-pulse'}`} />
                        {isEnded ? 'Activate / Turn ON' : 'Turn OFF (End Event)'}
                      </button>
                    </div>

                    <div className="flex items-center gap-2 ml-auto sm:ml-0">
                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={() => handleOpenEditModal(ev)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-600 hover:text-white border border-blue-200 transition-all cursor-pointer shadow-2xs"
                        title="Edit event details"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={() => handleDeleteEvent(ev)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-rose-600 hover:text-white hover:bg-rose-600 border border-rose-200 hover:border-rose-600 transition-all cursor-pointer shadow-2xs"
                        title="Permanently delete this event"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Budget Utilization & Event Expense Tracking */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <div className="flex justify-between text-xs font-semibold text-slate-600">
                    <span className="font-bold text-slate-800">
                      Event Expense: ₹{(util.spentAmount || 0).toLocaleString('en-IN')}
                    </span>
                    <span className={percent > 100 ? 'text-rose-600 font-extrabold' : 'text-slate-500'}>
                      {ev.allocatedBudget > 0 ? `${percent}% Used` : 'Flexible (No Limit)'}
                    </span>
                  </div>

                  {ev.allocatedBudget > 0 ? (
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          percent > 100 ? 'bg-rose-600' : percent >= 80 ? 'bg-amber-500' : 'bg-blue-600'
                        }`}
                        style={{ width: `${Math.min(percent, 100)}%` }}
                      />
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-400">
                      Paid expenses for this event are automatically added and accumulated here.
                    </div>
                  )}

                  {/* Auto-tracked Paid Event Expenses List Preview */}
                  {paidExpenses.length > 0 && (
                    <div className="pt-2 border-t border-slate-100">
                      <p className="text-[11px] font-bold text-slate-500 mb-1">
                        Paid Event Expenses ({paidExpenses.length}):
                      </p>
                      <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                        {paidExpenses.slice(0, 3).map((exp) => (
                          <div
                            key={exp._id}
                            className="flex items-center justify-between py-1 px-2.5 bg-slate-50 rounded-lg text-[11px]"
                          >
                            <span className="font-medium text-slate-700 truncate max-w-[190px]">
                              {exp.title}
                            </span>
                            <span className="font-bold text-slate-900">
                              ₹{exp.approvedAmount || exp.amount}
                            </span>
                          </div>
                        ))}
                        {paidExpenses.length > 3 && (
                          <p className="text-[10px] text-slate-400 text-center">
                            +{paidExpenses.length - 3} more paid expenses
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* CREATE EVENT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 rounded-2xl border border-slate-200 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Create New Club Event</h3>
            <form onSubmit={handleAddEvent} className="space-y-4">
              <FormField label="Event Name" required>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Annual TechFest 2026"
                  required
                />
              </FormField>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Start Date" required>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </FormField>
                <FormField label="End Date" required>
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    required
                  />
                </FormField>
              </div>

              <FormField label="Allocated Event Budget (₹) (Optional)">
                <Input
                  type="number"
                  value={formData.allocatedBudget}
                  onChange={(e) => setFormData({ ...formData, allocatedBudget: e.target.value })}
                  placeholder="e.g. 50000 (Optional)"
                  min="0"
                />
              </FormField>

              <FormField label="Venue">
                <Input
                  value={formData.venue}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  placeholder="Main Auditorium"
                />
              </FormField>

              <FormField label="Description">
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Event agenda and objective details..."
                />
              </FormField>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" type="button" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Create Event
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT EVENT MODAL */}
      {showEditModal && editingEvent && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white max-w-md w-full p-6 rounded-2xl border border-slate-200 shadow-xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Pencil className="w-5 h-5 text-blue-600" /> Edit Event Details
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowEditModal(false);
                  setEditingEvent(null);
                }}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateEvent} className="space-y-4">
              <FormField label="Event Name" required>
                <Input
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  placeholder="e.g. Annual TechFest 2026"
                  required
                />
              </FormField>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Start Date" required>
                  <Input
                    type="date"
                    value={editFormData.startDate}
                    onChange={(e) => setEditFormData({ ...editFormData, startDate: e.target.value })}
                    required
                  />
                </FormField>
                <FormField label="End Date" required>
                  <Input
                    type="date"
                    value={editFormData.endDate}
                    onChange={(e) => setEditFormData({ ...editFormData, endDate: e.target.value })}
                    required
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Allocated Budget (₹)">
                  <Input
                    type="number"
                    value={editFormData.allocatedBudget}
                    onChange={(e) => setEditFormData({ ...editFormData, allocatedBudget: e.target.value })}
                    placeholder="e.g. 50000"
                    min="0"
                  />
                </FormField>

                <FormField label="Event Status">
                  <Select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                    options={[
                      { value: 'UPCOMING', label: 'Upcoming' },
                      { value: 'ACTIVE', label: 'Active (Open)' },
                      { value: 'COMPLETED', label: 'Completed' },
                      { value: 'CANCELLED', label: 'Cancelled' },
                    ]}
                  />
                </FormField>
              </div>

              <FormField label="Venue">
                <Input
                  value={editFormData.venue}
                  onChange={(e) => setEditFormData({ ...editFormData, venue: e.target.value })}
                  placeholder="Main Auditorium"
                />
              </FormField>

              <FormField label="Description">
                <Textarea
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  placeholder="Event agenda and objective details..."
                />
              </FormField>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingEvent(null);
                  }}
                >
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={actionLoading}>
                  {actionLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
