import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  BookOpen,
  Plus,
  Eye,
  FileCheck,
  AlertTriangle,
  Compass
} from 'lucide-react';
import { api } from '../../services/api';
import { useCampaign } from '../../context/CampaignContext';
import { useToast } from '../../context/ToastContext';
import { ReceiptBook } from '../../types';
import { formatIndianDate } from '../../utils/formatters';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';

export const ReceiptBooksPage: React.FC = () => {
  const { activeCampaign, activeCampaignId } = useCampaign();
  const { success, error } = useToast();
  const queryClient = useQueryClient();

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [bookLabel, setBookLabel] = useState('');
  const [firstLeaf, setFirstLeaf] = useState<number>(1);
  const [lastLeaf, setLastLeaf] = useState<number>(100);
  const [bookNotes, setBookNotes] = useState('');
  const [selectedBookForUsage, setSelectedBookForUsage] = useState<ReceiptBook | null>(null);

  // Queries
  const { data: booksData, isLoading } = useQuery({
    queryKey: ['receipt-books', activeCampaignId],
    queryFn: () => (activeCampaignId ? api.getReceiptBooks(activeCampaignId) : null),
    enabled: !!activeCampaignId,
  });

  const { data: usageData, isLoading: usageLoading } = useQuery({
    queryKey: ['receipt-book-usage', selectedBookForUsage?.id],
    queryFn: () => (selectedBookForUsage ? api.getReceiptBookUsage(selectedBookForUsage.id) : null),
    enabled: !!selectedBookForUsage,
  });

  const books: ReceiptBook[] = Array.isArray(booksData)
    ? booksData
    : booksData?.results || [];

  // Add Book Mutation
  const addMutation = useMutation({
    mutationFn: () => {
      if (!activeCampaignId) throw new Error('No active campaign.');
      if (!bookLabel.trim()) throw new Error('Book label is required.');
      if (firstLeaf > lastLeaf) throw new Error('Starting leaf cannot exceed ending leaf.');
      return api.createReceiptBook({
        campaign: activeCampaignId,
        label: bookLabel.trim(),
        first_leaf: firstLeaf,
        last_leaf: lastLeaf,
        notes: bookNotes,
      });
    },
    onSuccess: (data) => {
      success(`Receipt Book "${data.label}" registered successfully.`);
      setAddModalOpen(false);
      setBookLabel('');
      setFirstLeaf(1);
      setLastLeaf(100);
      setBookNotes('');
      queryClient.invalidateQueries({ queryKey: ['receipt-books'] });
    },
    onError: (err: any) => {
      error(err.message || 'Failed to add receipt book.');
    },
  });

  return (
    <div>
      {/* Page Header */}
      <div className="zcm-page-header">
        <div>
          <h1 className="zcm-page-header__title">Receipt Book Register</h1>
          <div className="zcm-page-header__sub">
            Track receipt book inventory, assigned ranges, used leaf sequences, and voided leaves.
          </div>
        </div>

        <div className="zcm-page-header__actions">
          <button
            className="zcm-btn zcm-btn--primary"
            onClick={() => setAddModalOpen(true)}
            disabled={activeCampaign?.status === 'closed'}
          >
            <Plus size={16} />
            <span>Register Receipt Book</span>
          </button>
        </div>
      </div>

      {/* Books Table */}
      <div className="zcm-card zcm-card--flush">
        <div className="zcm-card__header">
          <h3>Receipt Book Inventory</h3>
          <span style={{ fontSize: '0.78125rem', color: '#64748B' }}>
            {books.length} total registered books
          </span>
        </div>

        <div className="zcm-table-container">
          <table className="zcm-table">
            <thead>
              <tr>
                <th>Book Label</th>
                <th>Leaf Capacity</th>
                <th className="zcm-text-right">Used Leaves</th>
                <th className="zcm-text-right">Remaining</th>
                <th>Next Suggested Leaf</th>
                <th>Status</th>
                <th className="zcm-text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {books.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem', color: '#64748B' }}>
                    No receipt books registered for this campaign yet.
                  </td>
                </tr>
              ) : (
                books.map((b) => (
                  <tr key={b.id}>
                    <td>
                      <strong style={{ fontSize: '0.875rem' }}>{b.label}</strong>
                      {b.notes && <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{b.notes}</div>}
                    </td>
                    <td>
                      <span>
                        #{b.first_leaf} – #{b.last_leaf} ({b.total_leaves} leaves)
                      </span>
                    </td>
                    <td className="zcm-text-right zcm-num">
                      <strong style={{ color: '#059669' }}>{b.used_leaves_count}</strong>
                    </td>
                    <td className="zcm-text-right zcm-num">
                      <span style={{ fontWeight: 600 }}>{b.remaining_leaves_count}</span>
                    </td>
                    <td>
                      <Badge variant="neutral">Leaf #{b.next_suggested_leaf}</Badge>
                    </td>
                    <td>
                      {b.status === 'active' && <Badge variant="success">Active</Badge>}
                      {b.status === 'completed' && <Badge variant="neutral">Completed</Badge>}
                      {b.status === 'archived' && <Badge variant="neutral">Archived</Badge>}
                    </td>
                    <td className="zcm-text-right">
                      <button
                        className="zcm-btn zcm-btn--secondary zcm-btn--sm"
                        onClick={() => setSelectedBookForUsage(b)}
                      >
                        <Eye size={13} />
                        <span>Usage History</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* REGISTER RECEIPT BOOK MODAL */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Register New Receipt Book"
        footer={
          <>
            <button className="zcm-btn zcm-btn--secondary" onClick={() => setAddModalOpen(false)}>
              Cancel
            </button>
            <button
              className="zcm-btn zcm-btn--primary"
              onClick={() => addMutation.mutate()}
              disabled={addMutation.isPending || !bookLabel.trim()}
            >
              {addMutation.isPending ? 'Registering...' : 'Register Book'}
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="zcm-form-group">
            <label>Book Label / Serial Code *</label>
            <input
              type="text"
              placeholder="e.g. Book RB-04"
              value={bookLabel}
              onChange={(e) => setBookLabel(e.target.value)}
              autoFocus
            />
          </div>

          <div className="zcm-form-grid-2">
            <div className="zcm-form-group">
              <label>First Leaf Number *</label>
              <input
                type="number"
                min="1"
                value={firstLeaf}
                onChange={(e) => setFirstLeaf(Number(e.target.value))}
              />
            </div>
            <div className="zcm-form-group">
              <label>Last Leaf Number *</label>
              <input
                type="number"
                min="1"
                value={lastLeaf}
                onChange={(e) => setLastLeaf(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="zcm-form-group">
            <label>Notes (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Received from printer on 15 Oct"
              value={bookNotes}
              onChange={(e) => setBookNotes(e.target.value)}
            />
          </div>
        </div>
      </Modal>

      {/* USAGE HISTORY MODAL */}
      <Modal
        isOpen={!!selectedBookForUsage}
        onClose={() => setSelectedBookForUsage(null)}
        title={`Receipt Book Usage: ${selectedBookForUsage?.label}`}
        size="lg"
      >
        {usageData && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{
              background: '#0B111E',
              border: '1px solid #1E293B',
              padding: '0.65rem 0.85rem',
              borderRadius: 6,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.8125rem',
              flexWrap: 'wrap',
              gap: '0.5rem',
              color: '#94A3B8'
            }}>
              <div>
                Total Leaves: <strong className="zcm-num" style={{ color: '#F8FAFC' }}>{usageData.book.total_leaves}</strong>
              </div>
              <div>
                Used Leaves: <strong className="zcm-num" style={{ color: '#34D399' }}>{usageData.book.used_leaves_count}</strong>
              </div>
              <div>
                Remaining Leaves: <strong className="zcm-num" style={{ color: '#38BDF8' }}>{usageData.book.remaining_leaves_count}</strong>
              </div>
              <div>
                Next Suggested: <strong className="zcm-num" style={{ color: '#FBBF24' }}>#{usageData.next_suggested_leaf}</strong>
              </div>
            </div>

            <div className="zcm-table-container">
              <table className="zcm-table" style={{ fontSize: '0.8125rem' }}>
                <thead>
                  <tr>
                    <th>Trip #</th>
                    <th>Date</th>
                    <th>Destination</th>
                    <th>Leaf Range Used</th>
                    <th>Leaves Count</th>
                    <th>Voided Leaves</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {usageData.used_ranges.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '1.5rem', color: '#94A3B8' }}>
                        No trips have used this receipt book yet.
                      </td>
                    </tr>
                  ) : (
                    usageData.used_ranges.map((r: any) => (
                      <tr key={r.trip_id}>
                        <td>#{r.trip_id}</td>
                        <td>{formatIndianDate(r.trip_date)}</td>
                        <td>{r.place}</td>
                        <td>
                          <strong>#{r.starting_leaf} - #{r.ending_leaf}</strong>
                        </td>
                        <td>{r.count} leaves</td>
                        <td>{r.voided_leaves || '-'}</td>
                        <td>
                          <Badge variant={r.status === 'settled' ? 'success' : 'warning'}>
                            {r.status}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
