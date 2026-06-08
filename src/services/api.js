// Frontend API Service for Zainussunna Academy
// Handles all backend communication with proper error handling.
//
// Environment Configuration:
// - Local development (.env.local): Uses http://127.0.0.1:8000/api/core
// - Vercel/Production: Uses https://api.zainussunnaacademy.com/api/core
//
// The API_BASE is automatically set based on environment:
// 1. First checks REACT_APP_API_BASE environment variable
// 2. Falls back to production API if not set
//
// No manual switching needed!

// Get API base URL - uses env var if set, otherwise defaults to production
const API_BASE =
  process.env.REACT_APP_API_BASE ||
  "https://api.zainussunnaacademy.com/api/core";

// Debug logging in development
if (process.env.NODE_ENV === "development") {
  console.log(`🔗 API Base URL: ${API_BASE} (development mode)`);
}

// Endpoints that don't require authentication (public endpoints)
const PUBLIC_ENDPOINTS = [
  "/programs/",
  "/achievements/",
  "/gallery/",
  "/faculty/",
  "/content/",
  "/health/",
  "/enquiries/",
];

class ApiService {
  constructor() {
    this.baseUrl = API_BASE;
    this.token = localStorage.getItem("accessToken");
  }

  isPublicEndpoint(endpoint) {
    // Check if the endpoint starts with any public endpoint path
    return PUBLIC_ENDPOINTS.some((publicEndpoint) =>
      endpoint.startsWith(publicEndpoint),
    );
  }

  // Utility to format image URLs
  getImageUrl(path) {
    if (!path) return null;
    if (path.startsWith("http") || path.startsWith("data:")) return path;

    // Get the base domain (everything before /api/)
    // This handles both https://api.zainussunnaacademy.com/api/core 
    // and http://127.0.0.1:8000/api/core
    const baseDomain = this.baseUrl.split("/api/")[0];
    return `${baseDomain}${path.startsWith("/") ? "" : "/"}${path}`;
  }

  getHeaders(includeAuth = true) {
    const headers = {
      "Content-Type": "application/json",
    };
    // Only add auth token if includeAuth is true AND token exists AND endpoint is not public
    if (
      includeAuth &&
      this.token &&
      !this.isPublicEndpoint(this.requestEndpoint || "")
    ) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }
    return headers;
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem("accessToken", token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  }

  // Generic request handler
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    // Store the endpoint for isPublicEndpoint check
    this.requestEndpoint = endpoint;

    // Determine if we should include auth - default to true
    // But set to false for public endpoints automatically
    const includeAuth =
      options.auth !== false && !this.isPublicEndpoint(endpoint);

    // Check if body is FormData - if so, don't set Content-Type header
    // Let the browser set it with the proper boundary
    const isFormData = options.body instanceof FormData;

    const config = {
      ...options,
      headers: isFormData
        ? {
            // For FormData, let browser set Content-Type with boundary
            // Only add auth if needed
            ...(includeAuth && this.token
              ? { Authorization: `Bearer ${this.token}` }
              : {}),
          }
        : {
            ...this.getHeaders(includeAuth),
            ...options.headers,
          },
    };

    try {
      const response = await fetch(url, config);

      // Only handle 401 for authenticated endpoints (non-public endpoints)
      if (response.status === 401 && !this.isPublicEndpoint(endpoint)) {
        // Try to refresh token
        const refreshed = await this.refreshToken();
        if (refreshed) {
          // Retry request with new token
          config.headers["Authorization"] = `Bearer ${this.token}`;
          const retryResponse = await fetch(url, config);
          if (retryResponse.ok) {
            return retryResponse.json();
          }
        }
        this.clearToken();
        throw new Error("Session expired. Please login again.");
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(
          error.detail || error.message || `HTTP ${response.status}`,
        );
      }

      return response.json();
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // Authentication
  async login(username, password) {
    const data = await this.request("/auth/token/", {
      method: "POST",
      body: JSON.stringify({ username, password }),
      auth: false,
    });
    this.setToken(data.access);
    localStorage.setItem("refreshToken", data.refresh);
    return data;
  }

  async refreshToken() {
    const refresh = localStorage.getItem("refreshToken");
    if (!refresh) return false;

    try {
      const data = await this.request("/auth/token/refresh/", {
        method: "POST",
        body: JSON.stringify({ refresh }),
        auth: false,
      });
      this.setToken(data.access);
      return true;
    } catch {
      this.clearToken();
      return false;
    }
  }

  // Programs - Public endpoint
  async getPrograms() {
    return this.request("/programs/");
  }

  async getProgramSchema(programId) {
    return this.request(`/programs/${programId}/schema/`);
  }

  // Admissions - Public (no auth required for submission)
  async createAdmission(data) {
    // Check if step_data contains any file objects
    const hasFiles =
      data.step_data &&
      Object.values(data.step_data).some((value) => value instanceof File);

    if (hasFiles || data.student_photo instanceof File) {
      // Use FormData for file uploads
      const formData = new FormData();
      formData.append("program", data.program);
      formData.append("step", data.step || 1);
      formData.append("time_spent", data.time_spent || 0);

      // Add student_photo as separate field if present and is a File
      if (data.student_photo instanceof File) {
        formData.append("student_photo", data.student_photo);
      }

      // IMPORTANT: Send step_data as a single JSON string, not as nested keys
      // DRF doesn't parse step_data[name] format correctly
      if (data.step_data) {
        // Filter out any File objects from step_data (they should be handled separately)
        const stepDataWithoutFiles = {};
        for (const [key, value] of Object.entries(data.step_data)) {
          if (
            !(value instanceof File) &&
            value !== null &&
            value !== undefined
          ) {
            stepDataWithoutFiles[key] = value;
          }
        }
        formData.append("step_data", JSON.stringify(stepDataWithoutFiles));
      }

      return this.request("/admissions/", {
        method: "POST",
        body: formData,
        auth: false,
        // No headers needed - request method now handles FormData correctly
      });
    }

    // For JSON requests, remove null/undefined values to avoid serialization issues
    const cleanData = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== null && value !== undefined) {
        cleanData[key] = value;
      }
    }

    return this.request("/admissions/", {
      method: "POST",
      body: JSON.stringify(cleanData),
      auth: false, // Public: no auth required
    });
  }

  async getAdmissions(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return this.request(`/admissions/${params ? `?${params}` : ""}`, {
      auth: true,
    });
  }

  async getAdmission(id) {
    return this.request(`/admissions/${id}/`, {
      auth: true,
    });
  }

  async completeStep(id, stepData, timeSpent = 0) {
    // Check if stepData contains any file objects
    const hasFiles =
      stepData &&
      Object.values(stepData).some((value) => value instanceof File);

    // Check for achievements file (can be in different keys)
    const achievementsFile =
      stepData?.achievements_file ||
      stepData?.thahfeezAchievements ||
      stepData?.achievementsFile;

    if (hasFiles || achievementsFile instanceof File) {
      // Use FormData for file uploads
      const formData = new FormData();
      formData.append("time_spent", timeSpent || 0);

      // Add achievements_file as separate field if present
      if (achievementsFile instanceof File) {
        formData.append("achievements_file", achievementsFile);
      }

      // IMPORTANT: Send step_data as a single JSON string, not as nested keys
      // DRF doesn't parse step_data[name] format correctly
      if (stepData) {
        // Filter out any File objects from stepData (they should be handled separately)
        const stepDataWithoutFiles = {};
        for (const [key, value] of Object.entries(stepData)) {
          if (
            !(value instanceof File) &&
            value !== null &&
            value !== undefined
          ) {
            stepDataWithoutFiles[key] = value;
          }
        }
        formData.append("step_data", JSON.stringify(stepDataWithoutFiles));
      }

      return this.request(`/admissions/${id}/complete_step/`, {
        method: "POST",
        body: formData,
        auth: false,
        // No headers needed - request method now handles FormData correctly
      });
    }

    return this.request(`/admissions/${id}/complete_step/`, {
      method: "POST",
      body: JSON.stringify({ step_data: stepData, time_spent: timeSpent }),
      auth: false, // Public: no auth required for submission flow
    });
  }

  async submitAdmission(id) {
    return this.request(`/admissions/${id}/submit/`, {
      method: "POST",
      auth: false, // Public: no auth required for submission flow
    });
  }

  async getAdmissionStatus(id) {
    return this.request(`/admissions/${id}/status/`, {
      auth: false, // Public: no auth required for submission flow
    });
  }

  // Admin Actions - Requires auth
  async transitionState(id, newState, reason = "") {
    return this.request(`/admissions/${id}/transition/`, {
      method: "POST",
      body: JSON.stringify({ new_state: newState, reason }),
      auth: true,
    });
  }

  async addNote(id, note) {
    return this.request(`/admissions/${id}/add_note/`, {
      method: "POST",
      body: JSON.stringify(note),
      auth: true,
    });
  }

  // Content - Public endpoint
  async getContentPages() {
    return this.request("/content/");
  }

  async getContentPage(slug) {
    return this.request(`/content/${slug}/`);
  }

  // Achievements - Public endpoint
  async getAchievements(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return this.request(`/achievements/${params ? `?${params}` : ""}`);
  }

  // Gallery - Public endpoint
  async getGalleryItems() {
    return this.request("/gallery/");
  }

  async getLatestGallery() {
    return this.request("/gallery/latest/");
  }

  // Faculty - Public endpoint
  async getFaculty() {
    return this.request("/faculty/");
  }

  // Enquiries - Public endpoint (no auth needed for creating)
  async createEnquiry(data) {
    return this.request("/enquiries/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getEnquiries(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return this.request(`/enquiries/${params ? `?${params}` : ""}`, {
      auth: true,
    });
  }

  // Analytics - Requires auth
  async getAnalytics(days = 30) {
    return this.request(`/analytics/admissions/?days=${days}`, {
      auth: true,
    });
  }

  async getDashboard() {
    return this.request("/analytics/dashboard/", {
      auth: true,
    });
  }

  // WhatsApp Config - Public endpoint
  async getWhatsAppConfig() {
    return this.request("/whatsapp/config/");
  }

  async saveWhatsAppConfig(data) {
    return this.request("/whatsapp/config/", {
      method: "POST",
      body: JSON.stringify(data),
      auth: true,
    });
  }

  async generateWhatsAppMessage(admissionId, messageType = "success") {
    return this.request("/whatsapp/generate_message/", {
      method: "POST",
      body: JSON.stringify({
        admission_id: admissionId,
        message_type: messageType,
      }),
      auth: false, // Public: no auth required
    });
  }

  // Health Check - Public endpoint
  async healthCheck() {
    return this.request("/health/");
  }
}

export const api = new ApiService();
export default api;
