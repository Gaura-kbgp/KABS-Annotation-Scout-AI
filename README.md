# KABS Annotation & Pricing AI

A professional interior design SaaS application for PDF annotation, measurement, and pricing estimation.

## 🚀 Project Overview

KABS allows users to:
1.  **Manage Projects:** Create, organize, and delete design projects.
2.  **Upload Plans:** Upload PDF floor plans via Supabase Storage.
3.  **Annotate:** Use a full suite of vector tools (Konva.js) to draw, measure, and mark up plans.
4.  **Export:** Flatten annotations into a high-quality PDF for clients.
5.  **Collaborate:** (Future Roadmap) Real-time pricing estimation.

## 🛠 Tech Stack

*   **Core Framework:** React 18, TypeScript, Vite
*   **Styling & UI:** Tailwind CSS, Framer Motion, Lucide React, Radix UI (Slot), Class Variance Authority (CVA), clsx, tailwind-merge
*   **Graphics & Visualization:** Konva, React-Konva, use-image
*   **AI Integration:** Google Generative AI (Gemini Flash 2.5)
*   **Backend & Database:** Supabase (Auth, Storage, Database)
*   **Routing:** React Router DOM
*   **PDF Generation:** jsPDF
*   **Utilities:** dotenv

## 📦 Packages & Dependencies

### Core Dependencies
| Package | Version | Description |
| :--- | :--- | :--- |
| **react / react-dom** | `^18.2.0` | Core UI library. |
| **react-router-dom** | `^6.20.0` | Client-side routing. |
| **@supabase/supabase-js** | `^2.39.0` | Supabase client for Auth & DB. |
| **konva / react-konva** | `^9.3.3` / `^18.2.10` | 2D Canvas graphics library. |
| **@google/generative-ai** | `^0.24.1` | Google Gemini AI SDK. |
| **framer-motion** | `^10.16.0` | Animation library. |
| **jspdf** | `^4.0.0` | PDF generation library. |

### Complete List
**Production:**
`@google/generative-ai`, `@motionone/utils`, `@radix-ui/react-slot`, `@supabase/supabase-js`, `class-variance-authority`, `clsx`, `framer-motion`, `jspdf`, `konva`, `lucide-react`, `react`, `react-dom`, `react-konva`, `react-router-dom`, `tailwind-merge`, `use-image`

**Development:**
`vite`, `typescript`, `tailwindcss`, `postcss`, `autoprefixer`, `dotenv`, `@vitejs/plugin-react`

## � Languages & Technologies

*   **TypeScript** (`.ts`, `.tsx`): Primary language for logic and UI (98% of codebase).
*   **CSS / Tailwind**: Styling via utility classes and `globals.css`.
*   **HTML5**: Semantic markup within React components.
*   **SQL**: Database schema and RLS policies (Supabase).

## �📂 Project Structure & Key Components

### 🗂 Root Directory Structure
```
/
├── components/          # React UI Components (Source of truth)
├── services/            # API & Backend Integration
├── lib/                 # Shared utilities
├── App.tsx              # Main Router Configuration
├── globals.css          # Global Styles & Tailwind Directives
└── types.ts             # Global TS Interfaces
```

### 🧩 Component Breakdown

#### **1. Core Editor (`/components/Editor/`)**
The heart of the application where users interact with plans.
*   **`EditorPage.tsx`**: Main controller. Manages state, undo/redo history, and layout.
*   **`Canvas.tsx`**: The visualization layer. Renders the PDF background and Konva vector layers (shapes, measurements).
*   **`EditorToolbar.tsx`**: Floating toolbar containing tools (Select, Rectangle, Text, Measure).
*   **`PropertiesPanel.tsx`**: Context-aware sidebar to edit properties of selected shapes (Color, Stroke, Text Size).

#### **2. AI Integration (`/components/DrawingAI/`)**
*   **`DrawingSuggestionAI.tsx`**: Main interface for the "Scout AI" feature.
*   **`SuggestionsList.tsx`**: Renders AI-generated insights or detected codes.
*   **`PDFViewer.tsx`**: Specialized viewer for AI context.

#### **3. Admin & Management**
*   **`AdminDashboard.tsx`**: Backend management for Manufacturers, Pricing Files, and NKBA Rules.
*   **`AdminLogin.tsx`**: Dedicated secure login for administrators.
*   **`ProjectList.tsx`**: The user's dashboard view, listing all their active projects.

#### **4. Public & Pages**
*   **`LandingPage.tsx`**: High-conversion landing page with Framer Motion animations.
*   **`Auth.tsx`**: Handles User Signup, Login, and Password Reset.
*   **`PricingPage.tsx` / `PaymentPage.tsx`**: Manages subscription tiers and payments.

### 🔌 Services (`/services`)
*   **`supabase.ts`**: Configures the Supabase client.
*   **`projectService.ts`**: Handles all database interactions (CRUD for projects) and Storage (uploading PDFs).
*   **`pdfService.ts`**: Utilities for rendering pages to images and exporting simplified PDFs.
*   **`drawingAI.ts`**: Service layer communicating with Google Gemini API.

## 👩‍💻 Developer Guide

### Setup
This project uses ES Modules via CDN (`esm.sh`) in `index.html`. This means there is **no complex build step** required for local development if you have a simple static file server.

1.  **Clone the repo.**
2.  **Supabase Setup:**
    *   Ensure the `projects` table is created (SQL in `services/supabase.ts`).
    *   Ensure the `project-files` storage bucket exists and is public.
    *   Apply RLS (Row Level Security) policies for `SELECT`, `INSERT`, `UPDATE`, `DELETE`.
3.  **Run Locally:**
    *   You can use any static server, e.g., `npx serve` or VS Code Live Server.
    *   *Note on Environment:* The app runs directly in the browser.

### Key Architectural Decisions

1.  **Canvas Rendering (Konva):**
    *   We do *not* draw directly on the PDF.
    *   The PDF is rendered to a standard HTML `<canvas>` or `<img>` which sits on the bottom Layer of the Konva Stage.
    *   Annotations are vector objects on the top Layer.
    *   This ensures performance and allows editing annotations without re-rendering the PDF.

2.  **Coordinate System:**
    *   The Canvas wraps the PDF. We scale the Stage (`stageScale`) to fit the screen, but internal coordinates (shape `x`, `y`) remain relative to the unscaled PDF dimensions.
    *   When exporting, we create a temporary "headless" stage at high resolution (Scale 2x or 3x) to ensure crisp text.

3.  **State Management:**
    *   `EditorPage.tsx` acts as the Controller. It holds the `shapes` state and the Undo/Redo history.
    *   `Canvas.tsx` is the View. It handles mouse events and rendering.
    *   `PropertiesPanel.tsx` modifies the state of the selected shape.

### Database Schema (Supabase)

**Table: `projects`**
*   `id`: UUID (Primary Key)
*   `user_id`: UUID (Foreign Key to auth.users)
*   `annotations`: JSONB (Stores the array of Konva shape objects)
*   `pdf_url`: Text (Public URL to the PDF file)
*   `status`: 'draft' | 'saved'

## 🔒 Security

*   **RLS (Row Level Security):** is enabled on Supabase. Users can only access/edit projects where `user_id` matches their Auth ID.
*   **Storage Access:** Files are stored in a public bucket, but file paths are obfuscated with user IDs. For higher security, switch to signed URLs in `projectService.ts`.

## 🚢 Deployment & Migration

*   **Deployment:** See `DEPLOYMENT.md` for instructions on deploying the frontend to Render or AWS.
*   **AWS Migration:** See `AWS_MIGRATION.md` for a guide on moving the backend infrastructure to self-hosted AWS EC2.
