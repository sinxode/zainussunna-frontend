import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  PackageOpen,
  ArrowDownLeft,
  ArrowUpRight,
  Sliders,
  Plus,
  Minus,
  RefreshCw,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { api } from '../../services/api';
import { useCampaign } from '../../context/CampaignContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { InventoryMovement } from '../../types';
import { formatIndianDateTime } from '../../utils/formatters';
import { StatCard } from '../../components/ui/StatCard';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';

export const InventoryPage: React.FC = () => {
  const { activeCampaign, activeCampaignId } = useCampaign();
  const { isSuperAdmin } = useAuth();
  const { success, error } = useToast();
  const queryClient = useQueryClient();

  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [adjustQuantity, setAdjustQuantity] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState('');

  // Queries
  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ['inventory-summary', activeCampaignId],
    queryFn: () => (activeCampaignId ? api.getInventorySummary(activeCampaignId) : null),
    enabled: !!activeCampaignId,
  });

  const { data: movementsData, isLoading: movementsLoading } = useQuery({
    queryKey: ['inventory-movements', activeCampaignId],
    queryFn: () => (activeCampaignId ? api.getInventoryMovements(activeCampaignId) : null),
    enabled: !!activeCampaignId,
  });

  const movements: InventoryMovement[] = Array.isArray(movementsData)
    ? movementsData
    : movementsData?.results || [];

  // Adjustment mutation
  const adjustMutation = useMutation({
    mutationFn: async () => {
      if (!activeCampaignId) return;
      if (adjustQuantity === 0) throw new Error('Adjustment quantity cannot be 0.');
      if (!adjustReason.trim()) throw new Error('Reason is required for inventory adjustment.');
      return api.createInventoryAdjustment(activeCampaignId, adjustQuantity, adjustReason.trim());
    },
    onSuccess: () => {
      success('Inventory adjustment recorded successfully.');
      setAdjustModalOpen(false);
      setAdjustQuantity(0);
      setAdjustReason('');
      queryClient.invalidateQueries({ queryKey: ['inventory-summary'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-movements'] });
      queryClient.invalidateQueries({ queryKey: ['campaign-summary'] });
    },
    onError: (err: any) => {
      error(err.message || 'Failed to record inventory adjustment.');
    },
  });

  const getMovementBadge = (type: string) => {
    switch (type) {
      case 'opening_stock':
        return <Badge variant="neutral">Opening Stock</Badge>;
      case 'trip_issue':
        return <Badge variant="warning">Trip Issue</Badge>;
      case 'trip_sold':
        return <Badge variant="success">Trip Sold</Badge>;
      case 'trip_return_unsold':
        return <Badge variant="neutral">Return Unsold</Badge>;
      case 'adjustment':
        return <Badge variant="danger">Adjustment</Badge>;
      default:
        return <Badge variant="neutral">{type}</Badge>;
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="zcm-page-header">
        <div>
          <h1 className="zcm-page-header__title">Calendar Inventory Ledger</h1>
          <div className="zcm-page-header__sub">
            Traceable stock movements, field issuance tracking, and audited inventory reconciliation.
          </div>
        </div>

        <div className="zcm-page-header__actions">
          {isSuperAdmin && (
            <button
              className="zcm-btn zcm-btn--secondary"
              onClick={() => setAdjustModalOpen(true)}
              disabled={activeCampaign?.status === 'closed'}
            >
              <Sliders size={16} />
              <span>Record Stock Adjustment</span>
            </button>
          )}
        </div>
      </div>

      {/* Stock Cards */}
      <div className="zcm-stat-grid">
        <StatCard
          title="Initial Printed Stock"
          value={`${summary?.printed_quantity || 0}`}
          subtitle={`Campaign ${activeCampaign?.year || ''} production`}
          icon={PackageOpen}
        />

        <StatCard
          title="Available In Hand"
          value={`${summary?.available_stock || 0}`}
          subtitle="Available for new dispatches"
          icon={CheckCircle}
          variant="success"
        />

        <StatCard
          title="Distributed in Field"
          value={`${summary?.calendars_in_field || 0}`}
          subtitle="On active unreturned trips"
          icon={ArrowUpRight}
          variant="warning"
        />

        <StatCard
          title="Confirmed Sales Settled"
          value={`${summary?.calendars_sold || 0}`}
          subtitle={`Returned unsold: ${summary?.calendars_returned || 0}`}
          icon={ArrowDownLeft}
          variant="default"
        />
      </div>

      {/* Movements Table */}
      <div className="zcm-card zcm-card--flush">
        <div className="zcm-card__header">
          <h3>Stock Movement Audit History</h3>
          <span style={{ fontSize: '0.78125rem', color: '#64748B' }}>
            {movements.length} total ledger entries
          </span>
        </div>

        <div className="zcm-table-container">
          <table className="zcm-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Movement Type</th>
                <th className="zcm-text-right">Quantity</th>
                <th>Trip / Destination</th>
                <th>Reason / Description</th>
                <th>Logged By</th>
              </tr>
            </thead>
            <tbody>
              {movements.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2.5rem', color: '#64748B' }}>
                    No inventory movements recorded yet.
                  </td>
                </tr>
              ) : (
                movements.map((m) => (
                  <tr key={m.id}>
                    <td>{formatIndianDateTime(m.created_at)}</td>
                    <td>{getMovementBadge(m.movement_type)}</td>
                    <td className="zcm-text-right zcm-num">
                      <strong style={{ color: m.quantity > 0 ? '#34D399' : '#EF4444' }}>
                        {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                      </strong>
                    </td>
                    <td>
                      {m.related_trip ? (
                        <span>
                          Trip #{m.related_trip} {m.place_name ? `(${m.place_name})` : ''}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td>{m.reason}</td>
                    <td>{m.created_by_name || 'System'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* STOCK ADJUSTMENT MODAL */}
      <Modal
        isOpen={adjustModalOpen}
        onClose={() => setAdjustModalOpen(false)}
        title="Record Audited Inventory Adjustment"
        footer={
          <>
            <button
              className="zcm-btn zcm-btn--secondary"
              onClick={() => setAdjustModalOpen(false)}
            >
              Cancel
            </button>
            <button
              className="zcm-btn zcm-btn--primary"
              onClick={() => adjustMutation.mutate()}
              disabled={adjustMutation.isPending || adjustQuantity === 0 || !adjustReason.trim()}
            >
              {adjustMutation.isPending ? 'Saving...' : 'Apply Adjustment'}
            </button>
          </>
        }
      >
        <p style={{ fontSize: '0.875rem', color: '#94A3B8', marginBottom: '1rem', lineHeight: 1.5 }}>
          This creates an immutable audit entry in the inventory ledger. Positive numbers add to stock; negative numbers reduce stock.
        </p>

        <div className="zcm-form-group">
          <label>Adjustment Quantity (+ or -) *</label>
          <input
            type="number"
            placeholder="e.g. +50 or -10"
            value={adjustQuantity}
            onChange={(e) => setAdjustQuantity(Number(e.target.value))}
          />
          <div className="zcm-help-text">
            Projected stock after adjustment:{' '}
            <strong>{(summary?.available_stock || 0) + adjustQuantity} calendars</strong>
          </div>
        </div>

        <div className="zcm-form-group">
          <label>Reason for Adjustment *</label>
          <textarea
            rows={3}
            placeholder="e.g. Additional batch received from printing press / Damaged stock written off"
            value={adjustReason}
            onChange={(e) => setAdjustReason(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
};
