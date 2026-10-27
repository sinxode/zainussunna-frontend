import {
  User, AuthResponse, Campaign, Student, Place,
  ReceiptBook, Trip, InventorySummary, InventoryMovement,
  Expense, CommissionPayout, FinancialSummary, AuditLog,
  ExternalCollection
} from '../types';

const getApiBase = (): string => {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return (import.meta.env.VITE_API_URL || '') + '/api/v1';
    }
    if (host.endsWith('.vercel.app')) {
      return 'https://zainussunna-calendar-backend.vercel.app/api/v1';
    }
  }
  return (import.meta.env.VITE_API_URL || 'https://api-calendar.zainussunnaacademy.com') + '/api/v1';
};

class ApiService {
  private getAuthHeader(): Record<string, string> {
    const token = localStorage.getItem('zcm_access_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${getApiBase()}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...this.getAuthHeader(),
      ...options.headers,
    };

    let response = await fetch(url, { ...options, headers });

    // Handle token refresh on 401
    if (response.status === 401 && !endpoint.includes('/auth/')) {
      const refreshed = await this.refreshToken();
      if (refreshed) {
        const retryHeaders = {
          'Content-Type': 'application/json',
          ...this.getAuthHeader(),
          ...options.headers,
        };
        response = await fetch(url, { ...options, headers: retryHeaders });
      } else {
        localStorage.removeItem('zcm_access_token');
        localStorage.removeItem('zcm_refresh_token');
        localStorage.removeItem('zcm_user');
        window.location.href = '/login';
        throw new Error('Session expired. Please log in again.');
      }
    }

    if (!response.ok) {
      let errorMsg = 'An error occurred';
      try {
        const errJson = await response.json();
        if (errJson.error) {
          errorMsg = errJson.error;
        } else if (errJson.detail) {
          errorMsg = errJson.detail;
        } else {
          // Flatten field errors
          const errors = Object.entries(errJson)
            .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`)
            .join(' | ');
          if (errors) errorMsg = errors;
        }
      } catch {
        errorMsg = response.statusText || errorMsg;
      }
      throw new Error(errorMsg);
    }

    if (response.status === 204 || response.status === 205) {
      return null as unknown as T;
    }

    const text = await response.text();
    if (!text || !text.trim()) {
      return null as unknown as T;
    }

    try {
      return JSON.parse(text);
    } catch {
      return text as unknown as T;
    }
  }

  private async refreshToken(): Promise<boolean> {
    const refresh = localStorage.getItem('zcm_refresh_token');
    if (!refresh) return false;

    try {
      const res = await fetch(`${getApiBase()}/auth/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh }),
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('zcm_access_token', data.access);
        return true;
      }
    } catch {
      return false;
    }
    return false;
  }

  // --- Auth ---
  async login(phone_number: string, password: string): Promise<AuthResponse> {
    const data = await this.request<AuthResponse>('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ phone_number, password }),
    });
    localStorage.setItem('zcm_access_token', data.access);
    localStorage.setItem('zcm_refresh_token', data.refresh);
    localStorage.setItem('zcm_user', JSON.stringify(data.user));
    return data;
  }

  logout(): void {
    localStorage.removeItem('zcm_access_token');
    localStorage.removeItem('zcm_refresh_token');
    localStorage.removeItem('zcm_user');
  }

  async getMe(): Promise<User> {
    return this.request<User>('/auth/me/');
  }

  async changePassword(old_password: string, new_password: string): Promise<{ detail: string }> {
    return this.request<{ detail: string }>('/auth/change-password/', {
      method: 'POST',
      body: JSON.stringify({ old_password, new_password }),
    });
  }

  // --- Users ---
  async getUsers(): Promise<User[] | { results: User[] }> {
    return this.request<User[] | { results: User[] }>('/users/');
  }

  async createUser(data: any): Promise<User> {
    return this.request<User>('/users/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async resetPassword(userId: number, new_password: string): Promise<{ detail: string }> {
    return this.request<{ detail: string }>(`/users/${userId}/reset-password/`, {
      method: 'POST',
      body: JSON.stringify({ new_password }),
    });
  }

  async toggleUserActive(userId: number): Promise<{ detail: string }> {
    return this.request<{ detail: string }>(`/users/${userId}/toggle-active/`, {
      method: 'POST',
    });
  }

  // --- Campaigns ---
  async getCampaigns(): Promise<Campaign[] | { results: Campaign[] }> {
    return this.request<Campaign[] | { results: Campaign[] }>('/campaigns/');
  }

  async getCampaign(id: number): Promise<Campaign> {
    return this.request<Campaign>(`/campaigns/${id}/`);
  }

  async createCampaign(data: Partial<Campaign>): Promise<Campaign> {
    return this.request<Campaign>('/campaigns/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCampaign(id: number, data: Partial<Campaign>): Promise<Campaign> {
    return this.request<Campaign>(`/campaigns/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async closeCampaign(id: number): Promise<{ detail: string; campaign: Campaign }> {
    return this.request<{ detail: string; campaign: Campaign }>(`/campaigns/${id}/close/`, {
      method: 'POST',
    });
  }

  async activateCampaign(id: number): Promise<{ detail: string; campaign: Campaign }> {
    return this.request<{ detail: string; campaign: Campaign }>(`/campaigns/${id}/activate/`, {
      method: 'POST',
    });
  }

  async getCampaignSummary(id: number): Promise<{ financial: FinancialSummary; inventory: InventorySummary; campaign: Campaign }> {
    return this.request<{ financial: FinancialSummary; inventory: InventorySummary; campaign: Campaign }>(`/campaigns/${id}/summary/`);
  }

  // --- Students ---
  async getStudents(params: Record<string, string> = {}): Promise<Student[] | { results: Student[] }> {
    const qs = new URLSearchParams(params).toString();
    return this.request<Student[] | { results: Student[] }>(`/students/${qs ? `?${qs}` : ''}`);
  }

  async createStudent(name: string): Promise<Student> {
    return this.request<Student>('/students/', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  }

  async updateStudent(id: number, data: Partial<Student>): Promise<Student> {
    return this.request<Student>(`/students/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async getStudentSummary(id: number, campaignId?: number): Promise<any> {
    const qs = campaignId ? `?campaign_id=${campaignId}` : '';
    return this.request<any>(`/students/${id}/summary/${qs}`);
  }

  // --- Places ---
  async getPlaces(params: Record<string, string> = {}): Promise<Place[] | { results: Place[] }> {
    const qs = new URLSearchParams(params).toString();
    return this.request<Place[] | { results: Place[] }>(`/places/${qs ? `?${qs}` : ''}`);
  }

  async createPlace(name: string): Promise<Place> {
    return this.request<Place>('/places/', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  }

  // --- Receipt Books ---
  async getReceiptBooks(campaignId?: number): Promise<ReceiptBook[] | { results: ReceiptBook[] }> {
    const qs = campaignId ? `?campaign=${campaignId}` : '';
    return this.request<ReceiptBook[] | { results: ReceiptBook[] }>(`/receipt-books/${qs}`);
  }

  async createReceiptBook(data: Partial<ReceiptBook>): Promise<ReceiptBook> {
    return this.request<ReceiptBook>('/receipt-books/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getReceiptBookUsage(id: number): Promise<any> {
    return this.request<any>(`/receipt-books/${id}/usage/`);
  }

  // --- Trips ---
  async getTrips(params: Record<string, string | number> = {}): Promise<Trip[] | { results: Trip[] }> {
    const strParams = Object.entries(params).reduce((acc, [k, v]) => ({ ...acc, [k]: String(v) }), {});
    const qs = new URLSearchParams(strParams).toString();
    return this.request<Trip[] | { results: Trip[] }>(`/trips/${qs ? `?${qs}` : ''}`);
  }

  async getTrip(id: number): Promise<Trip> {
    return this.request<Trip>(`/trips/${id}/`);
  }

  async dispatchTrip(data: any): Promise<Trip> {
    return this.request<Trip>('/trips/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTrip(id: number, data: any): Promise<Trip> {
    return this.request<Trip>(`/trips/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async settleTrip(id: number, data: any): Promise<Trip> {
    return this.request<Trip>(`/trips/${id}/settle/`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async voidTrip(id: number, reason: string): Promise<Trip> {
    return this.request<Trip>(`/trips/${id}/void/`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async reviewTrip(id: number, review_status: string, notes: string): Promise<Trip> {
    return this.request<Trip>(`/trips/${id}/review/`, {
      method: 'POST',
      body: JSON.stringify({ review_status, notes }),
    });
  }

  async deleteTrip(id: number, reason?: string): Promise<{ success: boolean; message: string; trip_id: number }> {
    return this.request<{ success: boolean; message: string; trip_id: number }>(`/trips/${id}/`, {
      method: 'DELETE',
      body: reason ? JSON.stringify({ reason }) : undefined,
    });
  }

  // --- Inventory ---
  async getInventorySummary(campaignId?: number): Promise<InventorySummary> {
    const qs = campaignId ? `?campaign=${campaignId}` : '';
    return this.request<InventorySummary>(`/inventory/summary/${qs}`);
  }

  async getInventoryMovements(campaignId?: number): Promise<InventoryMovement[] | { results: InventoryMovement[] }> {
    const qs = campaignId ? `?campaign=${campaignId}` : '';
    return this.request<InventoryMovement[] | { results: InventoryMovement[] }>(`/inventory/movements/${qs}`);
  }

  async createInventoryAdjustment(campaignId: number, quantity: number, reason: string): Promise<any> {
    return this.request<any>('/inventory/adjustments/', {
      method: 'POST',
      body: JSON.stringify({ campaign: campaignId, quantity, reason }),
    });
  }

  // --- Expenses ---
  async getExpenses(params: Record<string, string | number> = {}): Promise<Expense[] | { results: Expense[] }> {
    const strParams = Object.entries(params).reduce((acc, [k, v]) => ({ ...acc, [k]: String(v) }), {});
    const qs = new URLSearchParams(strParams).toString();
    return this.request<Expense[] | { results: Expense[] }>(`/expenses/${qs ? `?${qs}` : ''}`);
  }

  async createExpense(data: Partial<Expense>): Promise<Expense> {
    return this.request<Expense>('/expenses/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async voidExpense(id: number, reason: string): Promise<Expense> {
    return this.request<Expense>(`/expenses/${id}/void/`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  // --- Commission ---
  async getCommissionSummary(campaignId?: number): Promise<any> {
    const qs = campaignId ? `?campaign=${campaignId}` : '';
    return this.request<any>(`/commission/summary/${qs}`);
  }

  async finalizeCommission(campaignId: number): Promise<{ detail: string }> {
    return this.request<{ detail: string }>('/commission/finalize/', {
      method: 'POST',
      body: JSON.stringify({ campaign_id: campaignId }),
    });
  }

  async getCommissionPayouts(campaignId?: number): Promise<CommissionPayout[] | { results: CommissionPayout[] }> {
    const qs = campaignId ? `?campaign=${campaignId}` : '';
    return this.request<CommissionPayout[] | { results: CommissionPayout[] }>(`/commission/payouts/${qs}`);
  }

  async createCommissionPayout(data: any): Promise<CommissionPayout> {
    return this.request<CommissionPayout>('/commission/payouts/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // --- Reports ---
  async getReportSummary(campaignId?: number): Promise<any> {
    const qs = campaignId ? `?campaign=${campaignId}` : '';
    return this.request<any>(`/reports/summary/${qs}`);
  }

  getExportUrl(campaignId: number, format: 'excel' | 'csv' | 'pdf', type: string = 'full'): string {
    return `${getApiBase()}/reports/export/?campaign=${campaignId}&format=${format}&type=${type}`;
  }

  // --- External Collections ---
  async getExternalCollections(params: Record<string, string | number> = {}): Promise<ExternalCollection[] | { results: ExternalCollection[] }> {
    const strParams = Object.entries(params).reduce((acc, [k, v]) => ({ ...acc, [k]: String(v) }), {});
    const qs = new URLSearchParams(strParams).toString();
    return this.request<ExternalCollection[] | { results: ExternalCollection[] }>(`/external-collections/${qs ? `?${qs}` : ''}`);
  }

  async createExternalCollection(data: {
    campaign: number;
    received_from: string;
    amount: string | number;
    calendars_given?: number;
    date_received: string;
    notes?: string;
  }): Promise<ExternalCollection> {
    return this.request<ExternalCollection>('/external-collections/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateExternalCollection(id: number, data: Partial<{
    received_from: string;
    amount: string | number;
    calendars_given?: number;
    date_received: string;
    notes?: string;
  }>): Promise<ExternalCollection> {
    return this.request<ExternalCollection>(`/external-collections/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteExternalCollection(id: number): Promise<void> {
    return this.request<void>(`/external-collections/${id}/`, {
      method: 'DELETE',
    });
  }

  // --- Audit Logs ---
  async getAuditLogs(params: Record<string, string> = {}): Promise<AuditLog[] | { results: AuditLog[] }> {
    const qs = new URLSearchParams(params).toString();
    return this.request<AuditLog[] | { results: AuditLog[] }>(`/audit-logs/${qs ? `?${qs}` : ''}`);
  }
}

export const api = new ApiService();
