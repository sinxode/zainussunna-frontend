export type UserRole = 'super_admin' | 'admin';

export interface User {
  id: number;
  phone_number: string;
  display_name: string;
  role: UserRole;
  is_active: boolean;
  must_change_password: boolean;
  created_at: string;
  last_login: string | null;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}

export type CampaignStatus = 'active' | 'closed';

export interface Campaign {
  id: number;
  name: string;
  year: number;
  printed_quantity: number;
  cost_price_per_calendar: string;
  min_expected_collection_per_calendar: string;
  commission_percentage: string;
  status: CampaignStatus;
  created_by: number | null;
  created_at: string;
  closed_at: string | null;
  proposed_printing_expense: string;
}

export interface Student {
  id: number;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Place {
  id: number;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type ReceiptBookStatus = 'active' | 'completed' | 'archived';

export interface ReceiptBook {
  id: number;
  campaign: number;
  label: string;
  first_leaf: number;
  last_leaf: number;
  status: ReceiptBookStatus;
  notes: string;
  created_at: string;
  total_leaves: number;
  next_suggested_leaf: number;
  used_leaves_count: number;
  remaining_leaves_count: number;
}

export type TripStatus = 'in_progress' | 'settled' | 'voided';
export type ReviewStatus = 'no_review_needed' | 'needs_review' | 'reviewed_and_accepted';

export interface TripStudent {
  id: number;
  student: number;
  student_name: string;
  gross_collection_share: string;
  bus_fare_share: string;
  food_expense_share: string;
  net_collection_share: string;
}

export interface Trip {
  id: number;
  campaign: number;
  place: number;
  place_name: string;
  trip_date: string;
  departure_time: string | null;
  return_time: string | null;
  status: TripStatus;
  review_status: ReviewStatus;
  calendars_issued: number;
  calendars_sold: number;
  calendars_returned: number;
  bus_fare: string;
  food_expense: string;
  cash_collection: string;
  gpay_collection: string;
  total_collection: string;
  expected_minimum_collection: string;
  stock_discrepancy: number;
  collection_shortfall: string;
  receipt_book: number | null;
  receipt_book_label: string | null;
  receipt_starting_leaf: number | null;
  receipt_ending_leaf: number | null;
  voided_leaves: string;
  discrepancy_notes: string;
  created_by: number | null;
  created_by_name: string | null;
  settled_by: number | null;
  settled_by_name: string | null;
  created_at: string;
  settled_at: string | null;
  trip_students: TripStudent[];
}

export interface InventorySummary {
  printed_quantity: number;
  calendars_sold: number;
  calendars_in_field: number;
  calendars_returned: number;
  calendars_external?: number;
  adjustments: number;
  available_stock: number;
}

export interface InventoryMovement {
  id: number;
  campaign: number;
  movement_type: string;
  quantity: number;
  related_trip: number | null;
  place_name?: string;
  reason: string;
  created_by: number | null;
  created_by_name?: string;
  created_at: string;
}

export type ExpenseCategory =
  | 'printing'
  | 'bus_fare'
  | 'food'
  | 'packaging'
  | 'transport'
  | 'distribution_materials'
  | 'other';

export interface Expense {
  id: number;
  campaign: number;
  category: ExpenseCategory;
  amount: string;
  date: string;
  description: string;
  notes: string;
  related_trip: number | null;
  is_voided: boolean;
  voided_reason: string;
  created_by: number | null;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
}

export interface CommissionCalculation {
  id: number;
  campaign: number;
  student: number;
  student_name: string;
  gross_collection: string;
  fare_share: string;
  food_share: string;
  net_collection: string;
  rate: string;
  calculated_commission: string;
  finalization_status: 'provisional' | 'finalized';
  calculation_timestamp: string;
  total_paid: string;
  remaining_payable: string;
}

export interface CommissionPayout {
  id: number;
  campaign: number;
  student: number;
  student_name: string;
  amount: string;
  payment_date: string;
  payment_method: 'cash' | 'gpay' | 'bank_transfer' | 'other';
  reference: string;
  notes: string;
  created_by: number | null;
  created_by_name?: string;
  created_at: string;
}

export interface ExternalCollection {
  id: number;
  campaign: number;
  campaign_year?: number;
  received_from: string;
  amount: string;
  calendars_given: number;
  date_received: string;
  notes: string;
  created_by: number | null;
  created_by_name?: string;
  updated_by: number | null;
  updated_by_name?: string;
  created_at: string;
  updated_at: string;
}

export interface FinancialSummary {
  campaign_id: number;
  campaign_year: number;
  campaign_status: CampaignStatus;
  student_collections?: string;
  external_collections?: string;
  total_received?: string;
  total_collections: string;
  cash_collections: string;
  gpay_collections: string;
  total_trip_expenses: string;
  bus_fare: string;
  food_expense: string;
  general_expenses: string;
  printing_expense: string;
  total_commission_earned: string;
  total_commission_paid: string;
  outstanding_commission: string;
  net_profit: string;
  is_provisional: boolean;
  break_even_target: string;
  break_even_recovered: string;
  break_even_percentage: number;
  open_trips_count: number;
  settled_trips_count: number;
  review_trips_count: number;
}

export interface AuditLog {
  id: number;
  user: number | null;
  user_name: string | null;
  action: string;
  entity_type: string;
  entity_id: string;
  before_snapshot: any;
  after_snapshot: any;
  reason: string;
  timestamp: string;
}
