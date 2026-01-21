
export interface User {
  id: string;
  email: string;
}

export interface Project {
  id: string;
  name: string;
  user_id: string;
  updated_at: string;
  status: 'draft' | 'saved';
  pdf_url?: string; // In a real app this would be a Storage path
  annotations: any[];
  current_page: number;
  total_pages: number;
}

export enum ToolType {
  SELECT = 'SELECT',
  PAN = 'PAN',
  PEN = 'PEN',
  LINE = 'LINE',
  ARROW = 'ARROW',
  RECTANGLE = 'RECTANGLE',
  ELLIPSE = 'ELLIPSE',
  TEXT = 'TEXT',
  MEASURE = 'MEASURE',
  ANGLE = 'ANGLE',
  ERASER = 'ERASER',
}

export interface ShapeConfig {
  id: string;
  type: ToolType;
  x: number;
  y: number;
  points?: number[]; // For Line, Arrow, Pen, Eraser
  width?: number; // For Rect, Ellipse
  height?: number;
  text?: string; // For Text
  fontSize?: number; // For Text
  fontFamily?: string; // For Text
  fontStyle?: string; // For Text (bold, italic, normal)
  stroke: string;
  fill: string;
  strokeWidth: number;
  opacity: number;
  rotation?: number;
  scaleX?: number;
  scaleY?: number;
  page: number; // PDF Page mapping
  visible: boolean;
  locked: boolean;
  unit?: 'mm' | 'cm' | 'in' | 'ft'; // For measurements
  dash?: number[]; // Line dash pattern
  globalCompositeOperation?: string; // For Eraser ('destination-out')
}

export interface PdfPageImage {
  pageNumber: number;
  dataUrl: string;
  width: number;
  height: number;
}

// Drawing Suggestion AI Types
export interface NKBARule {
  id: string;
  category: string;
  rule_code: string;
  title: string;
  description: string;
  min_value?: number;
  max_value?: number;
  unit?: string;
  severity: 'critical' | 'warning' | 'suggestion';
  pdf_reference?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface NKBAReferenceImage {
  id: string;
  rule_id: string;
  image_url: string;
  caption?: string;
  display_order: number;
  created_at: string;
}

export interface NKBADocument {
  id: string;
  title: string;
  description?: string;
  file_url: string;
  file_size?: number;
  version?: string;
  uploaded_by?: string;
  created_at: string;
  updated_at: string;
}

export interface DrawingAnalysis {
  id: string;
  user_id: string;
  project_name?: string;
  pdf_url: string;
  analysis_type: 'nkba_validation' | 'pricing';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
}

export interface DrawingSuggestion {
  id: string;
  analysis_id: string;
  rule_id?: string;
  rule?: NKBARule; // Joined data
  cabinet_code?: string;
  location_description?: string;
  issue_type: 'violation' | 'warning' | 'suggestion';
  severity: 'critical' | 'warning' | 'info';
  current_value?: number;
  required_value?: number;
  unit?: string;
  suggestion_text: string;
  ai_confidence?: number;
  page_number?: number;
  coordinates?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  created_at: string;
}

export interface AdminUser {
  id: string;
  user_id: string;
  role: 'admin' | 'super_admin';
  permissions: {
    manage_rules?: boolean;
    manage_documents?: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string; // matches auth.users(id)
  email: string;
  role: 'user' | 'admin';
  is_active: boolean;
  access_expiry?: string; // ISO timestamp
  created_at: string;
  updated_at: string;
}
