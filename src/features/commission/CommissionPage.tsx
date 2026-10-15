import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Percent,
  Banknote,
  CheckCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  DollarSign
} from 'lucide-react';
import { api } from '../../services/api';
import { useCampaign } from '../../context/CampaignContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { CommissionCalculation, CommissionPayout } from '../../types';
import { formatINR, formatIndianDate } from '../../utils/formatters';
import { StatCard } from '../../components/ui/StatCard';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';

export const CommissionPage: React.FC = () => {
  const { activeCampaign, activeCampaignId } = useCampaign();
  const { isSuperAdmin } = useAuth();
  const { success, error, warning } = useToast();
  const queryClient = useQueryClient();

  const [payoutModalOpen, setPayoutModalOpen] = useState(false);
  const [selectedCalcForPayout, setSelectedCalcForPayout] = useState<CommissionCalculation | null>(null);
  const [payoutAmount, setPayoutAmount] = useState<string>('');
  const [payoutDate, setPayoutDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'gpay' | 'bank_transfer' | 'other'>('cash');
  const [payoutReference, setPayoutReference] = useState('');
  const [payoutNotes, setPayoutNotes] = useState('');

  // Queries
  const { data: commissionData, isLoading } = useQuery({
    queryKey: ['commission-summary', activeCampaignId],
    queryFn: () => (activeCampaignId ? api.getCommissionSummary(activeCampaignId) : null),
    enabled: !!activeCampaignId,
  });

  const students: CommissionCalculation[] = commissionData?.students || [];

  // Open Payout Modal
  const openPayoutModal = (calc: CommissionCalculation) => {
    setSelectedCalcForPayout(calc);
    setPayoutAmount(calc.remaining_payable);
    setPaymentMethod('cash');
    setPayoutReference('');
    setPayoutNotes('');
    setPayoutModalOpen(true);
  };

  // Payout Mutation
  const payoutMutation = useMutation({
    mutationFn: () => {
      if (!activeCampaignId || !selectedCalcForPayout) {
        throw new Error('No campaign or student selected for payout.');
      }
      const amt = parseFloat(payoutAmount);
      if (amt <= 0) throw new Error('Payout amount must be greater than zero.');
      if (amt > parseFloat(selectedCalcForPayout.remaining_payable)) {
        throw new Error(`Payout amount exceeds outstanding payable ₹${selectedCalcForPayout.remaining_payable}.`);
      }

      return api.createCommissionPayout({
        campaign: activeCampaignId,
        student: selectedCalcForPayout.student,
        amount: payoutAmount,
        payment_date: payoutDate,
        payment_method: paymentMethod,
        reference: payoutReference,
        notes: payoutNotes,
      });
    },
    onSuccess: (data) => {
      success(`Payout of ${formatINR(data.amount)} recorded for ${selectedCalcForPayout?.student_name}.`);
      setPayoutModalOpen(false);
      setSelectedCalcForPayout(null);
      queryClient.invalidateQueries({ queryKey: ['commission-summary'] });
      queryClient.invalidateQueries({ queryKey: ['campaign-summary'] });
    },
    onError: (err: any) => {
      error(err.message || 'Failed to record payout.');
    },
  });

  // Finalize Commission Mutation
  const finalizeMutation = useMutation({
    mutationFn: () => {
      if (!activeCampaignId) throw new Error('No active campaign.');
      return api.finalizeCommission(activeCampaignId);
    },
    onSuccess: (res) => {
      success(res.detail || 'Commission calculations finalized for campaign.');
      queryClient.invalidateQueries({ queryKey: ['commission-summary'] });
      queryClient.invalidateQueries({ queryKey: ['campaign-summary'] });
    },
    onError: (err: any) => {
      error(err.message || 'Cannot finalize commission: verify all trips are settled.');
    },
  });

  return (
    <div>
      {/* Page Header */}
      <div className="zcm-page-header">
        <div>
          <h1 className="zcm-page-header__title">Student Commission Management</h1>
          <div className="zcm-page-header__sub">
            Campaign commission at {activeCampaign?.commission_percentage || 10}% applied to each student's cumulative net collection.
          </div>
        </div>

        <div className="zcm-page-header__actions">
          {isSuperAdmin && activeCampaign?.status === 'active' && (
            <button
              className="zcm-btn zcm-btn--secondary"
              onClick={() => finalizeMutation.mutate()}
              disabled={finalizeMutation.isPending}
            >
              <ShieldCheck size={16} />
              <span>Finalize Commission Snapshot</span>
            </button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="zcm-stat-grid">
        <StatCard
          title="Campaign Commission Rate"
          value={`${activeCampaign?.commission_percentage || 10}%`}
          subtitle="Applied on net collection after fare & food"
          icon={Percent}
        />

        <StatCard
          title="Total Commission Accrued"
          value={formatINR(commissionData?.total_commission_earned || 0, true)}
          subtitle={`${students.length} participating students`}
          icon={Banknote}
          variant="warning"
        />

        <StatCard
          title="Disbursed Payouts"
          value={formatINR(commissionData?.total_commission_paid || 0, true)}
          subtitle="Recorded payments"
          icon={CheckCircle}
          variant="success"
        />

        <StatCard
          title="Outstanding Payable"
          value={formatINR(commissionData?.outstanding_commission || 0, true)}
          subtitle="Pending campaign closure settlement"
          icon={Clock}
          variant="default"
        />
      </div>

      {/* Commission Statement Table */}
      <div className="zcm-card zcm-card--flush">
        <div className="zcm-card__header">
          <h3>Student Commission Statements</h3>
          <span style={{ fontSize: '0.78125rem', color: '#64748B' }}>
            Commission calculated after allocating trip fare & food deductions
          </span>
        </div>

        <div className="zcm-table-container">
          <table className="zcm-table">
            <thead>
              <tr>
                <th>Student</th>
                <th className="zcm-text-right">Gross Share (₹)</th>
                <th className="zcm-text-right">Fare Share (₹)</th>
                <th className="zcm-text-right">Food Share (₹)</th>
                <th className="zcm-text-right">Net Collection (₹)</th>
                <th className="zcm-text-right">Rate (%)</th>
                <th className="zcm-text-right">Earned Commission (₹)</th>
                <th className="zcm-text-right">Paid (₹)</th>
                <th className="zcm-text-right">Outstanding (₹)</th>
                <th className="zcm-text-center">Status</th>
                <th className="zcm-text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr>
                  <td colSpan={11} style={{ textAlign: 'center', padding: '2.5rem', color: '#64748B' }}>
                    No student commission accrued yet.
                  </td>
                </tr>
              ) : (
                students.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <strong style={{ fontSize: '0.875rem' }}>{c.student_name}</strong>
                    </td>
                    <td className="zcm-text-right zcm-num">{formatINR(c.gross_collection, true)}</td>
                    <td className="zcm-text-right zcm-num">-{formatINR(c.fare_share, true)}</td>
                    <td className="zcm-text-right zcm-num">-{formatINR(c.food_share, true)}</td>
                    <td className="zcm-text-right zcm-num">
                      <strong style={{ color: '#34D399' }}>{formatINR(c.net_collection, true)}</strong>
                    </td>
                    <td className="zcm-text-right zcm-num">{c.rate}%</td>
                    <td className="zcm-text-right zcm-num">
                      <strong style={{ color: '#FBBF24' }}>{formatINR(c.calculated_commission, true)}</strong>
                    </td>
                    <td className="zcm-text-right zcm-num">{formatINR(c.total_paid, true)}</td>
                    <td className="zcm-text-right zcm-num">
                      <strong style={{ color: parseFloat(c.remaining_payable) > 0 ? '#10B981' : '#94A3B8' }}>
                        {formatINR(c.remaining_payable, true)}
                      </strong>
                    </td>
                    <td className="zcm-text-center">
                      <Badge variant={c.finalization_status === 'finalized' ? 'success' : 'neutral'}>
                        {c.finalization_status.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="zcm-text-right">
                      {isSuperAdmin && parseFloat(c.remaining_payable) > 0 && (
                        <button
                          className="zcm-btn zcm-btn--success zcm-btn--sm"
                          onClick={() => openPayoutModal(c)}
                        >
                          Record Payout
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

      {/* RECORD PAYOUT MODAL */}
      <Modal
        isOpen={payoutModalOpen}
        onClose={() => setPayoutModalOpen(false)}
        title={`Record Commission Payout: ${selectedCalcForPayout?.student_name}`}
        footer={
          <>
            <button className="zcm-btn zcm-btn--secondary" onClick={() => setPayoutModalOpen(false)}>
              Cancel
            </button>
            <button
              className="zcm-btn zcm-btn--success"
              onClick={() => payoutMutation.mutate()}
              disabled={payoutMutation.isPending || !payoutAmount || parseFloat(payoutAmount) <= 0}
            >
              {payoutMutation.isPending ? 'Recording Payout...' : 'Confirm Disbursement'}
            </button>
          </>
        }
      >
        {selectedCalcForPayout && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{
              background: '#0B111E',
              border: '1px solid #1E293B',
              padding: '0.875rem 1rem',
              borderRadius: 8,
              fontSize: '0.8125rem',
              color: '#94A3B8',
              display: 'flex',
              justifyContent: 'space-between',
              gap: '1rem',
              flexWrap: 'wrap'
            }}>
              <div>
                Total Earned: <strong style={{ color: '#F8FAFC' }}>{formatINR(selectedCalcForPayout.calculated_commission, true)}</strong>
              </div>
              <div>
                Previously Paid: <strong style={{ color: '#F8FAFC' }}>{formatINR(selectedCalcForPayout.total_paid, true)}</strong>
              </div>
              <div>
                Maximum Payable: <strong style={{ color: '#10B981' }}>{formatINR(selectedCalcForPayout.remaining_payable, true)}</strong>
              </div>
            </div>

            <div className="zcm-form-grid-2">
              <div className="zcm-form-group">
                <label>Disbursement Amount (₹) *</label>
                <input
                  type="number"
                  min="0.01"
                  max={selectedCalcForPayout.remaining_payable}
                  step="any"
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                />
              </div>

              <div className="zcm-form-group">
                <label>Payment Method *</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                >
                  <option value="cash">Cash</option>
                  <option value="gpay">Google Pay / UPI</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="zcm-form-grid-2">
              <div className="zcm-form-group">
                <label>Payment Date *</label>
                <input
                  type="date"
                  value={payoutDate}
                  onChange={(e) => setPayoutDate(e.target.value)}
                />
              </div>

              <div className="zcm-form-group">
                <label>Reference / Voucher #</label>
                <input
                  type="text"
                  placeholder="e.g. UPI-REF-9921 / Voucher #04"
                  value={payoutReference}
                  onChange={(e) => setPayoutReference(e.target.value)}
                />
              </div>
            </div>

            <div className="zcm-form-group">
              <label>Notes (Optional)</label>
              <input
                type="text"
                placeholder="e.g. End of campaign final disbursement"
                value={payoutNotes}
                onChange={(e) => setPayoutNotes(e.target.value)}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
