import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Receipt,
  Plus,
  Search,
  Ban,
  Printer,
  Bus,
  Utensils,
  Package,
  Truck,
  FileSpreadsheet
} from 'lucide-react';
import { api } from '../../services/api';
import { useCampaign } from '../../context/CampaignContext';
import { useToast } from '../../context/ToastContext';
import { Expense, ExpenseCategory } from '../../types';
import { formatINR, formatIndianDate } from '../../utils/formatters';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { StatCard } from '../../components/ui/StatCard';

export const ExpensesPage: React.FC = () => {
  const { activeCampaign, activeCampaignId } = useCampaign();
  const { success, error, warning } = useToast();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [voidModalOpen, setVoidModalOpen] = useState(false);
  const [selectedExpenseToVoid, setSelectedExpenseToVoid] = useState<Expense | null>(null);
  const [voidReason, setVoidReason] = useState('');

  // Form state
  const [category, setCategory] = useState<ExpenseCategory>('other');
  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');

  // Query expenses
  const { data: expensesData, isLoading } = useQuery({
    queryKey: ['expenses', activeCampaignId, categoryFilter, searchQuery],
    queryFn: () => {
      const params: any = { campaign: activeCampaignId };
      if (categoryFilter) params.category = categoryFilter;
      if (searchQuery) params.search = searchQuery;
      return api.getExpenses(params);
    },
    enabled: !!activeCampaignId,
  });

  const expenses: Expense[] = Array.isArray(expensesData)
    ? expensesData
    : expensesData?.results || [];

  const totalActiveExpenses = expenses
    .filter((e) => !e.is_voided)
    .reduce((sum, e) => sum + parseFloat(e.amount || '0'), 0);

  // Add Expense Mutation
  const addMutation = useMutation({
    mutationFn: () => {
      if (!activeCampaignId) throw new Error('No active campaign.');
      if (!amount || parseFloat(amount) <= 0) throw new Error('Enter a valid expense amount.');
      if (!description.trim()) throw new Error('Description is required.');

      // Check printing duplicate
      if (category === 'printing') {
        const hasPrinting = expenses.some((e) => e.category === 'printing' && !e.is_voided);
        if (hasPrinting) {
          throw new Error('A printing expense is already recorded for this campaign. Re-recording would distort profit.');
        }
      }

      return api.createExpense({
        campaign: activeCampaignId,
        category,
        amount,
        date,
        description: description.trim(),
        notes,
      });
    },
    onSuccess: (data) => {
      success(`Expense of ${formatINR(data.amount)} recorded successfully.`);
      setAddModalOpen(false);
      setAmount('');
      setDescription('');
      setNotes('');
      setCategory('other');
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['campaign-summary'] });
    },
    onError: (err: any) => {
      error(err.message || 'Failed to record expense.');
    },
  });

  // Void Expense Mutation
  const voidMutation = useMutation({
    mutationFn: () => {
      if (!selectedExpenseToVoid) throw new Error('No expense selected to void.');
      return api.voidExpense(selectedExpenseToVoid.id, voidReason);
    },
    onSuccess: () => {
      success('Expense voided and removed from profit calculation.');
      setVoidModalOpen(false);
      setSelectedExpenseToVoid(null);
      setVoidReason('');
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['campaign-summary'] });
    },
    onError: (err: any) => {
      error(err.message || 'Failed to void expense.');
    },
  });

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'printing':
        return <Printer size={15} />;
      case 'bus_fare':
        return <Bus size={15} />;
      case 'food':
        return <Utensils size={15} />;
      case 'packaging':
        return <Package size={15} />;
      case 'transport':
        return <Truck size={15} />;
      default:
        return <Receipt size={15} />;
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="zcm-page-header">
        <div>
          <h1 className="zcm-page-header__title">Expense Tracker</h1>
          <div className="zcm-page-header__sub">
            General campaign expenses, printing outlays, and trip-linked disbursements.
          </div>
        </div>

        <div className="zcm-page-header__actions">
          <button
            className="zcm-btn zcm-btn--primary"
            onClick={() => setAddModalOpen(true)}
            disabled={activeCampaign?.status === 'closed'}
          >
            <Plus size={16} />
            <span>Record Expense</span>
          </button>
        </div>
      </div>

      {/* Expense Stats */}
      <div className="zcm-stat-grid">
        <StatCard
          title="Total Recorded Expenses"
          value={formatINR(totalActiveExpenses, true)}
          subtitle={`${expenses.filter((e) => !e.is_voided).length} active expense entries`}
          icon={Receipt}
          variant="danger"
        />
      </div>

      {/* Filters Toolbar */}
      <div className="zcm-filter-bar">
        <div className="zcm-filter-search">
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
          <input
            type="text"
            placeholder="Search expenses by description or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '2.5rem', width: '100%' }}
          />
        </div>

        <div className="zcm-filter-select">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{ width: '100%' }}
            aria-label="Filter by expense category"
          >
            <option value="">All Categories</option>
            <option value="printing">Printing</option>
            <option value="bus_fare">Bus Fare</option>
            <option value="food">Food</option>
            <option value="packaging">Packaging</option>
            <option value="transport">Transport</option>
            <option value="distribution_materials">Distribution Materials</option>
            <option value="other">Other</option>
          </select>
        </div>

        {(searchQuery || categoryFilter) && (
          <button
            className="zcm-btn zcm-btn--secondary zcm-btn--sm zcm-filter-btn"
            onClick={() => {
              setSearchQuery('');
              setCategoryFilter('');
            }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Expenses Table */}
      <div className="zcm-card zcm-card--flush">
        <div className="zcm-card__header">
          <h3>Campaign Expense Ledger</h3>
          <span style={{ fontSize: '0.78125rem', color: '#64748B' }}>
            {expenses.length} total recorded vouchers
          </span>
        </div>

        <div className="zcm-table-container">
          <table className="zcm-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Date</th>
                <th>Category</th>
                <th>Description</th>
                <th className="zcm-text-right">Amount (₹)</th>
                <th>Trip Reference</th>
                <th>Status</th>
                <th className="zcm-text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '2.5rem', color: '#64748B' }}>
                    No expenses recorded.
                  </td>
                </tr>
              ) : (
                expenses.map((e) => (
                  <tr key={e.id} style={{ opacity: e.is_voided ? 0.6 : 1 }}>
                    <td>
                      <span style={{ fontWeight: 600 }}>#{e.id}</span>
                    </td>
                    <td>{formatIndianDate(e.date)}</td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', textTransform: 'capitalize', fontWeight: 500 }}>
                        {getCategoryIcon(e.category)}
                        {e.category.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <strong>{e.description}</strong>
                      {e.notes && <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{e.notes}</div>}
                      {e.is_voided && (
                        <div style={{ fontSize: '0.75rem', color: '#DC2626', fontStyle: 'italic' }}>
                          Void reason: {e.voided_reason}
                        </div>
                      )}
                    </td>
                    <td className="zcm-text-right zcm-num">
                      <strong style={{ color: e.is_voided ? '#64748B' : '#F8FAFC', textDecoration: e.is_voided ? 'line-through' : 'none' }}>
                        {formatINR(e.amount, true)}
                      </strong>
                    </td>
                    <td>
                      {e.related_trip ? (
                        <span className="zcm-badge zcm-badge--neutral">Trip #{e.related_trip}</span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td>
                      {e.is_voided ? (
                        <Badge variant="danger">VOIDED</Badge>
                      ) : (
                        <Badge variant="success">Active</Badge>
                      )}
                    </td>
                    <td className="zcm-text-right">
                      {!e.is_voided && (
                        <button
                          className="zcm-btn zcm-btn--secondary zcm-btn--sm"
                          onClick={() => {
                            setSelectedExpenseToVoid(e);
                            setVoidModalOpen(true);
                          }}
                          title="Void Expense"
                        >
                          <Ban size={13} style={{ color: '#DC2626' }} />
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

      {/* RECORD EXPENSE MODAL */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Record New Campaign Expense"
        footer={
          <>
            <button className="zcm-btn zcm-btn--secondary" onClick={() => setAddModalOpen(false)}>
              Cancel
            </button>
            <button
              className="zcm-btn zcm-btn--primary"
              onClick={() => addMutation.mutate()}
              disabled={addMutation.isPending || !amount || !description.trim()}
            >
              {addMutation.isPending ? 'Saving...' : 'Save Expense'}
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="zcm-form-grid-2">
            <div className="zcm-form-group">
              <label>Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
              >
                <option value="printing">Printing</option>
                <option value="bus_fare">Bus Fare</option>
                <option value="food">Food</option>
                <option value="packaging">Packaging</option>
                <option value="transport">Transport</option>
                <option value="distribution_materials">Distribution Materials</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="zcm-form-group">
              <label>Amount (₹) *</label>
              <input
                type="number"
                min="0.01"
                step="any"
                placeholder="e.g. 500.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>

          <div className="zcm-form-group">
            <label>Date *</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="zcm-form-group">
            <label>Description *</label>
            <input
              type="text"
              placeholder="e.g. Purchase of plastic wrappers for calendar sets"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="zcm-form-group">
            <label>Notes (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Voucher or bill reference"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
      </Modal>

      {/* VOID EXPENSE MODAL */}
      <Modal
        isOpen={voidModalOpen}
        onClose={() => setVoidModalOpen(false)}
        title={`Void Expense #${selectedExpenseToVoid?.id}`}
        footer={
          <>
            <button className="zcm-btn zcm-btn--secondary" onClick={() => setVoidModalOpen(false)}>
              Cancel
            </button>
            <button
              className="zcm-btn zcm-btn--danger"
              onClick={() => voidMutation.mutate()}
              disabled={!voidReason.trim() || voidMutation.isPending}
            >
              {voidMutation.isPending ? 'Voiding...' : 'Confirm Void'}
            </button>
          </>
        }
      >
        <p style={{ fontSize: '0.875rem', color: '#94A3B8', marginBottom: '1rem', lineHeight: 1.5 }}>
          Are you sure you want to void the expense of{' '}
          <strong style={{ color: '#F8FAFC' }}>{formatINR(selectedExpenseToVoid?.amount)}</strong> ({selectedExpenseToVoid?.description})?
          This action will be logged in the audit trail.
        </p>
        <div className="zcm-form-group">
          <label>Reason for Voiding *</label>
          <input
            type="text"
            placeholder="e.g. Duplicate entry / Cancelled invoice"
            value={voidReason}
            onChange={(e) => setVoidReason(e.target.value)}
            autoFocus
          />
        </div>
      </Modal>
    </div>
  );
};
