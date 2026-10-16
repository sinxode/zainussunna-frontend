import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import {
  Compass,
  Plus,
  Search,
  CheckCircle,
  AlertTriangle,
  Ban,
  Trash2,
  Clock,
  UserPlus,
  X,
  FileText,
  DollarSign,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { api } from '../../services/api';
import { useCampaign } from '../../context/CampaignContext';
import { useToast } from '../../context/ToastContext';
import { Trip, Student, Place, ReceiptBook } from '../../types';
import { formatINR, formatIndianDate, formatTime } from '../../utils/formatters';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';

export const TripsPage: React.FC = () => {
  const { activeCampaign, activeCampaignId } = useCampaign();
  const { success, error, warning } = useToast();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [reviewFilter, setReviewFilter] = useState<string>('');

  // Modals state
  const [dispatchModalOpen, setDispatchModalOpen] = useState(false);
  const [settleModalOpen, setSettleModalOpen] = useState(false);
  const [selectedTripToSettle, setSelectedTripToSettle] = useState<Trip | null>(null);
  const [voidModalOpen, setVoidModalOpen] = useState(false);
  const [selectedTripToVoid, setSelectedTripToVoid] = useState<Trip | null>(null);
  const [voidReason, setVoidReason] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedTripToDelete, setSelectedTripToDelete] = useState<Trip | null>(null);

  // New trip dispatch form state
  const [selectedPlaceId, setSelectedPlaceId] = useState<number | ''>('');
  const [newPlaceName, setNewPlaceName] = useState('');
  const [showNewPlaceInput, setShowNewPlaceInput] = useState(false);
  const [tripDate, setTripDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [departureTime, setDepartureTime] = useState('09:00');
  const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);
  const [calendarsIssued, setCalendarsIssued] = useState<number>(50);
  const [selectedBookId, setSelectedBookId] = useState<number | ''>('');
  const [startingLeaf, setStartingLeaf] = useState<number | ''>('');
  const [busFare, setBusFare] = useState<string>('0');
  const [dispatchNotes, setDispatchNotes] = useState('');

  // Settlement form state
  const [settleReturnTime, setSettleReturnTime] = useState('13:30');
  const [settleCalendarsSold, setSettleCalendarsSold] = useState<number>(0);
  const [settleCalendarsReturned, setSettleCalendarsReturned] = useState<number>(0);
  const [settleCash, setSettleCash] = useState<string>('0');
  const [settleGpay, setSettleGpay] = useState<string>('0');
  const [settleFood, setSettleFood] = useState<string>('0');
  const [settleEndingLeaf, setSettleEndingLeaf] = useState<number | ''>('');
  const [settleVoidedLeaves, setSettleVoidedLeaves] = useState('');
  const [settleNotes, setSettleNotes] = useState('');

  // Queries
  const { data: tripsData, isLoading: tripsLoading } = useQuery({
    queryKey: ['trips', activeCampaignId, statusFilter, reviewFilter, searchQuery],
    queryFn: () => {
      const params: any = { campaign: activeCampaignId };
      if (statusFilter) params.status = statusFilter;
      if (reviewFilter) params.review_status = reviewFilter;
      if (searchQuery) params.search = searchQuery;
      return api.getTrips(params);
    },
    enabled: !!activeCampaignId,
  });

  const { data: studentsData } = useQuery({
    queryKey: ['students', 'active'],
    queryFn: () => api.getStudents({ active_only: 'true' }),
  });

  const { data: placesData } = useQuery({
    queryKey: ['places'],
    queryFn: () => api.getPlaces(),
  });

  const { data: booksData } = useQuery({
    queryKey: ['receipt-books', activeCampaignId],
    queryFn: () => (activeCampaignId ? api.getReceiptBooks(activeCampaignId) : null),
    enabled: !!activeCampaignId,
  });

  const { data: inventoryData } = useQuery({
    queryKey: ['inventory-summary', activeCampaignId],
    queryFn: () => (activeCampaignId ? api.getInventorySummary(activeCampaignId) : null),
    enabled: !!activeCampaignId,
  });

  const trips: Trip[] = Array.isArray(tripsData) ? tripsData : tripsData?.results || [];
  const students: Student[] = Array.isArray(studentsData) ? studentsData : studentsData?.results || [];
  const places: Place[] = Array.isArray(placesData) ? placesData : placesData?.results || [];
  const books: ReceiptBook[] = Array.isArray(booksData) ? booksData : booksData?.results || [];

  // Check URL settle parameter
  useEffect(() => {
    const settleId = searchParams.get('settle');
    if (settleId && trips.length > 0) {
      const found = trips.find((t) => t.id === Number(settleId));
      if (found && found.status === 'in_progress') {
        openSettleModal(found);
      }
    }
  }, [searchParams, trips]);

  // When receipt book changes in dispatch, suggest next leaf
  const handleReceiptBookChange = (bookId: number) => {
    setSelectedBookId(bookId);
    const book = books.find((b) => b.id === bookId);
    if (book) {
      setStartingLeaf(book.next_suggested_leaf);
    }
  };

  // Toggle student selection (1 to 3 students)
  const toggleStudent = (id: number) => {
    if (selectedStudentIds.includes(id)) {
      setSelectedStudentIds((prev) => prev.filter((s) => s !== id));
    } else {
      if (selectedStudentIds.length >= 3) {
        warning('Maximum 3 students can be assigned to a trip.');
        return;
      }
      setSelectedStudentIds((prev) => [...prev, id]);
    }
  };

  // Dispatch Trip Mutation
  const dispatchMutation = useMutation({
    mutationFn: async () => {
      let placeId = selectedPlaceId;
      if (showNewPlaceInput && newPlaceName.trim()) {
        const createdPlace = await api.createPlace(newPlaceName.trim());
        placeId = createdPlace.id;
      }

      if (!placeId) throw new Error('Please select or create a destination place.');
      if (selectedStudentIds.length === 0) throw new Error('Select between 1 and 3 students.');
      if (calendarsIssued <= 0) throw new Error('Enter valid calendars to issue.');

      return api.dispatchTrip({
        campaign: activeCampaignId,
        place: placeId,
        trip_date: tripDate,
        departure_time: departureTime ? `${departureTime}:00` : null,
        student_ids: selectedStudentIds,
        calendars_issued: calendarsIssued,
        receipt_book: selectedBookId || null,
        receipt_starting_leaf: startingLeaf || null,
        bus_fare: busFare || '0.00',
        notes: dispatchNotes,
      });
    },
    onSuccess: (data) => {
      success(`Trip #${data.id} dispatched successfully to ${data.place_name}!`);
      setDispatchModalOpen(false);
      resetDispatchForm();
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['campaign-summary'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-summary'] });
    },
    onError: (err: any) => {
      error(err.message || 'Failed to dispatch trip.');
    },
  });

  const resetDispatchForm = () => {
    setSelectedPlaceId('');
    setNewPlaceName('');
    setShowNewPlaceInput(false);
    setSelectedStudentIds([]);
    setCalendarsIssued(50);
    setSelectedBookId('');
    setStartingLeaf('');
    setBusFare('0');
    setDispatchNotes('');
  };

  // Open Settle Modal
  const openSettleModal = (trip: Trip) => {
    setSelectedTripToSettle(trip);
    setSettleReturnTime(new Date().toTimeString().slice(0, 5));
    setSettleCalendarsSold(trip.calendars_issued);
    setSettleCalendarsReturned(0);
    // Suggest expected collection
    const minPrice = parseFloat(activeCampaign?.min_expected_collection_per_calendar || '20');
    setSettleCash(String(trip.calendars_issued * minPrice));
    setSettleGpay('0');
    setSettleFood('0');
    setSettleEndingLeaf(trip.receipt_starting_leaf ? trip.receipt_starting_leaf + trip.calendars_issued - 1 : '');
    setSettleVoidedLeaves('');
    setSettleNotes('');
    setSettleModalOpen(true);
  };

  // Settle Trip Mutation
  const settleMutation = useMutation({
    mutationFn: async () => {
      if (!selectedTripToSettle) throw new Error('No trip selected to settle.');
      return api.settleTrip(selectedTripToSettle.id, {
        return_time: settleReturnTime ? `${settleReturnTime}:00` : null,
        calendars_sold: Number(settleCalendarsSold),
        calendars_returned: Number(settleCalendarsReturned),
        cash_collection: settleCash || '0.00',
        gpay_collection: settleGpay || '0.00',
        food_expense: settleFood || '0.00',
        receipt_book: selectedTripToSettle.receipt_book,
        receipt_starting_leaf: selectedTripToSettle.receipt_starting_leaf,
        receipt_ending_leaf: settleEndingLeaf || null,
        voided_leaves: settleVoidedLeaves,
        discrepancy_notes: settleNotes,
      });
    },
    onSuccess: (data) => {
      success(`Trip #${data?.id} successfully settled and reconciled!`);
      setSettleModalOpen(false);
      setSelectedTripToSettle(null);
      setSearchParams({});
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['campaign-summary'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-summary'] });
      queryClient.invalidateQueries({ queryKey: ['commission-summary'] });
    },
    onError: (err: any) => {
      error(err.message || 'Settlement failed. Please check notes and fields.');
    },
  });

  // Void Trip Mutation
  const voidMutation = useMutation({
    mutationFn: async () => {
      if (!selectedTripToVoid) throw new Error('No trip selected to void.');
      return api.voidTrip(selectedTripToVoid.id, voidReason);
    },
    onSuccess: () => {
      success('Trip voided and issued stock returned to available inventory.');
      setVoidModalOpen(false);
      setSelectedTripToVoid(null);
      setVoidReason('');
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['campaign-summary'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-summary'] });
    },
    onError: (err: any) => {
      error(err.message || 'Failed to void trip.');
    },
  });

  // Delete Trip Mutation
  const deleteTripMutation = useMutation({
    mutationFn: async () => {
      if (!selectedTripToDelete) throw new Error('No trip selected to delete.');
      return api.deleteTrip(selectedTripToDelete.id);
    },
    onSuccess: () => {
      success(`Trip #${selectedTripToDelete?.id} permanently deleted.`);
      setDeleteModalOpen(false);
      setSelectedTripToDelete(null);
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['campaign-summary'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-summary'] });
      queryClient.invalidateQueries({ queryKey: ['commission-summary'] });
      queryClient.invalidateQueries({ queryKey: ['reports-summary'] });
    },
    onError: (err: any) => {
      error(err.message || 'Failed to delete trip.');
    },
  });

  // Calculations preview for settlement
  const totalEnteredCollection = parseFloat(settleCash || '0') + parseFloat(settleGpay || '0');
  const minPricePerCalendar = parseFloat(activeCampaign?.min_expected_collection_per_calendar || '20');
  const expectedMinCollection = settleCalendarsSold * minPricePerCalendar;
  const shortfall = Math.max(0, expectedMinCollection - totalEnteredCollection);
  const stockDiscrepancy = selectedTripToSettle
    ? selectedTripToSettle.calendars_issued - (settleCalendarsSold + settleCalendarsReturned)
    : 0;
  const totalTripExpenses = selectedTripToSettle
    ? parseFloat(selectedTripToSettle.bus_fare || '0') + parseFloat(settleFood || '0')
    : 0;
  const netTripCollection = totalEnteredCollection - totalTripExpenses;
  const studentCount = selectedTripToSettle?.trip_students.length || 1;
  const estStudentNetShare = netTripCollection / studentCount;
  const commRate = parseFloat(activeCampaign?.commission_percentage || '10');
  const estStudentCommission = Math.max(0, (estStudentNetShare * commRate) / 100);

  const hasSettlementWarnings = shortfall > 0 || stockDiscrepancy !== 0 || netTripCollection < 0;

  return (
    <div>
      {/* Page Header */}
      <div className="zcm-page-header">
        <div>
          <h1 className="zcm-page-header__title">Trip Distribution & Settlement</h1>
          <div className="zcm-page-header__sub">
            Dispatch student teams, track field collections, validate receipt leaves, and settle returns.
          </div>
        </div>

        <div className="zcm-page-header__actions">
          <button
            className="zcm-btn zcm-btn--primary"
            onClick={() => setDispatchModalOpen(true)}
            disabled={activeCampaign?.status === 'closed'}
          >
            <Plus size={16} />
            <span>Dispatch New Trip</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="zcm-card" style={{ padding: '1rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: '1 1 240px', position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
            <input
              type="text"
              placeholder="Search by destination, student name, receipt book..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '2.5rem', width: '100%' }}
            />
          </div>

          <div style={{ width: 160 }}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: '100%' }}
              aria-label="Filter by trip status"
            >
              <option value="">All Statuses</option>
              <option value="in_progress">In Progress</option>
              <option value="settled">Settled</option>
              <option value="voided">Voided</option>
            </select>
          </div>

          <div style={{ width: 180 }}>
            <select
              value={reviewFilter}
              onChange={(e) => setReviewFilter(e.target.value)}
              style={{ width: '100%' }}
              aria-label="Filter by review status"
            >
              <option value="">All Review States</option>
              <option value="no_review_needed">No Review Needed</option>
              <option value="needs_review">Needs Review</option>
              <option value="reviewed_and_accepted">Reviewed & Accepted</option>
            </select>
          </div>

          {(searchQuery || statusFilter || reviewFilter) && (
            <button
              className="zcm-btn zcm-btn--secondary zcm-btn--sm"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('');
                setReviewFilter('');
              }}
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Trips Table */}
      <div className="zcm-table-container">
        <table className="zcm-table">
          <thead>
            <tr>
              <th>Trip #</th>
              <th>Date</th>
              <th>Destination</th>
              <th>Students</th>
              <th>Status</th>
              <th className="zcm-text-right">Issued</th>
              <th className="zcm-text-right">Sold / Ret.</th>
              <th className="zcm-text-right">Total Coll. (₹)</th>
              <th className="zcm-text-right">Expenses (₹)</th>
              <th>Receipt Info</th>
              <th className="zcm-text-center">Review Status</th>
              <th className="zcm-text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {trips.length === 0 ? (
              <tr>
                <td colSpan={12} style={{ textAlign: 'center', padding: '3rem', color: '#94A3B8' }}>
                  <Compass size={36} style={{ color: '#64748B', margin: '0 auto 0.75rem' }} />
                  <div style={{ fontWeight: 600, color: '#F8FAFC' }}>No Trips Found</div>
                  <div style={{ fontSize: '0.8125rem', color: '#94A3B8' }}>No trips match your current filter criteria.</div>
                </td>
              </tr>
            ) : (
              trips.map((trip) => (
                <tr key={trip.id}>
                  <td>
                    <span style={{ fontWeight: 700 }}>#{trip.id}</span>
                  </td>
                  <td>{formatIndianDate(trip.trip_date)}</td>
                  <td>
                    <strong style={{ color: '#F8FAFC' }}>{trip.place_name}</strong>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                      {trip.trip_students.map((ts) => (
                        <span key={ts.id} className="zcm-badge zcm-badge--neutral" style={{ fontSize: '0.7rem' }}>
                          {ts.student_name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    {trip.status === 'in_progress' && <Badge variant="warning">In Progress</Badge>}
                    {trip.status === 'settled' && <Badge variant="success">Settled</Badge>}
                    {trip.status === 'voided' && <Badge variant="neutral">Voided</Badge>}
                  </td>
                  <td className="zcm-text-right zcm-num">
                    <strong>{trip.calendars_issued}</strong>
                  </td>
                  <td className="zcm-text-right zcm-num">
                    {trip.status === 'settled' ? (
                      <span>
                        <strong style={{ color: '#059669' }}>{trip.calendars_sold}</strong> sold /{' '}
                        <span style={{ color: '#64748B' }}>{trip.calendars_returned} ret</span>
                      </span>
                    ) : (
                      <span style={{ color: '#94A3B8' }}>Pending</span>
                    )}
                  </td>
                  <td className="zcm-text-right zcm-num">
                    {trip.status === 'settled' ? (
                      <div>
                        <strong>{formatINR(trip.total_collection)}</strong>
                        <div style={{ fontSize: '0.7rem', color: '#64748B' }}>
                          Cash: {formatINR(trip.cash_collection)} | GPay: {formatINR(trip.gpay_collection)}
                        </div>
                      </div>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="zcm-text-right zcm-num">
                    {formatINR(parseFloat(trip.bus_fare || '0') + parseFloat(trip.food_expense || '0'))}
                    <div style={{ fontSize: '0.7rem', color: '#64748B' }}>
                      Fare: {formatINR(trip.bus_fare)} | Food: {formatINR(trip.food_expense)}
                    </div>
                  </td>
                  <td>
                    {trip.receipt_book_label ? (
                      <div style={{ fontSize: '0.8125rem' }}>
                        <div>{trip.receipt_book_label}</div>
                        {trip.receipt_starting_leaf && (
                          <div style={{ fontSize: '0.7rem', color: '#64748B' }}>
                            Leaves: #{trip.receipt_starting_leaf} - #{trip.receipt_ending_leaf || '?'}
                          </div>
                        )}
                      </div>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="zcm-text-center">
                    {trip.review_status === 'needs_review' && (
                      <Badge variant="danger" title={trip.discrepancy_notes}>
                        <AlertTriangle size={11} /> Needs Review
                      </Badge>
                    )}
                    {trip.review_status === 'reviewed_and_accepted' && (
                      <Badge variant="success">
                        <CheckCircle size={11} /> Accepted
                      </Badge>
                    )}
                    {trip.review_status === 'no_review_needed' && (
                      <Badge variant="neutral">OK</Badge>
                    )}
                  </td>
                  <td className="zcm-text-right">
                    <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
                      {trip.status === 'in_progress' && (
                        <>
                          <button
                            className="zcm-btn zcm-btn--success zcm-btn--sm"
                            onClick={() => openSettleModal(trip)}
                          >
                            Settle
                          </button>
                          <button
                            className="zcm-btn zcm-btn--secondary zcm-btn--sm"
                            onClick={() => {
                              setSelectedTripToVoid(trip);
                              setVoidModalOpen(true);
                            }}
                            title="Void Trip"
                          >
                            <Ban size={14} style={{ color: '#EF4444' }} />
                          </button>
                        </>
                      )}
                      {trip.review_status === 'needs_review' && (
                        <button
                          className="zcm-btn zcm-btn--secondary zcm-btn--sm"
                          onClick={() => {
                            api.reviewTrip(trip.id, 'reviewed_and_accepted', 'Accepted by supervisor')
                              .then(() => {
                                success(`Trip #${trip.id} review accepted.`);
                                queryClient.invalidateQueries({ queryKey: ['trips'] });
                              });
                          }}
                          title="Accept Discrepancy"
                        >
                          Accept
                        </button>
                      )}
                      <button
                        className="zcm-btn zcm-btn--danger zcm-btn--sm"
                        onClick={() => {
                          setSelectedTripToDelete(trip);
                          setDeleteModalOpen(true);
                        }}
                        disabled={activeCampaign?.status === 'closed'}
                        title="Delete Trip"
                        style={{ padding: '0.35rem 0.55rem' }}
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

      {/* DISPATCH TRIP MODAL */}
      <Modal
        isOpen={dispatchModalOpen}
        onClose={() => setDispatchModalOpen(false)}
        title="Dispatch New Student Trip"
        size="lg"
        footer={
          <>
            <button
              className="zcm-btn zcm-btn--secondary"
              onClick={() => setDispatchModalOpen(false)}
              disabled={dispatchMutation.isPending}
            >
              Cancel
            </button>
            <button
              className="zcm-btn zcm-btn--primary"
              onClick={() => dispatchMutation.mutate()}
              disabled={dispatchMutation.isPending || (inventoryData?.available_stock || 0) < calendarsIssued}
            >
              {dispatchMutation.isPending ? 'Reserving & Dispatching...' : 'Dispatch Trip'}
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Stock Availability Callout */}
          <div style={{
            background: (inventoryData?.available_stock || 0) >= calendarsIssued ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
            border: `1px solid ${(inventoryData?.available_stock || 0) >= calendarsIssued ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
            borderRadius: 6,
            padding: '0.65rem 0.85rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.8125rem',
            color: (inventoryData?.available_stock || 0) >= calendarsIssued ? '#34D399' : '#F87171'
          }}>
            <div>
              Current Available: <strong>{inventoryData?.available_stock || 0} calendars</strong>
            </div>
            <div>
              Remaining After Dispatch:{' '}
              <strong>
                {Math.max(0, (inventoryData?.available_stock || 0) - calendarsIssued)} calendars
              </strong>
            </div>
          </div>

          {/* Place Selection */}
          <div className="zcm-form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label>Destination / Place *</label>
              <button
                type="button"
                className="zcm-btn zcm-btn--secondary zcm-btn--sm"
                onClick={() => setShowNewPlaceInput(!showNewPlaceInput)}
                style={{ border: 'none', padding: '0 0.25rem', color: '#38BDF8', fontSize: '0.75rem' }}
              >
                {showNewPlaceInput ? 'Choose existing place' : '+ Add new place'}
              </button>
            </div>
            {showNewPlaceInput ? (
              <input
                type="text"
                placeholder="Enter new place name..."
                value={newPlaceName}
                onChange={(e) => setNewPlaceName(e.target.value)}
                autoFocus
              />
            ) : (
              <select
                value={selectedPlaceId}
                onChange={(e) => setSelectedPlaceId(Number(e.target.value))}
              >
                <option value="">Select a destination...</option>
                {places.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Student Picker (1 to 3) */}
          <div className="zcm-form-group">
            <label>Participating Students (Select 1 to 3 students) *</label>
            <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginBottom: '0.45rem' }}>
              Students share collections and trip expenses equally.
            </div>

            {/* Selected chips */}
            {selectedStudentIds.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.5rem' }}>
                {selectedStudentIds.map((id) => {
                  const st = students.find((s) => s.id === id);
                  return (
                    <span key={id} className="zcm-badge zcm-badge--success" style={{ padding: '0.25rem 0.55rem' }}>
                      {st?.name}
                      <X size={13} style={{ cursor: 'pointer', marginLeft: 4 }} onClick={() => toggleStudent(id)} />
                    </span>
                  );
                })}
              </div>
            )}

            {/* Student selection tags */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.35rem',
              maxHeight: 140,
              overflowY: 'auto',
              padding: '0.5rem',
              background: '#0B111E',
              border: '1px solid #1E293B',
              borderRadius: 6
            }}>
              {students.map((st) => {
                const isSelected = selectedStudentIds.includes(st.id);
                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => toggleStudent(st.id)}
                    className={`zcm-btn zcm-btn--sm ${isSelected ? 'zcm-btn--primary' : 'zcm-btn--secondary'}`}
                    style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                  >
                    {st.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date, Time & Calendars Issued */}
          <div className="zcm-form-grid-3">
            <div className="zcm-form-group">
              <label>Trip Date *</label>
              <input
                type="date"
                value={tripDate}
                onChange={(e) => setTripDate(e.target.value)}
              />
            </div>
            <div className="zcm-form-group">
              <label>Departure Time</label>
              <input
                type="time"
                value={departureTime}
                onChange={(e) => setDepartureTime(e.target.value)}
              />
            </div>
            <div className="zcm-form-group">
              <label>Calendars Issued *</label>
              <input
                type="number"
                min="1"
                max={inventoryData?.available_stock || 1000}
                value={calendarsIssued}
                onChange={(e) => setCalendarsIssued(Number(e.target.value))}
              />
            </div>
          </div>

          {/* Receipt Book & Starting Leaf */}
          <div className="zcm-form-grid-3">
            <div className="zcm-form-group">
              <label>Receipt Book</label>
              <select
                value={selectedBookId}
                onChange={(e) => handleReceiptBookChange(Number(e.target.value))}
              >
                <option value="">Select Receipt Book...</option>
                {books.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.label} ({b.first_leaf}-{b.last_leaf})
                  </option>
                ))}
              </select>
            </div>
            <div className="zcm-form-group">
              <label>Starting Leaf</label>
              <input
                type="number"
                placeholder="e.g. 1"
                value={startingLeaf}
                onChange={(e) => setStartingLeaf(Number(e.target.value))}
              />
            </div>
            <div className="zcm-form-group">
              <label>Bus Fare Advanced (₹)</label>
              <input
                type="number"
                min="0"
                step="any"
                value={busFare}
                onChange={(e) => setBusFare(e.target.value)}
              />
            </div>
          </div>

          <div className="zcm-form-group">
            <label>Dispatch Notes</label>
            <input
              type="text"
              placeholder="e.g. Special instructions or transport notes"
              value={dispatchNotes}
              onChange={(e) => setDispatchNotes(e.target.value)}
            />
          </div>
        </div>
      </Modal>

      {/* SETTLEMENT MODAL */}
      <Modal
        isOpen={settleModalOpen}
        onClose={() => setSettleModalOpen(false)}
        title={`Settle Trip #${selectedTripToSettle?.id} — ${selectedTripToSettle?.place_name}`}
        size="lg"
        footer={
          <>
            <button
              className="zcm-btn zcm-btn--secondary"
              onClick={() => setSettleModalOpen(false)}
              disabled={settleMutation.isPending}
            >
              Cancel
            </button>
            <button
              className="zcm-btn zcm-btn--success"
              onClick={() => settleMutation.mutate()}
              disabled={settleMutation.isPending || (hasSettlementWarnings && !settleNotes.trim())}
            >
              {settleMutation.isPending ? 'Reconciling & Settling...' : 'Confirm Settlement'}
            </button>
          </>
        }
      >
        {selectedTripToSettle && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Original Dispatch Reference Banner */}
            <div style={{
              background: '#0B111E',
              border: '1px solid #1E293B',
              borderRadius: 6,
              padding: '0.65rem 0.85rem',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1.25rem',
              fontSize: '0.8125rem'
            }}>
              <div>
                Students: <strong style={{ color: '#F8FAFC' }}>{selectedTripToSettle.trip_students.map((s) => s.student_name).join(', ')}</strong>
              </div>
              <div>
                Calendars Issued: <strong style={{ color: '#38BDF8' }}>{selectedTripToSettle.calendars_issued}</strong>
              </div>
              <div>
                Bus Fare: <strong style={{ color: '#F8FAFC' }}>{formatINR(selectedTripToSettle.bus_fare)}</strong>
              </div>
              <div>
                Receipt Book: <strong style={{ color: '#F8FAFC' }}>{selectedTripToSettle.receipt_book_label || 'None'}</strong>
              </div>
            </div>

            {/* Calendars Reconciled */}
            <div className="zcm-form-grid-3">
              <div className="zcm-form-group">
                <label>Calendars Sold *</label>
                <input
                  type="number"
                  min="0"
                  max={selectedTripToSettle.calendars_issued}
                  value={settleCalendarsSold}
                  onChange={(e) => setSettleCalendarsSold(Number(e.target.value))}
                />
              </div>
              <div className="zcm-form-group">
                <label>Calendars Returned Unsold *</label>
                <input
                  type="number"
                  min="0"
                  max={selectedTripToSettle.calendars_issued}
                  value={settleCalendarsReturned}
                  onChange={(e) => setSettleCalendarsReturned(Number(e.target.value))}
                />
              </div>
              <div className="zcm-form-group">
                <label>Return Time</label>
                <input
                  type="time"
                  value={settleReturnTime}
                  onChange={(e) => setSettleReturnTime(e.target.value)}
                />
              </div>
            </div>

            {/* Collections & Food Expense */}
            <div className="zcm-form-grid-3">
              <div className="zcm-form-group">
                <label>Cash Collected (₹) *</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={settleCash}
                  onChange={(e) => setSettleCash(e.target.value)}
                />
              </div>
              <div className="zcm-form-group">
                <label>Google Pay / UPI (₹) *</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={settleGpay}
                  onChange={(e) => setSettleGpay(e.target.value)}
                />
              </div>
              <div className="zcm-form-group">
                <label>Food Expense (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={settleFood}
                  onChange={(e) => setSettleFood(e.target.value)}
                />
              </div>
            </div>

            {/* Receipt Leaf Tracking */}
            <div className="zcm-form-grid-2">
              <div className="zcm-form-group">
                <label>Ending Receipt Leaf</label>
                <input
                  type="number"
                  placeholder="e.g. 50"
                  value={settleEndingLeaf}
                  onChange={(e) => setSettleEndingLeaf(Number(e.target.value))}
                />
                <div className="zcm-help-text">
                  Starting leaf was #{selectedTripToSettle.receipt_starting_leaf || 'None'}
                </div>
              </div>
              <div className="zcm-form-group">
                <label>Voided / Spoiled Leaves</label>
                <input
                  type="text"
                  placeholder="e.g. 14, 28"
                  value={settleVoidedLeaves}
                  onChange={(e) => setSettleVoidedLeaves(e.target.value)}
                />
              </div>
            </div>

            {/* LIVE CALCULATION PREVIEW */}
            <div style={{
              background: '#0B111E',
              border: '1px solid #1E293B',
              borderRadius: 6,
              padding: '0.85rem 1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              fontSize: '0.8125rem'
            }}>
              <div style={{ fontWeight: 600, borderBottom: '1px solid #1E293B', paddingBottom: '0.4rem', color: '#F8FAFC' }}>
                Settlement Verification & Equal Allocation Preview
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94A3B8' }}>Total Actual Collection (Cash + GPay):</span>
                <strong className="zcm-num" style={{ color: '#34D399' }}>{formatINR(totalEnteredCollection, true)}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94A3B8' }}>Expected Minimum Collection ({settleCalendarsSold} × ₹{minPricePerCalendar}):</span>
                <span className="zcm-num">{formatINR(expectedMinCollection, true)}</span>
              </div>

              {shortfall > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#FBBF24', fontWeight: 600 }}>
                  <span>Shortfall Below Expected Price:</span>
                  <span className="zcm-num">-{formatINR(shortfall, true)}</span>
                </div>
              )}

              {stockDiscrepancy !== 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#F87171', fontWeight: 600 }}>
                  <span>Stock Discrepancy (Issued vs Sold+Returned):</span>
                  <span>{stockDiscrepancy} calendars missing/unaccounted</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #1E293B', paddingTop: '0.4rem' }}>
                <span style={{ color: '#94A3B8' }}>Total Trip Expenses (Bus Fare + Food):</span>
                <span className="zcm-num" style={{ color: '#F87171' }}>-{formatINR(totalTripExpenses, true)}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94A3B8' }}>Trip Net Collection for Group:</span>
                <strong className="zcm-num" style={{ color: '#F8FAFC' }}>{formatINR(netTripCollection, true)}</strong>
              </div>

              <div style={{
                background: '#131B2E',
                border: '1px solid #1E293B',
                padding: '0.5rem 0.65rem',
                borderRadius: 4,
                marginTop: '0.25rem',
                display: 'flex',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.5rem'
              }}>
                <span style={{ color: '#94A3B8' }}>Per-Student Net Share ({studentCount} students):</span>
                <strong className="zcm-num" style={{ color: '#34D399' }}>
                  {formatINR(estStudentNetShare, true)} each (≈ {formatINR(estStudentCommission, true)} commission @ {commRate}%)
                </strong>
              </div>
            </div>

            {/* Warning Callout & Mandatory Notes */}
            {hasSettlementWarnings && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: 6,
                padding: '0.65rem 0.85rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#F87171', fontWeight: 600, fontSize: '0.8125rem', marginBottom: '0.2rem' }}>
                  <ShieldAlert size={15} /> Discrepancy Detected — Explanatory Note Required
                </div>
                <div style={{ fontSize: '0.72rem', color: '#FCA5A5' }}>
                  A shortfall or stock discrepancy exists. Per academy business rules, you must enter an explanatory note below to proceed.
                </div>
              </div>
            )}

            <div className="zcm-form-group">
              <label>
                Settlement Notes {hasSettlementWarnings && <span style={{ color: '#EF4444' }}>*</span>}
              </label>
              <textarea
                rows={2}
                placeholder={hasSettlementWarnings ? "Explain shortfall, returned stock discrepancy, or unusual conditions..." : "Optional trip settlement notes..."}
                value={settleNotes}
                onChange={(e) => setSettleNotes(e.target.value)}
              />
            </div>
          </div>
        )}
      </Modal>

      {/* VOID TRIP MODAL */}
      <Modal
        isOpen={voidModalOpen}
        onClose={() => setVoidModalOpen(false)}
        title={`Void Trip #${selectedTripToVoid?.id}`}
        footer={
          <>
            <button
              className="zcm-btn zcm-btn--secondary"
              onClick={() => setVoidModalOpen(false)}
            >
              Cancel
            </button>
            <button
              className="zcm-btn zcm-btn--danger"
              onClick={() => voidMutation.mutate()}
              disabled={!voidReason.trim() || voidMutation.isPending}
            >
              {voidMutation.isPending ? 'Voiding...' : 'Confirm Void Trip'}
            </button>
          </>
        }
      >
        <p style={{ fontSize: '0.875rem', color: '#94A3B8', marginBottom: '1rem', lineHeight: 1.5 }}>
          Are you sure you want to void Trip #{selectedTripToVoid?.id} to{' '}
          <strong style={{ color: '#F8FAFC' }}>{selectedTripToVoid?.place_name}</strong>? This will release{' '}
          <strong style={{ color: '#F8FAFC' }}>{selectedTripToVoid?.calendars_issued} calendars</strong> back to available stock.
        </p>
        <div className="zcm-form-group">
          <label>Reason for Voiding *</label>
          <input
            type="text"
            placeholder="e.g. Cancelled due to heavy rain / vehicle breakdown"
            value={voidReason}
            onChange={(e) => setVoidReason(e.target.value)}
          />
        </div>
      </Modal>

      {/* DELETE TRIP MODAL */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title={`Delete Trip #${selectedTripToDelete?.id || ''}`}
        footer={
          <>
            <button
              className="zcm-btn zcm-btn--secondary"
              onClick={() => setDeleteModalOpen(false)}
              disabled={deleteTripMutation.isPending}
            >
              Cancel
            </button>
            <button
              className="zcm-btn zcm-btn--danger"
              onClick={() => deleteTripMutation.mutate()}
              disabled={deleteTripMutation.isPending}
            >
              {deleteTripMutation.isPending ? 'Deleting...' : 'Delete Trip'}
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <p style={{ fontSize: '0.875rem', color: '#CBD5E1', lineHeight: 1.5 }}>
            Are you sure you want to permanently delete Trip <strong>#{selectedTripToDelete?.id}</strong> to{' '}
            <strong style={{ color: '#F8FAFC' }}>{selectedTripToDelete?.place_name}</strong> conducted on{' '}
            <strong>{formatIndianDate(selectedTripToDelete?.trip_date || '')}</strong>?
          </p>

          <div style={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '0.75rem', fontSize: '0.8125rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <div><span style={{ color: '#64748B' }}>Status:</span> <strong style={{ color: '#F8FAFC' }}>{selectedTripToDelete?.status?.toUpperCase()}</strong></div>
              <div><span style={{ color: '#64748B' }}>Issued:</span> <strong style={{ color: '#F8FAFC' }}>{selectedTripToDelete?.calendars_issued} calendars</strong></div>
              {selectedTripToDelete?.status === 'settled' && (
                <>
                  <div><span style={{ color: '#64748B' }}>Sold:</span> <strong style={{ color: '#10B981' }}>{selectedTripToDelete?.calendars_sold} calendars</strong></div>
                  <div><span style={{ color: '#64748B' }}>Collected:</span> <strong style={{ color: '#10B981' }}>{formatINR(selectedTripToDelete?.total_collection)}</strong></div>
                </>
              )}
            </div>
            {selectedTripToDelete?.trip_students && selectedTripToDelete.trip_students.length > 0 && (
              <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ color: '#64748B' }}>Assigned Students: </span>
                <span style={{ color: '#CBD5E1' }}>{selectedTripToDelete.trip_students.map(s => s.student_name).join(', ')}</span>
              </div>
            )}
          </div>

          <div style={{ fontSize: '0.8125rem', color: '#F87171', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)', padding: '0.75rem', borderRadius: '8px', lineHeight: 1.4 }}>
            ⚠️ <strong>Reconciliation Impact:</strong> Deleting this trip will reverse all inventory allocations, delete associated expenses, and recalculate participating students' net collections and commissions. An audit log will record this deletion.
          </div>
        </div>
      </Modal>
    </div>
  );
};
