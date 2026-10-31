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
  ArrowRight,
  Edit3,
  ChevronDown
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
  const [deleteReason, setDeleteReason] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // New trip dispatch form state
  const [selectedPlaceId, setSelectedPlaceId] = useState<number | ''>('');
  const [newPlaceName, setNewPlaceName] = useState('');
  const [showNewPlaceInput, setShowNewPlaceInput] = useState(false);
  const [tripDate, setTripDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [departureTime, setDepartureTime] = useState('09:00');
  const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);
  const [calendarsIssued, setCalendarsIssued] = useState<number>(50);
  const [dispatchReceiptBooks, setDispatchReceiptBooks] = useState<Array<{ receipt_book: number | ''; starting_leaf: number | '' }>>([
    { receipt_book: '', starting_leaf: '' },
  ]);
  const [busFare, setBusFare] = useState<string>('0');
  const [dispatchNotes, setDispatchNotes] = useState('');

  // Settlement form state
  const [settleReturnTime, setSettleReturnTime] = useState('13:30');
  const [settleCalendarsSold, setSettleCalendarsSold] = useState<number>(0);
  const [settleCalendarsReturned, setSettleCalendarsReturned] = useState<number>(0);
  const [settleCash, setSettleCash] = useState<string>('0');
  const [settleGpay, setSettleGpay] = useState<string>('0');
  const [settleFood, setSettleFood] = useState<string>('0');
  const [settleReceiptBooks, setSettleReceiptBooks] = useState<Array<{
    receipt_book: number;
    receipt_book_label?: string;
    starting_leaf: number | null;
    ending_leaf: number | '';
    voided_leaves: string;
  }>>([]);
  const [settleNotes, setSettleNotes] = useState('');

  // Edit trip modal & action dropdown state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedTripToEdit, setSelectedTripToEdit] = useState<Trip | null>(null);
  const [openActionDropdownId, setOpenActionDropdownId] = useState<number | null>(null);

  // Edit form state
  const [editPlaceId, setEditPlaceId] = useState<number | ''>('');
  const [newEditPlaceName, setNewEditPlaceName] = useState('');
  const [showEditNewPlaceInput, setShowEditNewPlaceInput] = useState(false);
  const [editTripDate, setEditTripDate] = useState('');
  const [editDepartureTime, setEditDepartureTime] = useState('09:00');
  const [editStudentIds, setEditStudentIds] = useState<number[]>([]);
  const [editCalendarsIssued, setEditCalendarsIssued] = useState<number>(0);
  const [editReceiptBooks, setEditReceiptBooks] = useState<Array<{
    receipt_book: number | '';
    starting_leaf: number | '';
    ending_leaf?: number | '';
    voided_leaves?: string;
  }>>([]);
  const [editBusFare, setEditBusFare] = useState<string>('0');
  const [editNotes, setEditNotes] = useState('');

  // Settled-specific edit state
  const [editReturnTime, setEditReturnTime] = useState('');
  const [editCalendarsSold, setEditCalendarsSold] = useState<number>(0);
  const [editCalendarsReturned, setEditCalendarsReturned] = useState<number>(0);
  const [editCash, setEditCash] = useState<string>('0');
  const [editGpay, setEditGpay] = useState<string>('0');
  const [editFood, setEditFood] = useState<string>('0');
  const [editDiscrepancyNotes, setEditDiscrepancyNotes] = useState('');
  const [editError, setEditError] = useState<string | null>(null);

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

  // Manage dispatch receipt book rows
  const handleDispatchReceiptBookChange = (index: number, bookId: number | '') => {
    setDispatchReceiptBooks((prev) => {
      const next = [...prev];
      const book = books.find((b) => b.id === bookId);
      next[index] = {
        receipt_book: bookId,
        starting_leaf: book ? (book.next_suggested_leaf ?? book.first_leaf) : '',
      };
      return next;
    });
  };

  const handleDispatchStartingLeafChange = (index: number, val: number | '') => {
    setDispatchReceiptBooks((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], starting_leaf: val };
      return next;
    });
  };

  const addDispatchReceiptBookRow = () => {
    setDispatchReceiptBooks((prev) => [...prev, { receipt_book: '', starting_leaf: '' }]);
  };

  const removeDispatchReceiptBookRow = (index: number) => {
    setDispatchReceiptBooks((prev) => prev.filter((_, i) => i !== index));
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
      if (showNewPlaceInput) {
        const cleanName = newPlaceName.trim();
        if (!cleanName) {
          throw new Error('Please enter a destination place name.');
        }
        // Match existing place case-insensitively
        const existing = places.find((p) => p.name.trim().toLowerCase() === cleanName.toLowerCase());
        if (existing) {
          placeId = existing.id;
        } else {
          try {
            const createdPlace = await api.createPlace(cleanName);
            placeId = createdPlace.id;
            queryClient.invalidateQueries({ queryKey: ['places'] });
          } catch (err: any) {
            throw new Error(`Failed to create place: ${err.message || 'Unknown error'}`);
          }
        }
      }

      if (!placeId) throw new Error('Please select or create a destination place.');
      if (selectedStudentIds.length === 0) throw new Error('Select between 1 and 3 students.');
      if (calendarsIssued <= 0) throw new Error('Enter valid calendars to issue.');

      // Validate receipt books
      const validBooks = dispatchReceiptBooks.filter((rb) => rb.receipt_book !== '');
      const bookIds = validBooks.map((rb) => rb.receipt_book);
      if (new Set(bookIds).size !== bookIds.length) {
        throw new Error('Duplicate receipt books selected. Each receipt book can only be added once to a trip.');
      }

      const receiptBooksPayload = validBooks.map((rb) => ({
        receipt_book: Number(rb.receipt_book),
        starting_leaf: rb.starting_leaf !== '' ? Number(rb.starting_leaf) : null,
      }));

      const primaryBook = receiptBooksPayload[0] || null;

      return api.dispatchTrip({
        campaign: activeCampaignId,
        place: placeId,
        trip_date: tripDate,
        departure_time: departureTime ? `${departureTime}:00` : null,
        student_ids: selectedStudentIds,
        calendars_issued: calendarsIssued,
        receipt_books: receiptBooksPayload,
        receipt_book: primaryBook ? primaryBook.receipt_book : null,
        receipt_starting_leaf: primaryBook ? primaryBook.starting_leaf : null,
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
    setDispatchReceiptBooks([{ receipt_book: '', starting_leaf: '' }]);
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
    setSettleNotes('');

    // Setup multiple receipt books for settlement
    if (trip.trip_receipt_books && trip.trip_receipt_books.length > 0) {
      setSettleReceiptBooks(
        trip.trip_receipt_books.map((trb) => ({
          receipt_book: trb.receipt_book,
          receipt_book_label: trb.receipt_book_label,
          starting_leaf: trb.starting_leaf,
          ending_leaf: trb.ending_leaf ?? '',
          voided_leaves: trb.voided_leaves || '',
        }))
      );
    } else if (trip.receipt_book) {
      setSettleReceiptBooks([
        {
          receipt_book: trip.receipt_book,
          receipt_book_label: trip.receipt_book_label || undefined,
          starting_leaf: trip.receipt_starting_leaf,
          ending_leaf: trip.receipt_ending_leaf ?? (trip.receipt_starting_leaf ? trip.receipt_starting_leaf + trip.calendars_issued - 1 : ''),
          voided_leaves: trip.voided_leaves || '',
        },
      ]);
    } else {
      setSettleReceiptBooks([]);
    }

    setSettleModalOpen(true);
  };

  // Settle Trip Mutation
  const settleMutation = useMutation({
    mutationFn: async () => {
      if (!selectedTripToSettle) throw new Error('No trip selected to settle.');

      const receiptBooksPayload = settleReceiptBooks.map((rb) => ({
        receipt_book: rb.receipt_book,
        starting_leaf: rb.starting_leaf,
        ending_leaf: rb.ending_leaf !== '' ? Number(rb.ending_leaf) : null,
        voided_leaves: rb.voided_leaves || '',
      }));

      const primary = receiptBooksPayload[0] || null;

      return api.settleTrip(selectedTripToSettle.id, {
        return_time: settleReturnTime ? `${settleReturnTime}:00` : null,
        calendars_sold: Number(settleCalendarsSold),
        calendars_returned: Number(settleCalendarsReturned),
        cash_collection: settleCash || '0.00',
        gpay_collection: settleGpay || '0.00',
        food_expense: settleFood || '0.00',
        receipt_books: receiptBooksPayload,
        receipt_book: primary ? primary.receipt_book : (selectedTripToSettle.receipt_book || null),
        receipt_starting_leaf: primary ? primary.starting_leaf : (selectedTripToSettle.receipt_starting_leaf || null),
        receipt_ending_leaf: primary ? primary.ending_leaf : null,
        voided_leaves: primary ? primary.voided_leaves : '',
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
    mutationFn: async ({ tripId, reason }: { tripId: number; reason: string }) => {
      return api.deleteTrip(tripId, reason);
    },
    onSuccess: (res, vars) => {
      success(res?.message || `Trip #${vars.tripId} permanently deleted.`);
      setDeleteModalOpen(false);
      setSelectedTripToDelete(null);
      setDeleteReason('');
      setDeleteError(null);
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['campaign-summary'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-summary'] });
      queryClient.invalidateQueries({ queryKey: ['commission-summary'] });
      queryClient.invalidateQueries({ queryKey: ['reports-summary'] });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
    onError: (err: any) => {
      const msg = err.message || 'Failed to delete trip.';
      setDeleteError(msg);
      error(msg);
    },
  });

  // Open Edit Modal
  const openEditModal = (trip: Trip) => {
    setSelectedTripToEdit(trip);
    setEditError(null);
    setEditPlaceId(trip.place);
    setNewEditPlaceName('');
    setShowEditNewPlaceInput(false);
    setEditTripDate(trip.trip_date);
    setEditDepartureTime(trip.departure_time ? trip.departure_time.slice(0, 5) : '09:00');
    setEditStudentIds(trip.trip_students.map((ts) => ts.student));
    setEditCalendarsIssued(trip.calendars_issued);
    setEditBusFare(String(trip.bus_fare || '0'));
    setEditNotes(trip.discrepancy_notes || '');

    // Setup multiple receipt books for editing
    if (trip.trip_receipt_books && trip.trip_receipt_books.length > 0) {
      setEditReceiptBooks(
        trip.trip_receipt_books.map((trb) => ({
          receipt_book: trb.receipt_book,
          starting_leaf: trb.starting_leaf ?? '',
          ending_leaf: trb.ending_leaf ?? '',
          voided_leaves: trb.voided_leaves || '',
        }))
      );
    } else if (trip.receipt_book) {
      setEditReceiptBooks([
        {
          receipt_book: trip.receipt_book,
          starting_leaf: trip.receipt_starting_leaf ?? '',
          ending_leaf: trip.receipt_ending_leaf ?? '',
          voided_leaves: trip.voided_leaves || '',
        },
      ]);
    } else {
      setEditReceiptBooks([{ receipt_book: '', starting_leaf: '', ending_leaf: '', voided_leaves: '' }]);
    }

    if (trip.status === 'settled') {
      setEditReturnTime(trip.return_time ? trip.return_time.slice(0, 5) : '');
      setEditCalendarsSold(trip.calendars_sold || 0);
      setEditCalendarsReturned(trip.calendars_returned || 0);
      setEditCash(String(trip.cash_collection || '0'));
      setEditGpay(String(trip.gpay_collection || '0'));
      setEditFood(String(trip.food_expense || '0'));
      setEditDiscrepancyNotes(trip.discrepancy_notes || '');
    }

    setOpenActionDropdownId(null);
    setEditModalOpen(true);
  };

  const handleEditReceiptBookChange = (index: number, bookId: number | '') => {
    setEditReceiptBooks((prev) => {
      const next = [...prev];
      const book = books.find((b) => b.id === bookId);
      next[index] = {
        ...next[index],
        receipt_book: bookId,
        starting_leaf: book ? (book.next_suggested_leaf ?? book.first_leaf) : '',
      };
      return next;
    });
  };

  const handleEditStartingLeafChange = (index: number, val: number | '') => {
    setEditReceiptBooks((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], starting_leaf: val };
      return next;
    });
  };

  const handleEditEndingLeafChange = (index: number, val: number | '') => {
    setEditReceiptBooks((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ending_leaf: val };
      return next;
    });
  };

  const handleEditVoidedLeavesChange = (index: number, val: string) => {
    setEditReceiptBooks((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], voided_leaves: val };
      return next;
    });
  };

  const addEditReceiptBookRow = () => {
    setEditReceiptBooks((prev) => [...prev, { receipt_book: '', starting_leaf: '', ending_leaf: '', voided_leaves: '' }]);
  };

  const removeEditReceiptBookRow = (index: number) => {
    setEditReceiptBooks((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleEditStudent = (id: number) => {
    if (editStudentIds.includes(id)) {
      setEditStudentIds(editStudentIds.filter((sid) => sid !== id));
    } else {
      if (editStudentIds.length >= 3) {
        warning('Maximum of 3 students can be assigned to a trip.');
        return;
      }
      setEditStudentIds([...editStudentIds, id]);
    }
  };

  // Update Trip Mutation
  const updateTripMutation = useMutation({
    mutationFn: async () => {
      if (!selectedTripToEdit) throw new Error('No trip selected to edit.');

      let placeId = editPlaceId;
      if (showEditNewPlaceInput) {
        const cleanName = newEditPlaceName.trim();
        if (!cleanName) {
          throw new Error('Please enter a destination place name.');
        }
        const existing = places.find((p) => p.name.trim().toLowerCase() === cleanName.toLowerCase());
        if (existing) {
          placeId = existing.id;
        } else {
          try {
            const createdPlace = await api.createPlace(cleanName);
            placeId = createdPlace.id;
            queryClient.invalidateQueries({ queryKey: ['places'] });
          } catch (err: any) {
            throw new Error(`Failed to create place: ${err.message || 'Unknown error'}`);
          }
        }
      }

      // Validate receipt books
      const validBooks = editReceiptBooks.filter((rb) => rb.receipt_book !== '');
      const bookIds = validBooks.map((rb) => rb.receipt_book);
      if (new Set(bookIds).size !== bookIds.length) {
        throw new Error('Duplicate receipt books selected. Each receipt book can only be added once.');
      }

      const receiptBooksPayload = validBooks.map((rb) => ({
        receipt_book: Number(rb.receipt_book),
        starting_leaf: rb.starting_leaf !== '' ? Number(rb.starting_leaf) : null,
        ending_leaf: rb.ending_leaf !== '' && rb.ending_leaf !== undefined ? Number(rb.ending_leaf) : null,
        voided_leaves: rb.voided_leaves || '',
      }));

      const primary = receiptBooksPayload[0] || null;

      const payload: any = {
        place: placeId ? Number(placeId) : undefined,
        trip_date: editTripDate,
        departure_time: editDepartureTime ? `${editDepartureTime}:00` : null,
        student_ids: editStudentIds,
        calendars_issued: Number(editCalendarsIssued),
        bus_fare: editBusFare || '0.00',
        receipt_books: receiptBooksPayload,
        receipt_book: primary ? primary.receipt_book : null,
        receipt_starting_leaf: primary ? primary.starting_leaf : null,
        notes: editNotes,
      };

      if (selectedTripToEdit.status === 'settled') {
        payload.return_time = editReturnTime ? `${editReturnTime}:00` : null;
        payload.calendars_sold = Number(editCalendarsSold);
        payload.calendars_returned = Number(editCalendarsReturned);
        payload.cash_collection = editCash || '0.00';
        payload.gpay_collection = editGpay || '0.00';
        payload.food_expense = editFood || '0.00';
        payload.receipt_ending_leaf = primary ? primary.ending_leaf : null,
        payload.voided_leaves = primary ? primary.voided_leaves : '';
        payload.discrepancy_notes = editDiscrepancyNotes;
      }

      return api.updateTrip(selectedTripToEdit.id, payload);
    },
    onSuccess: (data) => {
      success(`Trip #${data.id} updated successfully.`);
      setEditModalOpen(false);
      setSelectedTripToEdit(null);
      setEditError(null);
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['campaign-summary'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-summary'] });
      queryClient.invalidateQueries({ queryKey: ['commission-summary'] });
      queryClient.invalidateQueries({ queryKey: ['reports-summary'] });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
    onError: (err: any) => {
      const msg = err.message || 'Failed to update trip.';
      setEditError(msg);
      error(msg);
    },
  });

  // Calculations preview for editing a settled trip
  const editTotalCollection = parseFloat(editCash || '0') + parseFloat(editGpay || '0');
  const editExpectedMinCollection = editCalendarsSold * parseFloat(activeCampaign?.min_expected_collection_per_calendar || '20');
  const editShortfall = Math.max(0, editExpectedMinCollection - editTotalCollection);
  const editStockDiscrepancy = selectedTripToEdit
    ? editCalendarsIssued - (editCalendarsSold + editCalendarsReturned)
    : 0;
  const editTotalExpenses = parseFloat(editBusFare || '0') + parseFloat(editFood || '0');
  const editNetTripCollection = editTotalCollection - editTotalExpenses;
  const editHasWarnings = editShortfall > 0 || editStockDiscrepancy !== 0 || editNetTripCollection < 0;

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
      <div className="zcm-filter-bar">
        <div className="zcm-filter-search">
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
          <input
            type="text"
            placeholder="Search destination, student, book..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '2.5rem', width: '100%' }}
          />
        </div>

        <div className="zcm-filter-select">
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

        <div className="zcm-filter-select">
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
            className="zcm-btn zcm-btn--secondary zcm-btn--sm zcm-filter-btn"
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
                    {trip.trip_receipt_books && trip.trip_receipt_books.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.8125rem' }}>
                        {trip.trip_receipt_books.map((trb, idx) => (
                          <div key={idx} style={{ lineHeight: '1.2' }}>
                            <span style={{ fontWeight: 600, color: '#F8FAFC' }}>{trb.receipt_book_label}</span>
                            {trb.starting_leaf && (
                              <span style={{ fontSize: '0.72rem', color: '#94A3B8', marginLeft: '0.35rem' }}>
                                #{trb.starting_leaf} - #{trb.ending_leaf || '?'}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : trip.receipt_book_label ? (
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
                    <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                      {/* In-Progress Trips: Quick Settle & Edit */}
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
                            onClick={() => openEditModal(trip)}
                            title="Edit Trip Details"
                          >
                            <Edit3 size={13} />
                            <span>Edit</span>
                          </button>
                        </>
                      )}

                      {/* Settled Trips: Quick Edit & Accept */}
                      {trip.status === 'settled' && (
                        <>
                          <button
                            className="zcm-btn zcm-btn--secondary zcm-btn--sm"
                            onClick={() => openEditModal(trip)}
                            title="Edit Settled Trip"
                          >
                            <Edit3 size={13} />
                            <span>Edit</span>
                          </button>
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
                        </>
                      )}

                      {/* Actions Dropdown Option for both Progressing and Settled Trips */}
                      <div className="zcm-dropdown">
                        <button
                          className="zcm-btn zcm-btn--secondary zcm-btn--sm"
                          onClick={() => setOpenActionDropdownId(openActionDropdownId === trip.id ? null : trip.id)}
                          title="More actions"
                          style={{ padding: '0.35rem 0.55rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                          aria-expanded={openActionDropdownId === trip.id}
                        >
                          <span>Actions</span>
                          <ChevronDown size={12} />
                        </button>

                        {openActionDropdownId === trip.id && (
                          <>
                            <div
                              style={{ position: 'fixed', inset: 0, zIndex: 45 }}
                              onClick={() => setOpenActionDropdownId(null)}
                            />
                            <div className="zcm-dropdown__menu">
                              {trip.status === 'in_progress' && (
                                <>
                                  <button
                                    className="zcm-dropdown__item zcm-dropdown__item--success"
                                    onClick={() => {
                                      setOpenActionDropdownId(null);
                                      openSettleModal(trip);
                                    }}
                                  >
                                    <CheckCircle size={14} />
                                    <span>Settle Return</span>
                                  </button>
                                  <button
                                    className="zcm-dropdown__item"
                                    onClick={() => {
                                      setOpenActionDropdownId(null);
                                      openEditModal(trip);
                                    }}
                                  >
                                    <Edit3 size={14} />
                                    <span>Edit Trip</span>
                                  </button>
                                  <button
                                    className="zcm-dropdown__item"
                                    onClick={() => {
                                      setOpenActionDropdownId(null);
                                      setSelectedTripToVoid(trip);
                                      setVoidModalOpen(true);
                                    }}
                                  >
                                    <Ban size={14} style={{ color: '#F87171' }} />
                                    <span>Void Trip</span>
                                  </button>
                                </>
                              )}

                              {trip.status === 'settled' && (
                                <>
                                  <button
                                    className="zcm-dropdown__item"
                                    onClick={() => {
                                      setOpenActionDropdownId(null);
                                      openEditModal(trip);
                                    }}
                                  >
                                    <Edit3 size={14} />
                                    <span>Edit Settlement</span>
                                  </button>
                                  {trip.review_status === 'needs_review' && (
                                    <button
                                      className="zcm-dropdown__item zcm-dropdown__item--success"
                                      onClick={() => {
                                        setOpenActionDropdownId(null);
                                        api.reviewTrip(trip.id, 'reviewed_and_accepted', 'Accepted by supervisor')
                                          .then(() => {
                                            success(`Trip #${trip.id} review accepted.`);
                                            queryClient.invalidateQueries({ queryKey: ['trips'] });
                                          });
                                      }}
                                    >
                                      <CheckCircle size={14} />
                                      <span>Accept Discrepancy</span>
                                    </button>
                                  )}
                                </>
                              )}

                              <button
                                className="zcm-dropdown__item zcm-dropdown__item--danger"
                                onClick={() => {
                                  setOpenActionDropdownId(null);
                                  setSelectedTripToDelete(trip);
                                  setDeleteReason('');
                                  setDeleteError(null);
                                  setDeleteModalOpen(true);
                                }}
                                disabled={activeCampaign?.status === 'closed'}
                              >
                                <Trash2 size={14} />
                                <span>Delete Trip</span>
                              </button>
                            </div>
                          </>
                        )}
                      </div>
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

          {/* Multiple Receipt Books & Starting Leaf */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#F8FAFC' }}>
                Receipt Book(s) & Starting Leaf
              </label>
              <button
                type="button"
                className="zcm-btn zcm-btn--secondary zcm-btn--sm"
                onClick={addDispatchReceiptBookRow}
                style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', color: '#38BDF8' }}
              >
                + Add Another Book
              </button>
            </div>

            {dispatchReceiptBooks.map((rb, idx) => (
              <div
                key={idx}
                style={{
                  display: 'grid',
                  gridTemplateColumns: dispatchReceiptBooks.length > 1 ? '1fr 140px 38px' : '1fr 140px',
                  gap: '0.5rem',
                  alignItems: 'end',
                  background: '#0B111E',
                  border: '1px solid #1E293B',
                  borderRadius: 6,
                  padding: '0.65rem 0.75rem',
                }}
              >
                <div className="zcm-form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '0.75rem' }}>Receipt Book {dispatchReceiptBooks.length > 1 ? `#${idx + 1}` : ''}</label>
                  <select
                    value={rb.receipt_book}
                    onChange={(e) => handleDispatchReceiptBookChange(idx, e.target.value ? Number(e.target.value) : '')}
                  >
                    <option value="">Select Receipt Book...</option>
                    {books.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.label} (Leaves #{b.first_leaf}-#{b.last_leaf})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="zcm-form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '0.75rem' }}>Starting Leaf</label>
                  <input
                    type="number"
                    placeholder="e.g. 1"
                    value={rb.starting_leaf}
                    onChange={(e) => handleDispatchStartingLeafChange(idx, e.target.value ? Number(e.target.value) : '')}
                  />
                </div>

                {dispatchReceiptBooks.length > 1 && (
                  <button
                    type="button"
                    className="zcm-btn zcm-btn--danger zcm-btn--sm"
                    onClick={() => removeDispatchReceiptBookRow(idx)}
                    title="Remove this receipt book"
                    style={{ height: '38px', padding: '0 0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <X size={15} />
                  </button>
                )}
              </div>
            ))}
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

            {/* Multiple Receipt Books Reconciliation */}
            {settleReceiptBooks.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#F8FAFC' }}>
                  Receipt Book Reconciliation ({settleReceiptBooks.length} Assigned)
                </label>
                {settleReceiptBooks.map((rb, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: '#0B111E',
                      border: '1px solid #1E293B',
                      borderRadius: 6,
                      padding: '0.75rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                    }}
                  >
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#38BDF8' }}>
                      📖 {rb.receipt_book_label || `Book #${rb.receipt_book}`} — Starting Leaf: #{rb.starting_leaf ?? 'Not set'}
                    </div>
                    <div className="zcm-form-grid-2">
                      <div className="zcm-form-group" style={{ marginBottom: 0 }}>
                        <label style={{ fontSize: '0.75rem' }}>Ending Leaf</label>
                        <input
                          type="number"
                          placeholder={`e.g. ${(rb.starting_leaf || 1) + 20}`}
                          value={rb.ending_leaf}
                          onChange={(e) => {
                            const val = e.target.value ? Number(e.target.value) : '';
                            setSettleReceiptBooks((prev) => {
                              const next = [...prev];
                              next[idx] = { ...next[idx], ending_leaf: val };
                              return next;
                            });
                          }}
                        />
                      </div>
                      <div className="zcm-form-group" style={{ marginBottom: 0 }}>
                        <label style={{ fontSize: '0.75rem' }}>Voided / Spoiled Leaves</label>
                        <input
                          type="text"
                          placeholder="e.g. 14, 28"
                          value={rb.voided_leaves}
                          onChange={(e) => {
                            const val = e.target.value;
                            setSettleReceiptBooks((prev) => {
                              const next = [...prev];
                              next[idx] = { ...next[idx], voided_leaves: val };
                              return next;
                            });
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

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
        onClose={() => {
          if (!deleteTripMutation.isPending) {
            setDeleteModalOpen(false);
            setDeleteError(null);
          }
        }}
        title={`Delete Trip #${selectedTripToDelete?.id || ''}`}
        footer={
          <>
            <button
              className="zcm-btn zcm-btn--secondary"
              onClick={() => {
                setDeleteModalOpen(false);
                setDeleteError(null);
              }}
              disabled={deleteTripMutation.isPending}
            >
              Cancel
            </button>
            <button
              className="zcm-btn zcm-btn--danger"
              onClick={() => {
                if (selectedTripToDelete) {
                  setDeleteError(null);
                  deleteTripMutation.mutate({
                    tripId: selectedTripToDelete.id,
                    reason: deleteReason,
                  });
                }
              }}
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

          {selectedTripToDelete?.status === 'in_progress' && (
            <div style={{ fontSize: '0.8125rem', color: '#38BDF8', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.25)', padding: '0.75rem', borderRadius: '8px', lineHeight: 1.4 }}>
              ℹ️ <strong>Stock Restoration:</strong> All {selectedTripToDelete?.calendars_issued} issued calendars will be immediately returned to available campaign stock.
            </div>
          )}

          {selectedTripToDelete?.status === 'settled' && (
            <div style={{ fontSize: '0.8125rem', color: '#F87171', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)', padding: '0.75rem', borderRadius: '8px', lineHeight: 1.4 }}>
              ⚠️ <strong>Settlement Reversal:</strong> Deleting this settled trip will reverse all recorded collections ({formatINR(selectedTripToDelete?.total_collection)}), restore unsold stock, and recalculate participating students' net collections and commissions.
            </div>
          )}

          <div className="zcm-form-group" style={{ marginBottom: 0 }}>
            <label style={{ fontSize: '0.8125rem', color: '#94A3B8' }}>Reason for Deletion (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Duplicate entry, wrong date entered, or cancelled trip"
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
              disabled={deleteTripMutation.isPending}
            />
          </div>

          {deleteError && (
            <div style={{ fontSize: '0.8125rem', color: '#EF4444', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', padding: '0.75rem', borderRadius: '8px', lineHeight: 1.4 }}>
              ❌ <strong>Deletion Failed:</strong> {deleteError}
            </div>
          )}
        </div>
      </Modal>

      {/* EDIT TRIP MODAL (FOR BOTH IN-PROGRESS & SETTLED TRIPS) */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={`Edit Trip #${selectedTripToEdit?.id} (${selectedTripToEdit?.status === 'in_progress' ? 'In Progress' : 'Settled'})`}
        size="lg"
        footer={
          <>
            <button
              className="zcm-btn zcm-btn--secondary"
              onClick={() => setEditModalOpen(false)}
              disabled={updateTripMutation.isPending}
            >
              Cancel
            </button>
            <button
              className="zcm-btn zcm-btn--primary"
              onClick={() => updateTripMutation.mutate()}
              disabled={
                updateTripMutation.isPending ||
                (selectedTripToEdit?.status === 'settled' && editHasWarnings && !editDiscrepancyNotes.trim())
              }
            >
              {updateTripMutation.isPending ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </>
        }
      >
        {selectedTripToEdit && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Context Header */}
            <div
              style={{
                background: '#0B111E',
                border: '1px solid #1E293B',
                borderRadius: 8,
                padding: '0.75rem 1rem',
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '0.75rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Badge variant={selectedTripToEdit.status === 'settled' ? 'success' : 'warning'}>
                  {selectedTripToEdit.status === 'settled' ? 'SETTLED' : 'IN PROGRESS'}
                </Badge>
                <strong style={{ color: '#F8FAFC', fontSize: '0.9rem' }}>
                  Trip #{selectedTripToEdit.id} – {selectedTripToEdit.place_name}
                </strong>
              </div>
              <div style={{ fontSize: '0.8125rem', color: '#94A3B8' }}>
                Campaign: <strong style={{ color: '#F8FAFC' }}>{activeCampaign?.name || activeCampaignId}</strong>
              </div>
            </div>

            {/* Error banner if update failed */}
            {editError && (
              <div
                style={{
                  fontSize: '0.8125rem',
                  color: '#EF4444',
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  lineHeight: 1.4,
                }}
              >
                ❌ <strong>Error updating trip:</strong> {editError}
              </div>
            )}

            {/* IF SETTLED: SHOW SETTLEMENT SECTION FIRST */}
            {selectedTripToEdit.status === 'settled' && (
              <>
                <div style={{ borderBottom: '1px solid #1E293B', paddingBottom: '0.4rem', marginTop: '0.25rem' }}>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#38BDF8' }}>
                    1. Settlement Financial & Inventory Reconciliations
                  </h4>
                </div>

                {/* Sold & Returned & Return Time */}
                <div className="zcm-form-grid-3">
                  <div className="zcm-form-group">
                    <label>Calendars Sold *</label>
                    <input
                      type="number"
                      min="0"
                      value={editCalendarsSold}
                      onChange={(e) => setEditCalendarsSold(Number(e.target.value))}
                    />
                  </div>
                  <div className="zcm-form-group">
                    <label>Calendars Returned *</label>
                    <input
                      type="number"
                      min="0"
                      value={editCalendarsReturned}
                      onChange={(e) => setEditCalendarsReturned(Number(e.target.value))}
                    />
                  </div>
                  <div className="zcm-form-group">
                    <label>Return Time</label>
                    <input
                      type="time"
                      value={editReturnTime}
                      onChange={(e) => setEditReturnTime(e.target.value)}
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
                      value={editCash}
                      onChange={(e) => setEditCash(e.target.value)}
                    />
                  </div>
                  <div className="zcm-form-group">
                    <label>Google Pay / UPI (₹) *</label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={editGpay}
                      onChange={(e) => setEditGpay(e.target.value)}
                    />
                  </div>
                  <div className="zcm-form-group">
                    <label>Food Expense (₹)</label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={editFood}
                      onChange={(e) => setEditFood(e.target.value)}
                    />
                  </div>
                </div>



                {/* Live Reconciliation Preview Box */}
                <div
                  style={{
                    background: '#0B111E',
                    border: '1px solid #1E293B',
                    borderRadius: 8,
                    padding: '0.85rem 1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    fontSize: '0.8125rem',
                  }}
                >
                  <div style={{ fontWeight: 600, borderBottom: '1px solid #1E293B', paddingBottom: '0.4rem', color: '#F8FAFC' }}>
                    Recalculation & Financial Preview
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.25rem' }}>
                    <span style={{ color: '#94A3B8' }}>Total Collection (Cash + GPay):</span>
                    <strong className="zcm-num" style={{ color: '#34D399' }}>{formatINR(editTotalCollection, true)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.25rem' }}>
                    <span style={{ color: '#94A3B8' }}>Expected Min Collection ({editCalendarsSold} × ₹{parseFloat(activeCampaign?.min_expected_collection_per_calendar || '20')}):</span>
                    <span className="zcm-num">{formatINR(editExpectedMinCollection, true)}</span>
                  </div>
                  {editShortfall > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#FBBF24', fontWeight: 600 }}>
                      <span>Shortfall Below Expected:</span>
                      <span className="zcm-num">-{formatINR(editShortfall, true)}</span>
                    </div>
                  )}
                  {editStockDiscrepancy !== 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#F87171', fontWeight: 600 }}>
                      <span>Stock Discrepancy (Issued vs Sold+Returned):</span>
                      <span>{editStockDiscrepancy} calendars missing/unaccounted</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #1E293B', paddingTop: '0.4rem' }}>
                    <span style={{ color: '#94A3B8' }}>Net Trip Generated (After Fare & Food):</span>
                    <strong className="zcm-num" style={{ color: editNetTripCollection >= 0 ? '#34D399' : '#EF4444' }}>
                      {formatINR(editNetTripCollection, true)}
                    </strong>
                  </div>
                </div>

                <div className="zcm-form-group">
                  <label>
                    Settlement Notes & Discrepancy Explanation {editHasWarnings ? '*' : '(Optional)'}
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Provide explanatory notes for any collection shortfall or leaf discrepancy..."
                    value={editDiscrepancyNotes}
                    onChange={(e) => setEditDiscrepancyNotes(e.target.value)}
                  />
                </div>

                <div style={{ borderBottom: '1px solid #1E293B', paddingBottom: '0.4rem', marginTop: '0.5rem' }}>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#94A3B8' }}>
                    2. Dispatch Logistics & Student Participants
                  </h4>
                </div>
              </>
            )}

            {/* COMMON / DISPATCH PARAMETERS */}
            <div className="zcm-form-grid-2">
              <div className="zcm-form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label>Destination Place *</label>
                  <button
                    type="button"
                    className="zcm-btn zcm-btn--secondary zcm-btn--sm"
                    onClick={() => setShowEditNewPlaceInput(!showEditNewPlaceInput)}
                    style={{ border: 'none', padding: '0 0.25rem', color: '#38BDF8', fontSize: '0.75rem' }}
                  >
                    {showEditNewPlaceInput ? 'Choose existing place' : '+ Add new place'}
                  </button>
                </div>
                {showEditNewPlaceInput ? (
                  <input
                    type="text"
                    placeholder="Enter new destination name..."
                    value={newEditPlaceName}
                    onChange={(e) => setNewEditPlaceName(e.target.value)}
                    autoFocus
                  />
                ) : (
                  <select
                    value={editPlaceId}
                    onChange={(e) => setEditPlaceId(Number(e.target.value))}
                  >
                    <option value="">Select a place...</option>
                    {places.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="zcm-form-group">
                <label>Bus Fare Advanced (₹) *</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={editBusFare}
                  onChange={(e) => setEditBusFare(e.target.value)}
                />
              </div>
            </div>

            {/* Student Picker (1 to 3) */}
            <div className="zcm-form-group">
              <label>Participating Students (Select 1 to 3) *</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.5rem' }}>
                {editStudentIds.map((id) => {
                  const st = students.find((s) => s.id === id);
                  return (
                    <span key={id} className="zcm-badge zcm-badge--success" style={{ padding: '0.25rem 0.55rem' }}>
                      {st?.name || `Student #${id}`}
                      <X size={13} style={{ cursor: 'pointer', marginLeft: 4 }} onClick={() => toggleEditStudent(id)} />
                    </span>
                  );
                })}
              </div>

              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.35rem',
                  maxHeight: 120,
                  overflowY: 'auto',
                  padding: '0.5rem',
                  background: '#0B111E',
                  border: '1px solid #1E293B',
                  borderRadius: 6,
                }}
              >
                {students.map((st) => {
                  const isSelected = editStudentIds.includes(st.id);
                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => toggleEditStudent(st.id)}
                      className={`zcm-btn zcm-btn--sm ${isSelected ? 'zcm-btn--primary' : 'zcm-btn--secondary'}`}
                      style={{ fontSize: '0.75rem', padding: '0.2rem 0.45rem' }}
                    >
                      {st.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Date, Departure Time, Calendars Issued */}
            <div className="zcm-form-grid-3">
              <div className="zcm-form-group">
                <label>Trip Date *</label>
                <input
                  type="date"
                  value={editTripDate}
                  onChange={(e) => setEditTripDate(e.target.value)}
                />
              </div>
              <div className="zcm-form-group">
                <label>Departure Time</label>
                <input
                  type="time"
                  value={editDepartureTime}
                  onChange={(e) => setEditDepartureTime(e.target.value)}
                />
              </div>
              <div className="zcm-form-group">
                <label>Calendars Issued *</label>
                <input
                  type="number"
                  min="1"
                  value={editCalendarsIssued}
                  onChange={(e) => setEditCalendarsIssued(Number(e.target.value))}
                />
              </div>
            </div>

            {/* Multiple Receipt Books & Leaf Allocation */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#F8FAFC' }}>
                  Receipt Book(s) & Leaf Allocation
                </label>
                <button
                  type="button"
                  className="zcm-btn zcm-btn--secondary zcm-btn--sm"
                  onClick={addEditReceiptBookRow}
                  style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', color: '#38BDF8' }}
                >
                  + Add Another Book
                </button>
              </div>

              {editReceiptBooks.map((rb, idx) => (
                <div
                  key={idx}
                  style={{
                    background: '#0B111E',
                    border: '1px solid #1E293B',
                    borderRadius: 6,
                    padding: '0.75rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#38BDF8' }}>
                      Receipt Book #{idx + 1}
                    </span>
                    {editReceiptBooks.length > 1 && (
                      <button
                        type="button"
                        className="zcm-btn zcm-btn--danger zcm-btn--sm"
                        onClick={() => removeEditReceiptBookRow(idx)}
                        style={{ padding: '0.15rem 0.4rem', fontSize: '0.75rem' }}
                      >
                        <X size={13} style={{ marginRight: 2 }} /> Remove
                      </button>
                    )}
                  </div>

                  <div className="zcm-form-grid-2">
                    <div className="zcm-form-group" style={{ marginBottom: 0 }}>
                      <label style={{ fontSize: '0.75rem' }}>Receipt Book</label>
                      <select
                        value={rb.receipt_book}
                        onChange={(e) => handleEditReceiptBookChange(idx, e.target.value ? Number(e.target.value) : '')}
                      >
                        <option value="">Select Receipt Book...</option>
                        {books.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.label} (Leaves #{b.first_leaf}-#{b.last_leaf})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="zcm-form-group" style={{ marginBottom: 0 }}>
                      <label style={{ fontSize: '0.75rem' }}>Starting Leaf</label>
                      <input
                        type="number"
                        placeholder="e.g. 1"
                        value={rb.starting_leaf}
                        onChange={(e) => handleEditStartingLeafChange(idx, e.target.value ? Number(e.target.value) : '')}
                      />
                    </div>
                  </div>

                  {selectedTripToEdit.status === 'settled' && (
                    <div className="zcm-form-grid-2">
                      <div className="zcm-form-group" style={{ marginBottom: 0 }}>
                        <label style={{ fontSize: '0.75rem' }}>Ending Leaf</label>
                        <input
                          type="number"
                          placeholder="e.g. 50"
                          value={rb.ending_leaf ?? ''}
                          onChange={(e) => handleEditEndingLeafChange(idx, e.target.value ? Number(e.target.value) : '')}
                        />
                      </div>
                      <div className="zcm-form-group" style={{ marginBottom: 0 }}>
                        <label style={{ fontSize: '0.75rem' }}>Voided Leaves</label>
                        <input
                          type="text"
                          placeholder="e.g. 14, 28"
                          value={rb.voided_leaves || ''}
                          onChange={(e) => handleEditVoidedLeavesChange(idx, e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Notes if in_progress */}
            {selectedTripToEdit.status === 'in_progress' && (
              <div className="zcm-form-group" style={{ marginBottom: 0 }}>
                <label>Dispatch Notes (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Special instructions or notes for this trip..."
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                />
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
