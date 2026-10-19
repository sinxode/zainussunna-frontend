import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  UserCheck,
  Plus,
  KeyRound,
  Calendar,
  AlertTriangle,
  History,
  Eye,
  Edit3,
  Power,
  Info
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useCampaign } from '../../context/CampaignContext';
import { useToast } from '../../context/ToastContext';
import { User, AuditLog, Campaign } from '../../types';
import { formatIndianDate, formatIndianDateTime } from '../../utils/formatters';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';

export const SettingsPage: React.FC = () => {
  const { user, isSuperAdmin } = useAuth();
  const { campaigns, activeCampaign, activeCampaignId, setActiveCampaignId, refreshCampaigns } = useCampaign();
  const { success, error, warning } = useToast();
  const queryClient = useQueryClient();

  const isAuthorizedAdmin = Boolean(isSuperAdmin || user?.role === 'admin');

  // Tabs
  const [activeTab, setActiveTab] = useState<'campaign' | 'users' | 'password' | 'audit'>('campaign');

  // Campaign creation modal
  const [newCampaignModalOpen, setNewCampaignModalOpen] = useState(false);
  const [campaignYear, setCampaignYear] = useState<number>(new Date().getFullYear() + 1);
  const [campaignName, setCampaignName] = useState('');
  const [printedQty, setPrintedQty] = useState<number>(2000);
  const [costPrice, setCostPrice] = useState<string>('11.00');
  const [minSellingPrice, setMinSellingPrice] = useState<string>('20.00');
  const [commissionRate, setCommissionRate] = useState<string>('10.00');

  // Campaign editing modal
  const [editCampaignModalOpen, setEditCampaignModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [editCampaignName, setEditCampaignName] = useState('');
  const [editCampaignYear, setEditCampaignYear] = useState<number>(2026);
  const [editPrintedQty, setEditPrintedQty] = useState<number>(2000);
  const [editCostPrice, setEditCostPrice] = useState<string>('11.00');
  const [editMinSellingPrice, setEditMinSellingPrice] = useState<string>('20.00');
  const [editCommissionRate, setEditCommissionRate] = useState<string>('10.00');
  const [editStatus, setEditStatus] = useState<'active' | 'closed'>('active');
  const [editErrorMessage, setEditErrorMessage] = useState<string | null>(null);

  // Campaign confirmation modal
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    type: 'activate' | 'close';
    campaign: Campaign;
  } | null>(null);

  const openEditModal = (camp: Campaign) => {
    setEditingCampaign(camp);
    setEditCampaignName(camp.name);
    setEditCampaignYear(camp.year);
    setEditPrintedQty(camp.printed_quantity);
    setEditCostPrice(String(camp.cost_price_per_calendar));
    setEditMinSellingPrice(String(camp.min_expected_collection_per_calendar));
    setEditCommissionRate(String(camp.commission_percentage));
    setEditStatus(camp.status);
    setEditErrorMessage(null);
    setEditCampaignModalOpen(true);
  };

  // User creation modal
  const [newUserModalOpen, setNewUserModalOpen] = useState(false);
  const [newPhone, setNewPhone] = useState('');
  const [newName, setNewName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'super_admin'>('admin');

  // Reset password modal
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [selectedUserToReset, setSelectedUserToReset] = useState<User | null>(null);
  const [resetPasswordVal, setResetPasswordVal] = useState('');

  // Self change password
  const [oldPassword, setOldPassword] = useState('');
  const [newSelfPassword, setNewSelfPassword] = useState('');
  const [confirmSelfPassword, setConfirmSelfPassword] = useState('');

  // Audit snapshot viewer
  const [selectedAuditLog, setSelectedAuditLog] = useState<AuditLog | null>(null);

  // Queries
  const { data: usersData } = useQuery({
    queryKey: ['users'],
    queryFn: () => (isSuperAdmin ? api.getUsers() : null),
    enabled: isSuperAdmin,
  });

  const { data: auditData } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: () => (isSuperAdmin ? api.getAuditLogs() : null),
    enabled: isSuperAdmin,
  });

  const users: User[] = Array.isArray(usersData) ? usersData : usersData?.results || [];
  const auditLogs: AuditLog[] = Array.isArray(auditData) ? auditData : auditData?.results || [];

  // Create Campaign Mutation
  const createCampaignMutation = useMutation({
    mutationFn: () => {
      return api.createCampaign({
        year: campaignYear,
        name: campaignName.trim() || `Calendar Fund ${campaignYear}`,
        printed_quantity: printedQty,
        cost_price_per_calendar: costPrice,
        min_expected_collection_per_calendar: minSellingPrice,
        commission_percentage: commissionRate,
      });
    },
    onSuccess: (data) => {
      success(`Campaign ${data.year} created successfully.`);
      setNewCampaignModalOpen(false);
      refreshCampaigns();
    },
    onError: (err: any) => {
      error(err.message || 'Failed to create campaign.');
    },
  });

  // Close Campaign Mutation
  const closeCampaignMutation = useMutation({
    mutationFn: (id: number) => api.closeCampaign(id),
    onSuccess: (data) => {
      success(data.detail || 'Campaign closed successfully.');
      setConfirmModalOpen(false);
      setConfirmAction(null);
      refreshCampaigns();
      queryClient.invalidateQueries({ queryKey: ['campaign-summary'] });
    },
    onError: (err: any) => {
      error(err.message || 'Cannot close campaign: ensure all trips are settled.');
    },
  });

  // Activate Campaign Mutation
  const activateCampaignMutation = useMutation({
    mutationFn: (id: number) => api.activateCampaign(id),
    onSuccess: (data) => {
      success(data.detail || 'Campaign activated successfully.');
      setConfirmModalOpen(false);
      setConfirmAction(null);
      refreshCampaigns();
      queryClient.invalidateQueries({ queryKey: ['campaign-summary'] });
    },
    onError: (err: any) => {
      error(err.message || 'Failed to activate campaign.');
    },
  });

  // Update Campaign Mutation
  const updateCampaignMutation = useMutation({
    mutationFn: () => {
      if (!editingCampaign) throw new Error('No campaign selected.');
      return api.updateCampaign(editingCampaign.id, {
        name: editCampaignName.trim() || `Calendar Fund ${editCampaignYear}`,
        year: editCampaignYear,
        printed_quantity: editPrintedQty,
        cost_price_per_calendar: editCostPrice,
        min_expected_collection_per_calendar: editMinSellingPrice,
        commission_percentage: editCommissionRate,
        status: editStatus,
      });
    },
    onSuccess: (data) => {
      success(`Campaign ${data.year} updated successfully.`);
      setEditCampaignModalOpen(false);
      setEditingCampaign(null);
      setEditErrorMessage(null);
      refreshCampaigns();
      queryClient.invalidateQueries({ queryKey: ['campaign-summary'] });
    },
    onError: (err: any) => {
      const msg = err.message || 'Failed to update campaign.';
      setEditErrorMessage(msg);
      error(msg);
    },
  });

  // Create User Mutation
  const createUserMutation = useMutation({
    mutationFn: () => {
      return api.createUser({
        phone_number: newPhone.trim(),
        display_name: newName.trim(),
        password: newPassword,
        role: newRole,
      });
    },
    onSuccess: (data) => {
      success(`User ${data.display_name} created successfully.`);
      setNewUserModalOpen(false);
      setNewPhone('');
      setNewName('');
      setNewPassword('');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (err: any) => {
      error(err.message || 'Failed to create user account.');
    },
  });

  // Reset Password Mutation
  const resetPasswordMutation = useMutation({
    mutationFn: () => {
      if (!selectedUserToReset) throw new Error('No user selected');
      return api.resetPassword(selectedUserToReset.id, resetPasswordVal);
    },
    onSuccess: () => {
      success(`Password reset for ${selectedUserToReset?.display_name}.`);
      setResetModalOpen(false);
      setSelectedUserToReset(null);
      setResetPasswordVal('');
    },
    onError: (err: any) => {
      error(err.message || 'Failed to reset password.');
    },
  });

  // Change Own Password Mutation
  const changePasswordMutation = useMutation({
    mutationFn: () => {
      if (newSelfPassword !== confirmSelfPassword) {
        throw new Error('New passwords do not match.');
      }
      return api.changePassword(oldPassword, newSelfPassword);
    },
    onSuccess: () => {
      success('Password changed successfully.');
      setOldPassword('');
      setNewSelfPassword('');
      setConfirmSelfPassword('');
    },
    onError: (err: any) => {
      error(err.message || 'Failed to change password.');
    },
  });

  // Toggle User Active
  const handleToggleActive = async (targetUser: User) => {
    try {
      await api.toggleUserActive(targetUser.id);
      success(`User account status updated.`);
      queryClient.invalidateQueries({ queryKey: ['users'] });
    } catch (err: any) {
      error(err.message || 'Failed to update account status.');
    }
  };

  const proposedPrintingExpense = printedQty * parseFloat(costPrice || '0');
  const editProposedPrintingExpense = editPrintedQty * parseFloat(editCostPrice || '0');
  const editExpectedMinGross = editPrintedQty * parseFloat(editMinSellingPrice || '0');

  return (
    <div>
      {/* Page Header */}
      <div className="zcm-page-header">
        <div>
          <h1 className="zcm-page-header__title">System Administration & Settings</h1>
          <div className="zcm-page-header__sub">
            Manage campaign years, staff administrator accounts, security credentials, and view immutable audit trails.
          </div>
        </div>
      </div>

      {/* Settings Navigation Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid #1E293B', paddingBottom: '0.5rem', flexWrap: 'wrap' }}>
        <button
          className={`zcm-btn zcm-btn--sm ${activeTab === 'campaign' ? 'zcm-btn--primary' : 'zcm-btn--secondary'}`}
          onClick={() => setActiveTab('campaign')}
        >
          <Calendar size={14} />
          <span>Campaign Management</span>
        </button>

        {isSuperAdmin && (
          <button
            className={`zcm-btn zcm-btn--sm ${activeTab === 'users' ? 'zcm-btn--primary' : 'zcm-btn--secondary'}`}
            onClick={() => setActiveTab('users')}
          >
            <UserCheck size={14} />
            <span>User Accounts</span>
          </button>
        )}

        <button
          className={`zcm-btn zcm-btn--sm ${activeTab === 'password' ? 'zcm-btn--primary' : 'zcm-btn--secondary'}`}
          onClick={() => setActiveTab('password')}
        >
          <KeyRound size={14} />
          <span>Change Password</span>
        </button>

        {isSuperAdmin && (
          <button
            className={`zcm-btn zcm-btn--sm ${activeTab === 'audit' ? 'zcm-btn--primary' : 'zcm-btn--secondary'}`}
            onClick={() => setActiveTab('audit')}
          >
            <History size={14} />
            <span>Audit Trail</span>
          </button>
        )}
      </div>

      {/* TAB 1: CAMPAIGN MANAGEMENT */}
      {activeTab === 'campaign' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Active Campaign Spotlight Hero Card */}
          {activeCampaign && (
            <div className="zcm-hero-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.45rem' }}>
                    <span className="zcm-badge zcm-badge--success" style={{ padding: '0.25rem 0.75rem', fontSize: '0.78rem' }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981', display: 'inline-block', boxShadow: '0 0 8px #10B981' }}></span>
                      CURRENT ACTIVE CAMPAIGN
                    </span>
                    <span style={{ color: '#94A3B8', fontSize: '0.85rem' }}>• Year {activeCampaign.year}</span>
                  </div>
                  <h2 style={{ fontSize: '1.45rem', fontWeight: 700, color: '#F8FAFC', margin: 0, letterSpacing: '-0.02em' }}>
                    {activeCampaign.name}
                  </h2>
                </div>

                {isAuthorizedAdmin && (
                  <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                    <button
                      className="zcm-btn zcm-btn--cyan zcm-btn--sm"
                      onClick={() => openEditModal(activeCampaign)}
                      title="Edit settings for current active campaign"
                    >
                      <Edit3 size={14} />
                      <span>Edit Settings</span>
                    </button>
                    {activeCampaign.status === 'active' && (
                      <button
                        className="zcm-btn zcm-btn--danger zcm-btn--sm"
                        onClick={() => {
                          setConfirmAction({ type: 'close', campaign: activeCampaign });
                          setConfirmModalOpen(true);
                        }}
                        disabled={closeCampaignMutation.isPending}
                        title="Close active campaign and freeze commission"
                      >
                        <Power size={14} />
                        <span>Close Campaign</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Financial & Configuration Parameter Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
                gap: '0.85rem',
                background: 'rgba(15, 23, 42, 0.75)',
                padding: '1.1rem 1.25rem',
                borderRadius: '14px',
                border: '1px solid #1E293B'
              }}>
                <div>
                  <div style={{ fontSize: '0.73rem', color: '#94A3B8', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Printed Quantity
                  </div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#F8FAFC' }}>
                    {activeCampaign.printed_quantity.toLocaleString('en-IN')} <span style={{ fontSize: '0.8rem', fontWeight: 500, color: '#64748B' }}>units</span>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.73rem', color: '#94A3B8', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Unit Cost Price
                  </div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#38BDF8' }}>
                    ₹{Number(activeCampaign.cost_price_per_calendar).toFixed(2)}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.73rem', color: '#94A3B8', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Min Expected Price
                  </div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#FBBF24' }}>
                    ₹{Number(activeCampaign.min_expected_collection_per_calendar).toFixed(2)}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.73rem', color: '#94A3B8', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Student Commission
                  </div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#10B981' }}>
                    {Number(activeCampaign.commission_percentage).toFixed(1)}%
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.73rem', color: '#94A3B8', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Initial Printing Outlay
                  </div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#F8FAFC' }}>
                    ₹{Number(activeCampaign.proposed_printing_expense).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* All Campaigns Directory Table */}
          <div className="zcm-card zcm-card--flush">
            <div className="zcm-card__header">
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600 }}>All Annual Campaigns</h3>
                <div style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: '0.2rem' }}>
                  Manage campaign configurations, adjust unit prices and print runs, or reactivate past campaigns.
                </div>
              </div>
              {isAuthorizedAdmin && (
                <button
                  className="zcm-btn zcm-btn--primary zcm-btn--sm zcm-btn--animated"
                  onClick={() => setNewCampaignModalOpen(true)}
                >
                  <Plus size={14} />
                  <span>Create New Campaign</span>
                </button>
              )}
            </div>

            <div className="zcm-table-container">
              <table className="zcm-table">
                <thead>
                  <tr>
                    <th>Year</th>
                    <th>Campaign Name</th>
                    <th className="zcm-text-right">Printed Qty</th>
                    <th className="zcm-text-right">Cost / Cal. (₹)</th>
                    <th className="zcm-text-right">Min Price (₹)</th>
                    <th className="zcm-text-right">Commission (%)</th>
                    <th className="zcm-text-right">Printing Outlay (₹)</th>
                    <th>Status</th>
                    {isAuthorizedAdmin && <th className="zcm-text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((c) => {
                    const isViewing = activeCampaignId === c.id;
                    return (
                      <tr key={c.id} style={isViewing ? { background: 'rgba(56, 189, 248, 0.05)' } : undefined}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <strong style={{ fontSize: '0.9375rem', color: '#F8FAFC' }}>{c.year}</strong>
                            {c.status === 'active' && (
                              <span
                                title="Active Campaign"
                                style={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: '50%',
                                  background: '#10B981',
                                  boxShadow: '0 0 8px #10B981',
                                  display: 'inline-block'
                                }}
                              />
                            )}
                          </div>
                        </td>
                        <td>
                          <span style={{ fontWeight: 500 }}>{c.name}</span>
                        </td>
                        <td className="zcm-text-right zcm-num">{c.printed_quantity.toLocaleString('en-IN')}</td>
                        <td className="zcm-text-right zcm-num">₹{Number(c.cost_price_per_calendar).toFixed(2)}</td>
                        <td className="zcm-text-right zcm-num">₹{Number(c.min_expected_collection_per_calendar).toFixed(2)}</td>
                        <td className="zcm-text-right zcm-num">{Number(c.commission_percentage).toFixed(1)}%</td>
                        <td className="zcm-text-right zcm-num">₹{Number(c.proposed_printing_expense).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        <td>
                          <Badge variant={c.status === 'active' ? 'success' : 'neutral'}>
                            {c.status.toUpperCase()}
                          </Badge>
                        </td>
                        {isAuthorizedAdmin && (
                          <td className="zcm-text-right">
                            <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                              <button
                                className="zcm-btn zcm-btn--secondary zcm-btn--sm"
                                onClick={() => openEditModal(c)}
                                title="Edit campaign settings"
                              >
                                <Edit3 size={13} />
                                <span>Edit</span>
                              </button>

                              {c.status === 'closed' && (
                                <button
                                  className="zcm-btn zcm-btn--success zcm-btn--sm"
                                  onClick={() => {
                                    setConfirmAction({ type: 'activate', campaign: c });
                                    setConfirmModalOpen(true);
                                  }}
                                  disabled={activateCampaignMutation.isPending}
                                  title="Reactivate this campaign"
                                >
                                  <Power size={13} />
                                  <span>Activate</span>
                                </button>
                              )}

                              {c.status === 'active' && (
                                <button
                                  className="zcm-btn zcm-btn--danger zcm-btn--sm"
                                  onClick={() => {
                                    setConfirmAction({ type: 'close', campaign: c });
                                    setConfirmModalOpen(true);
                                  }}
                                  disabled={closeCampaignMutation.isPending}
                                  title="Close campaign and freeze commission snapshots"
                                >
                                  <Power size={13} />
                                  <span>Close</span>
                                </button>
                              )}

                              {!isViewing && (
                                <button
                                  className="zcm-btn zcm-btn--secondary zcm-btn--sm"
                                  onClick={() => {
                                    setActiveCampaignId(c.id);
                                    success(`Switched active session view to Campaign ${c.year}.`);
                                  }}
                                  title="Switch active session view to this campaign"
                                >
                                  <span>Select</span>
                                </button>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USER MANAGEMENT (SUPERADMIN ONLY) */}
      {activeTab === 'users' && isSuperAdmin && (
        <div className="zcm-card zcm-card--flush">
          <div className="zcm-card__header">
            <h3>Staff & Administrator Accounts</h3>
            <button
              className="zcm-btn zcm-btn--primary zcm-btn--sm"
              onClick={() => setNewUserModalOpen(true)}
            >
              <Plus size={14} />
              <span>Create Administrator</span>
            </button>
          </div>

          <div className="zcm-table-container">
            <table className="zcm-table">
              <thead>
                <tr>
                  <th>Display Name</th>
                  <th>Mobile Number</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Created Date</th>
                  <th className="zcm-text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <strong>{u.display_name}</strong>
                    </td>
                    <td>+91 {u.phone_number}</td>
                    <td>
                      <Badge variant={u.role === 'super_admin' ? 'success' : 'neutral'}>
                        {u.role === 'super_admin' ? 'Super Admin' : 'Staff Admin'}
                      </Badge>
                    </td>
                    <td>
                      <Badge variant={u.is_active ? 'success' : 'danger'}>
                        {u.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td>{formatIndianDate(u.created_at)}</td>
                    <td className="zcm-text-right">
                      <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                        <button
                          className="zcm-btn zcm-btn--secondary zcm-btn--sm"
                          onClick={() => {
                            setSelectedUserToReset(u);
                            setResetModalOpen(true);
                          }}
                        >
                          Reset Password
                        </button>

                        {u.id !== user?.id && (
                          <button
                            className="zcm-btn zcm-btn--secondary zcm-btn--sm"
                            onClick={() => handleToggleActive(u)}
                          >
                            {u.is_active ? 'Deactivate' : 'Reactivate'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: CHANGE OWN PASSWORD */}
      {activeTab === 'password' && (
        <div className="zcm-card" style={{ maxWidth: 440 }}>
          <div className="zcm-card__header">
            <h3>Change Your Password</h3>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              changePasswordMutation.mutate();
            }}
          >
            <div className="zcm-form-group">
              <label>Current Password *</label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
              />
            </div>
            <div className="zcm-form-group">
              <label>New Password (min 6 characters) *</label>
              <input
                type="password"
                value={newSelfPassword}
                onChange={(e) => setNewSelfPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <div className="zcm-form-group">
              <label>Confirm New Password *</label>
              <input
                type="password"
                value={confirmSelfPassword}
                onChange={(e) => setConfirmSelfPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="zcm-btn zcm-btn--primary"
              disabled={changePasswordMutation.isPending || !oldPassword || !newSelfPassword}
            >
              {changePasswordMutation.isPending ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: AUDIT TRAIL (SUPERADMIN ONLY) */}
      {activeTab === 'audit' && isSuperAdmin && (
        <div className="zcm-card zcm-card--flush">
          <div className="zcm-card__header">
            <h3>Immutable System Audit Logs</h3>
            <span style={{ fontSize: '0.78125rem', color: '#64748B' }}>
              Financial, dispatch, and administrative events
            </span>
          </div>

          <div className="zcm-table-container">
            <table className="zcm-table" style={{ fontSize: '0.8125rem' }}>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>User</th>
                  <th>Action</th>
                  <th>Entity</th>
                  <th>Entity ID</th>
                  <th>Reason / Summary</th>
                  <th>Snapshots</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#94A3B8' }}>
                      No audit events recorded yet.
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((log) => (
                    <tr key={log.id}>
                      <td>{formatIndianDateTime(log.timestamp)}</td>
                      <td>
                        <strong>{log.user_name || 'System'}</strong>
                      </td>
                      <td>
                        <Badge variant="neutral">{log.action}</Badge>
                      </td>
                      <td>{log.entity_type}</td>
                      <td>#{log.entity_id}</td>
                      <td>{log.reason}</td>
                      <td>
                        {(log.before_snapshot || log.after_snapshot) && (
                          <button
                            className="zcm-btn zcm-btn--secondary zcm-btn--sm"
                            onClick={() => setSelectedAuditLog(log)}
                          >
                            <Eye size={12} />
                            <span>View Snapshot</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE NEW CAMPAIGN MODAL */}
      <Modal
        isOpen={newCampaignModalOpen}
        onClose={() => setNewCampaignModalOpen(false)}
        title="Initialize New Annual Campaign"
        size="lg"
        footer={
          <>
            <button className="zcm-btn zcm-btn--secondary" onClick={() => setNewCampaignModalOpen(false)}>
              Cancel
            </button>
            <button
              className="zcm-btn zcm-btn--primary"
              onClick={() => createCampaignMutation.mutate()}
              disabled={createCampaignMutation.isPending || !campaignYear}
            >
              {createCampaignMutation.isPending ? 'Initializing...' : 'Confirm Campaign Creation'}
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="zcm-form-grid-2">
            <div className="zcm-form-group">
              <label>Campaign Year *</label>
              <input
                type="number"
                min="2020"
                max="2050"
                value={campaignYear}
                onChange={(e) => setCampaignYear(Number(e.target.value))}
              />
            </div>
            <div className="zcm-form-group">
              <label>Campaign Name</label>
              <input
                type="text"
                placeholder={`Calendar Fund ${campaignYear}`}
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
              />
            </div>
          </div>

          <div className="zcm-form-grid-2">
            <div className="zcm-form-group">
              <label>Initial Printed Quantity *</label>
              <input
                type="number"
                min="1"
                value={printedQty}
                onChange={(e) => setPrintedQty(Number(e.target.value))}
              />
            </div>
            <div className="zcm-form-group">
              <label>Cost Price Per Calendar (₹) *</label>
              <input
                type="number"
                min="0.01"
                step="any"
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
              />
            </div>
          </div>

          <div className="zcm-form-grid-2">
            <div className="zcm-form-group">
              <label>Minimum Expected Selling Price (₹) *</label>
              <input
                type="number"
                min="0.01"
                step="any"
                value={minSellingPrice}
                onChange={(e) => setMinSellingPrice(e.target.value)}
              />
            </div>
            <div className="zcm-form-group">
              <label>Student Commission Rate (%) *</label>
              <input
                type="number"
                min="0"
                max="100"
                step="any"
                value={commissionRate}
                onChange={(e) => setCommissionRate(e.target.value)}
              />
            </div>
          </div>

          {/* Initial Printing Outlay Preview */}
          <div style={{
            background: '#0B111E',
            border: '1px solid #1E293B',
            borderRadius: 8,
            padding: '0.875rem 1rem',
            fontSize: '0.875rem',
            color: '#94A3B8',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              Initial Printing Outlay (Created Exactly Once):
            </div>
            <strong style={{ fontSize: '1.1rem', color: '#F8FAFC' }}>
              ₹{proposedPrintingExpense.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </strong>
          </div>
        </div>
      </Modal>

      {/* EDIT CAMPAIGN MODAL */}
      <Modal
        isOpen={editCampaignModalOpen}
        onClose={() => {
          if (!updateCampaignMutation.isPending) {
            setEditCampaignModalOpen(false);
            setEditingCampaign(null);
          }
        }}
        title={`Edit Campaign Settings — ${editingCampaign?.name || ''} (${editCampaignYear})`}
        size="lg"
        footer={
          <>
            <button
              className="zcm-btn zcm-btn--secondary"
              onClick={() => {
                setEditCampaignModalOpen(false);
                setEditingCampaign(null);
              }}
              disabled={updateCampaignMutation.isPending}
            >
              Cancel
            </button>
            <button
              className="zcm-btn zcm-btn--primary zcm-btn--animated"
              onClick={() => updateCampaignMutation.mutate()}
              disabled={updateCampaignMutation.isPending || !editCampaignYear || editPrintedQty <= 0}
            >
              {updateCampaignMutation.isPending ? 'Saving Changes...' : 'Save Campaign Settings'}
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {editErrorMessage && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.45)',
              borderRadius: '10px',
              padding: '0.75rem 1rem',
              color: '#FFA4A4',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem'
            }}>
              <AlertTriangle size={18} style={{ color: '#EF4444', flexShrink: 0 }} />
              <div>{editErrorMessage}</div>
            </div>
          )}

          <div style={{
            background: 'rgba(56, 189, 248, 0.08)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            borderRadius: '10px',
            padding: '0.75rem 1rem',
            color: '#94A3B8',
            fontSize: '0.82rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.65rem'
          }}>
            <Info size={16} style={{ color: '#38BDF8', marginTop: 2, flexShrink: 0 }} />
            <div>
              <strong style={{ color: '#F8FAFC' }}>Idempotent Financial Update: </strong>
              Editing printed quantity or unit cost price will update the initial printing expense and opening inventory movement safely without creating duplicate ledger records.
            </div>
          </div>

          <div className="zcm-form-grid-2">
            <div className="zcm-form-group">
              <label>Campaign Name *</label>
              <input
                type="text"
                value={editCampaignName}
                onChange={(e) => setEditCampaignName(e.target.value)}
                placeholder={`Calendar Fund ${editCampaignYear}`}
                required
              />
            </div>

            <div className="zcm-form-group">
              <label>Campaign Year *</label>
              <input
                type="number"
                min="2020"
                max="2050"
                value={editCampaignYear}
                onChange={(e) => setEditCampaignYear(Number(e.target.value))}
                required
              />
            </div>
          </div>

          <div className="zcm-form-grid-2">
            <div className="zcm-form-group">
              <label>Total Calendars Printed *</label>
              <input
                type="number"
                min="1"
                value={editPrintedQty}
                onChange={(e) => setEditPrintedQty(Number(e.target.value))}
                required
              />
              <span style={{ fontSize: '0.72rem', color: '#64748B' }}>
                Cannot be lower than already committed calendars (sold + in-field).
              </span>
            </div>

            <div className="zcm-form-group">
              <label>Printing Cost Per Calendar (₹) *</label>
              <input
                type="number"
                min="0"
                step="any"
                value={editCostPrice}
                onChange={(e) => setEditCostPrice(e.target.value)}
                required
              />
              <span style={{ fontSize: '0.72rem', color: '#64748B' }}>
                Initial 2026 value: ₹11.00 / calendar.
              </span>
            </div>
          </div>

          <div className="zcm-form-grid-2">
            <div className="zcm-form-group">
              <label>Minimum Expected Collection Price (₹) *</label>
              <input
                type="number"
                min="0"
                step="any"
                value={editMinSellingPrice}
                onChange={(e) => setEditMinSellingPrice(e.target.value)}
                required
              />
              <span style={{ fontSize: '0.72rem', color: '#64748B' }}>
                Initial 2026 value: ₹20.00 / calendar.
              </span>
            </div>

            <div className="zcm-form-group">
              <label>Student Commission Rate (%) *</label>
              <input
                type="number"
                min="0"
                max="100"
                step="any"
                value={editCommissionRate}
                onChange={(e) => setEditCommissionRate(e.target.value)}
                required
              />
              <span style={{ fontSize: '0.72rem', color: '#64748B' }}>
                Option A: Applied to student's positive cumulative net collection.
              </span>
            </div>
          </div>

          <div className="zcm-form-group">
            <label>Campaign Status</label>
            <select
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value as 'active' | 'closed')}
              className="zcm-select"
              style={{
                width: '100%',
                padding: '0.55rem 0.75rem',
                background: '#0F172A',
                border: '1px solid #1E293B',
                borderRadius: 8,
                color: '#F8FAFC',
                fontSize: '0.875rem'
              }}
            >
              <option value="active">Active (Open for trip dispatches and collections)</option>
              <option value="closed">Closed (Freezes commission and prevents new trips)</option>
            </select>
          </div>

          {/* Dynamic Financial Preview Box */}
          <div style={{
            background: 'linear-gradient(135deg, #090E1A 0%, #0F172A 100%)',
            border: '1px solid #1E293B',
            borderRadius: 12,
            padding: '1rem 1.25rem',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1rem'
          }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#94A3B8', textTransform: 'uppercase' }}>
                Initial Printing Outlay
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#F8FAFC', marginTop: '0.2rem' }}>
                ₹{editProposedPrintingExpense.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '0.1rem' }}>
                {editPrintedQty} calendars × ₹{editCostPrice}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: '#94A3B8', textTransform: 'uppercase' }}>
                Minimum Target Gross Inflow
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#10B981', marginTop: '0.2rem' }}>
                ₹{editExpectedMinGross.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '0.1rem' }}>
                {editPrintedQty} calendars × ₹{editMinSellingPrice}
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* CONFIRMATION ACTION MODAL */}
      <Modal
        isOpen={confirmModalOpen}
        onClose={() => {
          if (!closeCampaignMutation.isPending && !activateCampaignMutation.isPending) {
            setConfirmModalOpen(false);
            setConfirmAction(null);
          }
        }}
        title={
          confirmAction?.type === 'activate'
            ? `Activate Campaign ${confirmAction.campaign.year}?`
            : `Close Campaign ${confirmAction?.campaign.year}?`
        }
        footer={
          <>
            <button
              className="zcm-btn zcm-btn--secondary"
              onClick={() => {
                setConfirmModalOpen(false);
                setConfirmAction(null);
              }}
              disabled={closeCampaignMutation.isPending || activateCampaignMutation.isPending}
            >
              Cancel
            </button>
            {confirmAction?.type === 'activate' ? (
              <button
                className="zcm-btn zcm-btn--success zcm-btn--animated"
                onClick={() => activateCampaignMutation.mutate(confirmAction.campaign.id)}
                disabled={activateCampaignMutation.isPending}
              >
                {activateCampaignMutation.isPending ? 'Activating...' : 'Yes, Activate Campaign'}
              </button>
            ) : (
              <button
                className="zcm-btn zcm-btn--danger"
                onClick={() => confirmAction && closeCampaignMutation.mutate(confirmAction.campaign.id)}
                disabled={closeCampaignMutation.isPending}
              >
                {closeCampaignMutation.isPending ? 'Closing...' : 'Yes, Close Campaign & Freeze'}
              </button>
            )}
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {confirmAction?.type === 'activate' ? (
            <p style={{ color: '#CBD5E1', fontSize: '0.9rem', lineHeight: 1.5, margin: 0 }}>
              Activating Campaign <strong>{confirmAction.campaign.year}</strong> allows dispatching new trips, issuing calendars, logging expenses, recording receipts, and accruing student commission under this campaign.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <p style={{ color: '#CBD5E1', fontSize: '0.9rem', lineHeight: 1.5, margin: 0 }}>
                Are you sure you want to close Campaign <strong>{confirmAction?.campaign.year}</strong>?
              </p>
              <div style={{
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                borderRadius: 8,
                padding: '0.75rem 1rem',
                color: '#FFA4A4',
                fontSize: '0.82rem'
              }}>
                <strong>Important:</strong> Closing the campaign requires all trips to be settled. It permanently freezes final commission calculations for all students under this campaign.
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* CREATE USER MODAL */}
      <Modal
        isOpen={newUserModalOpen}
        onClose={() => setNewUserModalOpen(false)}
        title="Create Administrator Account"
        footer={
          <>
            <button className="zcm-btn zcm-btn--secondary" onClick={() => setNewUserModalOpen(false)}>
              Cancel
            </button>
            <button
              className="zcm-btn zcm-btn--primary"
              onClick={() => createUserMutation.mutate()}
              disabled={createUserMutation.isPending || !newPhone.trim() || !newName.trim() || !newPassword}
            >
              {createUserMutation.isPending ? 'Creating...' : 'Create Account'}
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="zcm-form-group">
            <label>10-digit Indian Mobile Number *</label>
            <input
              type="tel"
              placeholder="98765 43210"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              required
            />
          </div>
          <div className="zcm-form-group">
            <label>Display Name *</label>
            <input
              type="text"
              placeholder="e.g. Abdullah Hashim"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              required
            />
          </div>
          <div className="zcm-form-group">
            <label>Initial Password (min 6 chars) *</label>
            <input
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <div className="zcm-form-group">
            <label>Role *</label>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as any)}
            >
              <option value="admin">Administrator (Operations & Dispatches)</option>
              <option value="super_admin">Super Administrator (Full System Control)</option>
            </select>
          </div>
        </div>
      </Modal>

      {/* RESET PASSWORD MODAL */}
      <Modal
        isOpen={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        title={`Reset Password: ${selectedUserToReset?.display_name}`}
        footer={
          <>
            <button className="zcm-btn zcm-btn--secondary" onClick={() => setResetModalOpen(false)}>
              Cancel
            </button>
            <button
              className="zcm-btn zcm-btn--danger"
              onClick={() => resetPasswordMutation.mutate()}
              disabled={resetPasswordMutation.isPending || !resetPasswordVal || resetPasswordVal.length < 6}
            >
              {resetPasswordMutation.isPending ? 'Resetting...' : 'Confirm Password Reset'}
            </button>
          </>
        }
      >
        <div className="zcm-form-group">
          <label>New Temporary Password (min 6 characters) *</label>
          <input
            type="password"
            placeholder="••••••••"
            value={resetPasswordVal}
            onChange={(e) => setResetPasswordVal(e.target.value)}
            autoFocus
          />
        </div>
      </Modal>

      {/* AUDIT SNAPSHOT VIEWER MODAL */}
      <Modal
        isOpen={!!selectedAuditLog}
        onClose={() => setSelectedAuditLog(null)}
        title={`Audit Event: ${selectedAuditLog?.action} on ${selectedAuditLog?.entity_type} #${selectedAuditLog?.entity_id}`}
        size="lg"
      >
        {selectedAuditLog && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.8125rem' }}>
            <div style={{ background: '#0B111E', border: '1px solid #1E293B', color: '#94A3B8', padding: '0.75rem 1rem', borderRadius: 8 }}>
              <div>User: <strong style={{ color: '#F8FAFC' }}>{selectedAuditLog.user_name || 'System'}</strong></div>
              <div>Time: <strong style={{ color: '#F8FAFC' }}>{formatIndianDateTime(selectedAuditLog.timestamp)}</strong></div>
              <div>Reason: <strong style={{ color: '#F8FAFC' }}>{selectedAuditLog.reason}</strong></div>
            </div>

            {selectedAuditLog.before_snapshot && (
              <div>
                <strong style={{ color: '#CBD5E1' }}>Before State Snapshot:</strong>
                <pre style={{ background: '#070B14', border: '1px solid #1E293B', color: '#38BDF8', padding: '0.75rem', borderRadius: 6, overflowX: 'auto', marginTop: 4 }}>
                  {JSON.stringify(selectedAuditLog.before_snapshot, null, 2)}
                </pre>
              </div>
            )}

            {selectedAuditLog.after_snapshot && (
              <div>
                <strong style={{ color: '#CBD5E1' }}>After State Snapshot:</strong>
                <pre style={{ background: '#070B14', border: '1px solid #1E293B', color: '#34D399', padding: '0.75rem', borderRadius: 6, overflowX: 'auto', marginTop: 4 }}>
                  {JSON.stringify(selectedAuditLog.after_snapshot, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
