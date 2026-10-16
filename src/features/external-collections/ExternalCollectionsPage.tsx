import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Coins,
  Plus,
  Search,
  Calendar,
  Edit2,
  Trash2,
  ShieldCheck,
  TrendingUp,
  Users,
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';
import { api } from '../../services/api';
import { useCampaign } from '../../context/CampaignContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ExternalCollection } from '../../types';
import { formatINR, formatIndianDate } from '../../utils/formatters';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { StatCard } from '../../components/ui/StatCard';

export const ExternalCollectionsPage: React.FC = () => {
  const { activeCampaign, activeCampaignId } = useCampaign();
  const { isSuperAdmin } = useAuth();
  const { success, error, warning } = useToast();
  const queryClient = useQueryClient();

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Modals state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ExternalCollection | null>(null);

  // Form State
  const [receivedFrom, setReceivedFrom] = useState('');
  const [amount, setAmount] = useState('');
  const [dateReceived, setDateReceived] = useState(() => new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  // Fetch External Collections
  const { data: collectionsData, isLoading } = useQuery({
    queryKey: ['external-collections', activeCampaignId, searchQuery, startDate, endDate],
    queryFn: () => {
      const params: any = {};
      if (activeCampaignId) params.campaign = activeCampaignId;
      if (searchQuery) params.search = searchQuery;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      return api.getExternalCollections(params);
    },
    enabled: !!activeCampaignId,
  });

  const collections: ExternalCollection[] = Array.isArray(collectionsData)
    ? collectionsData
    : collectionsData?.results || [];

  // Summary Metrics
  const totalAmount = collections.reduce((sum, item) => sum + parseFloat(item.amount || '0'), 0);
  const averageAmount = collections.length > 0 ? totalAmount / collections.length : 0;

  // Reset form
  const resetForm = () => {
    setReceivedFrom('');
    setAmount('');
    setDateReceived(new Date().toISOString().split('T')[0]);
    setNotes('');
    setSelectedItem(null);
  };

  // Open Edit Modal
  const openEditModal = (item: ExternalCollection) => {
    setSelectedItem(item);
    setReceivedFrom(item.received_from);
    setAmount(item.amount);
    setDateReceived(item.date_received);
    setNotes(item.notes || '');
    setEditModalOpen(true);
  };

  // Open Delete Modal
  const openDeleteModal = (item: ExternalCollection) => {
    setSelectedItem(item);
    setDeleteModalOpen(true);
  };

  // Add Mutation
  const addMutation = useMutation({
    mutationFn: () => {
      if (!activeCampaignId) throw new Error('No active campaign selected.');
      if (!receivedFrom.trim()) throw new Error('Person name (received from) is required.');
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) throw new Error('Amount must be greater than zero.');
      if (!dateReceived) throw new Error('Date received is required.');

      return api.createExternalCollection({
        campaign: activeCampaignId,
        received_from: receivedFrom.trim(),
        amount: numAmount.toFixed(2),
        date_received: dateReceived,
        notes: notes.trim(),
      });
    },
    onSuccess: (data) => {
      success(`External collection of ${formatINR(data.amount)} from ${data.received_from} recorded.`);
      setAddModalOpen(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['external-collections'] });
      queryClient.invalidateQueries({ queryKey: ['campaign-summary'] });
      queryClient.invalidateQueries({ queryKey: ['reports-summary'] });
    },
    onError: (err: any) => {
      error(err.message || 'Failed to record external collection.');
    },
  });

  // Edit / Correct Mutation
  const editMutation = useMutation({
    mutationFn: () => {
      if (!selectedItem) throw new Error('No entry selected for correction.');
      if (!receivedFrom.trim()) throw new Error('Person name (received from) is required.');
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) throw new Error('Amount must be greater than zero.');
      if (!dateReceived) throw new Error('Date received is required.');

      return api.updateExternalCollection(selectedItem.id, {
        received_from: receivedFrom.trim(),
        amount: numAmount.toFixed(2),
        date_received: dateReceived,
        notes: notes.trim(),
      });
    },
    onSuccess: (data) => {
      success(`External collection #${data.id} corrected successfully.`);
      setEditModalOpen(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['external-collections'] });
      queryClient.invalidateQueries({ queryKey: ['campaign-summary'] });
      queryClient.invalidateQueries({ queryKey: ['reports-summary'] });
    },
    onError: (err: any) => {
      error(err.message || 'Failed to update external collection.');
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: () => {
      if (!selectedItem) throw new Error('No entry selected for deletion.');
      return api.deleteExternalCollection(selectedItem.id);
    },
    onSuccess: () => {
      success(`External collection #${selectedItem?.id} removed.`);
      setDeleteModalOpen(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['external-collections'] });
      queryClient.invalidateQueries({ queryKey: ['campaign-summary'] });
      queryClient.invalidateQueries({ queryKey: ['reports-summary'] });
    },
    onError: (err: any) => {
      error(err.message || 'Failed to delete external collection.');
    },
  });

  return (
    <div>
      {/* Header */}
      <div className="zcm-page-header">
        <div>
          <h1 className="zcm-page-header__title">External Collections</h1>
          <div className="zcm-page-header__sub">
            Track direct donor contributions and external funds for {activeCampaign?.name || 'Active Campaign'}
          </div>
        </div>

        <div className="zcm-page-header__actions">
          <button
            className="zcm-btn zcm-btn--primary"
            onClick={() => {
              resetForm();
              setAddModalOpen(true);
            }}
            disabled={activeCampaign?.status === 'closed'}
          >
            <Plus size={16} />
            <span>Add External Collection</span>
          </button>
        </div>
      </div>

      {/* Closed Campaign Notice */}
      {activeCampaign?.status === 'closed' && (
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: '10px',
            padding: '1rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            color: '#F87171'
          }}
        >
          <AlertCircle size={20} />
          <div>
            <strong>Campaign is Closed:</strong> External collections cannot be added or modified for closed campaigns to preserve financial finality.
          </div>
        </div>
      )}

      {/* Financial Rule Notice */}
      <div
        style={{
          background: 'rgba(16, 185, 129, 0.08)',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          borderRadius: '10px',
          padding: '0.875rem 1rem',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          color: '#34D399',
          fontSize: '0.84375rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldCheck size={18} style={{ color: '#10B981', flexShrink: 0 }} />
          <span>
            <strong>Isolated Financial Flow:</strong> External collections count towards total campaign funds and net profit, but are <strong>strictly excluded</strong> from student trip collections, student net calculations, and student commissions.
          </span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="zcm-stat-grid" style={{ marginBottom: '1.25rem' }}>
        <StatCard
          title="Total External Collections"
          value={formatINR(totalAmount, true)}
          subtitle={`${collections.length} direct receipt${collections.length === 1 ? '' : 's'}`}
          icon={Coins}
          variant="success"
        />

        <StatCard
          title="Direct Contributions Count"
          value={collections.length}
          subtitle="Non-student direct entries"
          icon={Users}
          variant="default"
        />

        <StatCard
          title="Average per Contribution"
          value={formatINR(averageAmount, true)}
          subtitle="Per direct contributor"
          icon={TrendingUp}
          variant="warning"
        />

        <StatCard
          title="Commission Isolation"
          value="₹0.00"
          subtitle="Zero impact on student payout"
          icon={ShieldCheck}
          variant="default"
        />
      </div>

      {/* Filters Toolbar */}
      <div className="zcm-card" style={{ padding: '1rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: '1 1 240px', position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
            <input
              type="text"
              placeholder="Search by donor name or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '2.5rem', width: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78125rem', color: '#94A3B8' }}>From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{ padding: '0.45rem 0.75rem', width: '150px' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78125rem', color: '#94A3B8' }}>To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{ padding: '0.45rem 0.75rem', width: '150px' }}
            />
          </div>

          {(searchQuery || startDate || endDate) && (
            <button
              className="zcm-btn zcm-btn--secondary zcm-btn--sm"
              onClick={() => {
                setSearchQuery('');
                setStartDate('');
                setEndDate('');
              }}
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Table Card */}
      <div className="zcm-card zcm-card--flush">
        <div className="zcm-card__header">
          <h3>External Collection Ledger</h3>
          <span style={{ fontSize: '0.78125rem', color: '#64748B' }}>
            {collections.length} total direct entries
          </span>
        </div>

        <div className="zcm-table-container">
          <table className="zcm-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Date Received</th>
                <th>Received From</th>
                <th className="zcm-text-right">Amount (₹)</th>
                <th>Notes / Details</th>
                <th>Recorded By</th>
                <th>Last Modified</th>
                <th className="zcm-text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '2.5rem', color: '#64748B' }}>
                    Loading external collections...
                  </td>
                </tr>
              ) : collections.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>
                    No external collections recorded yet for this campaign.
                  </td>
                </tr>
              ) : (
                collections.map((item) => (
                  <tr key={item.id}>
                    <td className="zcm-num">#{item.id}</td>
                    <td>{formatIndianDate(item.date_received)}</td>
                    <td>
                      <strong>{item.received_from}</strong>
                    </td>
                    <td className="zcm-text-right zcm-num">
                      <strong style={{ color: '#10B981', fontSize: '0.95rem' }}>
                        {formatINR(item.amount, true)}
                      </strong>
                    </td>
                    <td>
                      {item.notes ? (
                        <span style={{ color: '#CBD5E1' }}>{item.notes}</span>
                      ) : (
                        <span style={{ color: '#475569' }}>—</span>
                      )}
                    </td>
                    <td>
                      <div style={{ fontSize: '0.8125rem', color: '#94A3B8' }}>
                        {item.created_by_name || 'Admin'}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#64748B' }}>
                        {formatIndianDate(item.created_at)}
                      </div>
                    </td>
                    <td>
                      {item.updated_by_name ? (
                        <div style={{ fontSize: '0.8125rem', color: '#F59E0B' }}>
                          <div>{item.updated_by_name}</div>
                          <div style={{ fontSize: '0.7rem', color: '#64748B' }}>
                            {formatIndianDate(item.updated_at)}
                          </div>
                        </div>
                      ) : (
                        <span style={{ color: '#475569', fontSize: '0.75rem' }}>Unmodified</span>
                      )}
                    </td>
                    <td className="zcm-text-right">
                      <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                        <button
                          className="zcm-btn zcm-btn--secondary zcm-btn--sm"
                          onClick={() => openEditModal(item)}
                          disabled={activeCampaign?.status === 'closed'}
                          title="Correct Entry"
                          style={{ padding: '0.35rem 0.6rem' }}
                        >
                          <Edit2 size={13} />
                          <span>Correct</span>
                        </button>
                        <button
                          className="zcm-btn zcm-btn--danger zcm-btn--sm"
                          onClick={() => openDeleteModal(item)}
                          disabled={activeCampaign?.status === 'closed'}
                          title="Delete Entry"
                          style={{ padding: '0.35rem 0.6rem' }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Collection Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Record External Collection"
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', width: '100%' }}>
            <button
              className="zcm-btn zcm-btn--secondary"
              onClick={() => setAddModalOpen(false)}
              disabled={addMutation.isPending}
            >
              Cancel
            </button>
            <button
              className="zcm-btn zcm-btn--primary"
              onClick={() => addMutation.mutate()}
              disabled={addMutation.isPending}
            >
              {addMutation.isPending ? 'Saving...' : 'Save Collection'}
            </button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label className="zcm-label">
              Campaign <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <input
              type="text"
              disabled
              value={`${activeCampaign?.name || ''} (${activeCampaign?.year || ''})`}
              style={{ background: '#1E293B', color: '#94A3B8' }}
            />
          </div>

          <div>
            <label className="zcm-label">
              Received From (Person / Contributor) <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Haji Muhammad, Dr. Kareem, Al-Falah Trust"
              value={receivedFrom}
              onChange={(e) => setReceivedFrom(e.target.value)}
              autoFocus
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label className="zcm-label">
                Amount (INR ₹) <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <input
                type="number"
                min="1"
                step="0.01"
                placeholder="e.g. 5000.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div>
              <label className="zcm-label">
                Date Received <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <input
                type="date"
                value={dateReceived}
                onChange={(e) => setDateReceived(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="zcm-label">Notes / Description (Optional)</label>
            <textarea
              rows={3}
              placeholder="Direct bank transfer, cheque details, or patron background notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div style={{ fontSize: '0.78125rem', color: '#94A3B8', background: '#0F172A', padding: '0.75rem', borderRadius: '6px' }}>
            ℹ️ Entry will be linked to your user account (<strong>Recorded by: {useAuth().user?.display_name || 'Admin'}</strong>) and added to campaign gross funds.
          </div>
        </div>
      </Modal>

      {/* Edit / Correct Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={`Correct External Collection #${selectedItem?.id || ''}`}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', width: '100%' }}>
            <button
              className="zcm-btn zcm-btn--secondary"
              onClick={() => setEditModalOpen(false)}
              disabled={editMutation.isPending}
            >
              Cancel
            </button>
            <button
              className="zcm-btn zcm-btn--primary"
              onClick={() => editMutation.mutate()}
              disabled={editMutation.isPending}
            >
              {editMutation.isPending ? 'Updating...' : 'Save Correction'}
            </button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ fontSize: '0.8125rem', color: '#F59E0B', background: 'rgba(245, 158, 11, 0.1)', padding: '0.75rem', borderRadius: '6px' }}>
            ⚠️ All corrections are permanently recorded in the system <strong>Audit Log</strong> with timestamps and user details.
          </div>

          <div>
            <label className="zcm-label">
              Received From <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <input
              type="text"
              value={receivedFrom}
              onChange={(e) => setReceivedFrom(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label className="zcm-label">
                Amount (INR ₹) <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <input
                type="number"
                min="1"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div>
              <label className="zcm-label">
                Date Received <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <input
                type="date"
                value={dateReceived}
                onChange={(e) => setDateReceived(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="zcm-label">Notes / Description</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirm Deletion"
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', width: '100%' }}>
            <button
              className="zcm-btn zcm-btn--secondary"
              onClick={() => setDeleteModalOpen(false)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </button>
            <button
              className="zcm-btn zcm-btn--danger"
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete Voucher'}
            </button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ color: '#CBD5E1' }}>
            Are you sure you want to delete External Collection entry <strong>#{selectedItem?.id}</strong> received from <strong>{selectedItem?.received_from}</strong> for <strong>{formatINR(selectedItem?.amount || 0, true)}</strong>?
          </p>
          <div style={{ fontSize: '0.8125rem', color: '#F87171', background: 'rgba(239, 68, 68, 0.1)', padding: '0.75rem', borderRadius: '6px' }}>
            ⚠️ This will deduct {formatINR(selectedItem?.amount || 0, true)} from the campaign's total funds and net profit. An audit log snapshot of this deletion will be recorded.
          </div>
        </div>
      </Modal>
    </div>
  );
};
