import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Users,
  UserPlus,
  Search,
  Eye,
  Percent,
  TrendingUp,
  Receipt,
  CheckCircle,
  XCircle,
  Compass
} from 'lucide-react';
import { api } from '../../services/api';
import { useCampaign } from '../../context/CampaignContext';
import { useToast } from '../../context/ToastContext';
import { Student } from '../../types';
import { formatINR, formatIndianDate } from '../../utils/formatters';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';

export const StudentsPage: React.FC = () => {
  const { activeCampaignId } = useCampaign();
  const { success, error } = useToast();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState('');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [selectedStudentForSummary, setSelectedStudentForSummary] = useState<Student | null>(null);

  // Queries
  const { data: studentsData, isLoading } = useQuery({
    queryKey: ['students', searchQuery],
    queryFn: () => api.getStudents({ search: searchQuery }),
  });

  const { data: studentSummary, isLoading: summaryLoading } = useQuery({
    queryKey: ['student-summary', selectedStudentForSummary?.id, activeCampaignId],
    queryFn: () =>
      selectedStudentForSummary && activeCampaignId
        ? api.getStudentSummary(selectedStudentForSummary.id, activeCampaignId)
        : null,
    enabled: !!selectedStudentForSummary && !!activeCampaignId,
  });

  const students: Student[] = Array.isArray(studentsData)
    ? studentsData
    : studentsData?.results || [];

  // Add Student Mutation
  const addMutation = useMutation({
    mutationFn: (name: string) => api.createStudent(name.trim()),
    onSuccess: (data) => {
      success(`Student "${data.name}" added successfully.`);
      setAddModalOpen(false);
      setNewStudentName('');
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
    onError: (err: any) => {
      error(err.message || 'Failed to add student.');
    },
  });

  return (
    <div>
      {/* Page Header */}
      <div className="zcm-page-header">
        <div>
          <h1 className="zcm-page-header__title">Student Directory & Earnings</h1>
          <div className="zcm-page-header__sub">
            Track student trip participations, net collection shares, and accrued commission earnings.
          </div>
        </div>

        <div className="zcm-page-header__actions">
          <button className="zcm-btn zcm-btn--primary" onClick={() => setAddModalOpen(true)}>
            <UserPlus size={16} />
            <span>Add Student</span>
          </button>
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="zcm-card" style={{ padding: '1rem', marginBottom: '1.25rem' }}>
        <div style={{ position: 'relative', maxWidth: 400 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
          <input
            type="text"
            placeholder="Search student by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '2.5rem', width: '100%' }}
          />
        </div>
      </div>

      {/* Students Table */}
      <div className="zcm-card zcm-card--flush">
        <div className="zcm-card__header">
          <h3>Student Directory</h3>
          <span style={{ fontSize: '0.78125rem', color: '#64748B' }}>
            {students.length} total registered students
          </span>
        </div>

        <div className="zcm-table-container">
          <table className="zcm-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Student Name</th>
                <th>Status</th>
                <th>Created Date</th>
                <th className="zcm-text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2.5rem', color: '#64748B' }}>
                    No students found.
                  </td>
                </tr>
              ) : (
                students.map((st) => (
                  <tr key={st.id}>
                    <td>
                      <span style={{ fontWeight: 600 }}>#{st.id}</span>
                    </td>
                    <td>
                      <strong style={{ fontSize: '0.875rem' }}>{st.name}</strong>
                    </td>
                    <td>
                      {st.is_active ? (
                        <Badge variant="success">Active</Badge>
                      ) : (
                        <Badge variant="neutral">Inactive</Badge>
                      )}
                    </td>
                    <td>{formatIndianDate(st.created_at)}</td>
                    <td className="zcm-text-right">
                      <button
                        className="zcm-btn zcm-btn--secondary zcm-btn--sm"
                        onClick={() => setSelectedStudentForSummary(st)}
                      >
                        <Eye size={13} />
                        <span>View Statement</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD STUDENT MODAL */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add New Student"
        footer={
          <>
            <button className="zcm-btn zcm-btn--secondary" onClick={() => setAddModalOpen(false)}>
              Cancel
            </button>
            <button
              className="zcm-btn zcm-btn--primary"
              onClick={() => addMutation.mutate(newStudentName)}
              disabled={!newStudentName.trim() || addMutation.isPending}
            >
              {addMutation.isPending ? 'Saving...' : 'Add Student'}
            </button>
          </>
        }
      >
        <div className="zcm-form-group">
          <label>Student Full Name *</label>
          <input
            type="text"
            placeholder="e.g. Ahmad Bilal"
            value={newStudentName}
            onChange={(e) => setNewStudentName(e.target.value)}
            autoFocus
          />
          <div className="zcm-help-text">
            Per academy requirements, only the student's name is recorded.
          </div>
        </div>
      </Modal>

      {/* STUDENT STATEMENT & FINANCIAL PROFILE MODAL */}
      <Modal
        isOpen={!!selectedStudentForSummary}
        onClose={() => setSelectedStudentForSummary(null)}
        title={`Financial Profile: ${selectedStudentForSummary?.name}`}
        size="lg"
      >
        {studentSummary && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Financial Overview Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.65rem' }}>
              <div style={{ background: '#0B111E', border: '1px solid #1E293B', padding: '0.65rem 0.75rem', borderRadius: 6 }}>
                <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>Settled Trips</div>
                <div className="zcm-num" style={{ fontSize: '1.2rem', fontWeight: 700, color: '#F8FAFC' }}>{studentSummary.trips_count}</div>
              </div>
              <div style={{ background: '#0B111E', border: '1px solid #1E293B', padding: '0.65rem 0.75rem', borderRadius: 6 }}>
                <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>Gross Share</div>
                <div className="zcm-num" style={{ fontSize: '1.1rem', fontWeight: 700, color: '#F8FAFC' }}>{formatINR(studentSummary.gross_collection, true)}</div>
              </div>
              <div style={{ background: '#0B111E', border: '1px solid #1E293B', padding: '0.65rem 0.75rem', borderRadius: 6 }}>
                <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>Trip Deductions</div>
                <div className="zcm-num" style={{ fontSize: '1.1rem', fontWeight: 700, color: '#F87171' }}>
                  -{formatINR(parseFloat(studentSummary.fare_share) + parseFloat(studentSummary.food_share), true)}
                </div>
              </div>
              <div style={{ background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '0.65rem 0.75rem', borderRadius: 6 }}>
                <div style={{ fontSize: '0.72rem', color: '#34D399' }}>Net Collection</div>
                <div className="zcm-num" style={{ fontSize: '1.1rem', fontWeight: 700, color: '#34D399' }}>
                  {formatINR(studentSummary.net_collection, true)}
                </div>
              </div>
              <div style={{ background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '0.65rem 0.75rem', borderRadius: 6 }}>
                <div style={{ fontSize: '0.72rem', color: '#FBBF24' }}>Commission ({studentSummary.commission_rate}%)</div>
                <div className="zcm-num" style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FBBF24' }}>
                  {formatINR(studentSummary.commission_earned, true)}
                </div>
              </div>
            </div>

            {/* Payout Status */}
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
              gap: '0.5rem'
            }}>
              <div>
                Commission Paid: <strong className="zcm-num" style={{ color: '#F8FAFC' }}>{formatINR(studentSummary.commission_paid, true)}</strong>
              </div>
              <div>
                Outstanding Payable: <strong className="zcm-num" style={{ color: '#34D399' }}>{formatINR(studentSummary.outstanding_payable, true)}</strong>
              </div>
              <div>
                Status: <Badge variant={studentSummary.finalization_status === 'finalized' ? 'success' : 'neutral'}>
                  {studentSummary.finalization_status.toUpperCase()}
                </Badge>
              </div>
            </div>

            {/* Trip-by-Trip Share Breakdown */}
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                Trip-by-Trip Net Collection Breakdown
              </h4>
              <div className="zcm-table-container">
                <table className="zcm-table" style={{ fontSize: '0.8125rem' }}>
                  <thead>
                    <tr>
                      <th>Trip #</th>
                      <th>Date</th>
                      <th>Destination</th>
                      <th className="zcm-text-right">Gross Share</th>
                      <th className="zcm-text-right">Fare Share</th>
                      <th className="zcm-text-right">Food Share</th>
                      <th className="zcm-text-right">Net Share</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentSummary.trips.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: '1.5rem', color: '#64748B' }}>
                          No settled trips found for this campaign.
                        </td>
                      </tr>
                    ) : (
                      studentSummary.trips.map((t: any) => (
                        <tr key={t.trip_id}>
                          <td>#{t.trip_id}</td>
                          <td>{formatIndianDate(t.trip_date)}</td>
                          <td>{t.place_name}</td>
                          <td className="zcm-text-right zcm-num">{formatINR(t.gross_share, true)}</td>
                          <td className="zcm-text-right zcm-num">-{formatINR(t.fare_share, true)}</td>
                          <td className="zcm-text-right zcm-num">-{formatINR(t.food_share, true)}</td>
                          <td className="zcm-text-right zcm-num">
                            <strong style={{ color: '#059669' }}>{formatINR(t.net_share, true)}</strong>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
