/**
 * Document Upload & Extraction Service
 * Handles API calls for Phase 2: Multi-Modal Document Upload
 */

import { buildApiUrl } from '../utils/api';

// ============================================================
// TypeScript Interfaces
// ============================================================

export interface DocumentExtractionField {
  id: string;
  field_name: string;
  field_value: string;
  field_type: 'date' | 'number' | 'text' | 'currency' | 'quantity';
  confidence: number;
  bounding_box?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  page_number?: number;
  user_corrected: boolean;
  original_value?: string;
  corrected_at?: string;
  created_at: string;
}

export interface UploadedDocument {
  id: string;
  company: string;
  uploaded_by: string;
  uploaded_by_email: string;
  conversation_session?: string;
  file: string;
  file_url?: string;
  file_name: string;
  file_size: number;
  file_size_display: string;
  mime_type: string;
  document_type: 'utility_bill' | 'fuel_receipt' | 'travel_receipt' | 'invoice' | 'meter_photo' | 'other';
  extraction_status: 'pending' | 'processing' | 'completed' | 'failed';
  extracted_data?: Record<string, any>;
  confidence_score?: number;
  processing_time_ms?: number;
  gemini_model_used?: string;
  extraction_error?: string;
  user_validated: boolean;
  validated_by?: string;
  validated_by_email?: string;
  validated_at?: string;
  user_corrections?: {
    corrections: Record<string, any>;
    notes: string;
    corrected_at: string;
  };
  applied_to_footprint: boolean;
  footprint?: string;
  conversation_message?: string;
  created_at: string;
  updated_at: string;
  expires_at: string;
  extracted_fields: DocumentExtractionField[];
}

export interface UploadDocumentRequest {
  file: File;
  document_type: 'utility_bill' | 'fuel_receipt' | 'travel_receipt' | 'invoice' | 'meter_photo' | 'other';
  conversation_session_id?: string;
  footprint_id?: string;
}

export interface UploadDocumentResponse {
  document_id: string;
  file_name: string;
  file_size: number;
  file_size_display: string;
  mime_type: string;
  document_type: string;
  extraction_status: string;
  created_at: string;
  message: string;
}

export interface ValidateDocumentRequest {
  approve: boolean;
  corrections?: Record<string, any>;
  notes?: string;
}

export interface ValidateDocumentResponse {
  success: boolean;
  message: string;
  approved: boolean;
  corrections_applied: number;
  document: UploadedDocument;
}

export interface ApplyDocumentRequest {
  footprint_id?: string;
  create_conversation_message?: boolean;
}

export interface ApplyDocumentResponse {
  success: boolean;
  message: string;
  footprint_id: string;
  emissions_added: number;
  scope_updated: 'scope1' | 'scope2' | 'scope3';
  change_summary: {
    scope1: { before: number; after: number; change: number };
    scope2: { before: number; after: number; change: number };
    scope3: { before: number; after: number; change: number };
    total: { before: number; after: number; change: number };
  };
}

// ============================================================
// Document Service Class
// ============================================================

class DocumentService {
  /**
   * Get authentication headers with JWT token
   */
  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('No authentication token found. Please login.');
    }
    return {
      'Authorization': `Bearer ${token}`,
    };
  }

  /**
   * Upload document for AI extraction
   */
  async uploadDocument(request: UploadDocumentRequest): Promise<UploadDocumentResponse> {
    const formData = new FormData();
    formData.append('file', request.file);
    formData.append('document_type', request.document_type);
    
    if (request.conversation_session_id) {
      formData.append('conversation_session_id', request.conversation_session_id);
    }
    
    if (request.footprint_id) {
      formData.append('footprint_id', request.footprint_id);
    }

    const response = await fetch(buildApiUrl('/api/v1/carbon/ai/upload-document/'), {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(error.error || `Upload failed with status ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get document details with extraction results
   */
  async getDocument(documentId: string): Promise<UploadedDocument> {
    const response = await fetch(buildApiUrl(`/api/v1/carbon/ai/documents/${documentId}/`), {
      method: 'GET',
      headers: {
        ...this.getAuthHeaders(),
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to fetch document' }));
      throw new Error(error.error || `Failed to fetch document with status ${response.status}`);
    }

    return response.json();
  }

  /**
   * Validate or correct extracted document data
   */
  async validateDocument(
    documentId: string,
    request: ValidateDocumentRequest
  ): Promise<ValidateDocumentResponse> {
    const response = await fetch(buildApiUrl(`/api/v1/carbon/ai/documents/${documentId}/validate/`), {
      method: 'POST',
      headers: {
        ...this.getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Validation failed' }));
      throw new Error(error.error || `Validation failed with status ${response.status}`);
    }

    return response.json();
  }

  /**
   * Apply validated document data to carbon footprint
   */
  async applyDocumentToFootprint(
    documentId: string,
    request: ApplyDocumentRequest = {}
  ): Promise<ApplyDocumentResponse> {
    const response = await fetch(buildApiUrl(`/api/v1/carbon/ai/documents/${documentId}/apply/`), {
      method: 'POST',
      headers: {
        ...this.getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to apply document' }));
      throw new Error(error.error || `Failed to apply document with status ${response.status}`);
    }

    return response.json();
  }

  /**
   * Validate file before upload
   */
  validateFile(file: File): { valid: boolean; error?: string } {
    // Check file type
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `Unsupported file type: ${file.type}. Please upload PDF, JPG, or PNG files.`
      };
    }

    // Check file size (4MB limit)
    const maxSize = 4 * 1024 * 1024; // 4MB in bytes
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File too large: ${(file.size / (1024 * 1024)).toFixed(2)} MB. Maximum size is 4 MB.`
      };
    }

    return { valid: true };
  }

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes < 1024) {
      return `${bytes} B`;
    } else if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    } else {
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }
  }

  /**
   * Get confidence color for UI
   */
  getConfidenceColor(confidence: number): string {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 75) return 'text-yellow-600';
    return 'text-red-600';
  }

  /**
   * Get confidence label for UI
   */
  getConfidenceLabel(confidence: number): string {
    if (confidence >= 90) return 'High';
    if (confidence >= 75) return 'Medium';
    return 'Low';
  }
}

// Export singleton instance
export const documentService = new DocumentService();
export default documentService;
