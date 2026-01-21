# 🎨 Drawing Suggestion AI

An intelligent NKBA (National Kitchen & Bath Association) standards validation system powered by Google Gemini AI.

![Architecture Diagram](../drawing_ai_architecture_1768134481081.png)

## ✨ Features

### 🔍 **NKBA Standards Validation**
- Automatically validates kitchen floor plans against NKBA guidelines
- Identifies violations in:
  - Work triangle dimensions
  - Clearances and walkways  
  - Landing spaces near appliances
  - Counter heights and depths
  - Cabinet spacing
  - Door swing clearances

### 📍 **Cabinet-Specific Locations**
- Pinpoints issues to specific cabinet codes (e.g., "W3030", "B24")
- Provides clear location descriptions
- Shows current vs. required measurements

### 🎯 **Severity Levels**
- **Critical**: Must be fixed for code compliance
- **Warning**: Should be addressed for best practices
- **Info**: Suggestions for optimization

### 👨‍💼 **Admin Panel**
KABS administrators can:
- Add, edit, and delete NKBA rules
- Upload reference PDF documents
- Manage reference images
- Control rule severity and categories

### 📊 **Comprehensive Reports**
- Download analysis results
- Summary statistics (Critical/Warning/Info counts)
- Detailed findings with measurements
- Rule references and descriptions

## 🚀 Quick Start

### 1. **Database Setup**
Run the migration script in Supabase SQL Editor:
```sql
-- Execute: migration-scripts/drawing-ai-schema.sql
```

### 2. **Storage Buckets**
Create two storage buckets in Supabase:
- `drawings` - For uploaded floor plans (50MB, PDF only)
- `documents` - For NKBA references (100MB, PDF + images)

Or run:
```sql
-- Execute: migration-scripts/storage-buckets-setup.sql
```

### 3. **Admin Access**
Make yourself an admin:
```sql
INSERT INTO admin_users (user_id, role, permissions)
SELECT 
  id, 'super_admin',
  '{"manage_rules": true, "manage_documents": true}'::jsonb
FROM auth.users
WHERE email = 'your.email@example.com';
```

### 4. **Environment Variables**
Ensure `.env.local` contains:
```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

## 📖 How to Use

### For Users

1. **Navigate** to Dashboard → "Drawing Suggestion AI"
2. **Upload** a kitchen floor plan PDF
3. **Choose** "Drawing Mistakes" for NKBA validation
4. **Review** suggestions in the side panel
5. **Download** report if needed

### For Admins

1. **Click** "Admin Panel" button (visible only to admins)
2. **Manage** NKBA rules:
   - Add new rules with codes and descriptions
   - Set min/max values and units
   - Assign severity levels
3. **Upload** reference documents and images

## 🏗️ Architecture

### Components

```
components/
├── DrawingSuggestionAI.tsx      # Main component
└── DrawingAI/
    ├── AdminPanel.tsx           # Admin interface
    ├── SuggestionsList.tsx      # Suggestions display
    └── PDFViewer.tsx            # PDF viewer with controls
```

### Services

```
services/
└── drawingAI.ts                 # AI analysis logic
```

### Database

```
Tables:
├── nkba_rules                   # NKBA standards
├── nkba_reference_images        # Reference images
├── nkba_documents               # PDF library
├── drawing_analysis             # Analysis sessions
├── drawing_suggestions          # AI suggestions
└── admin_users                  # Admin access control
```

## 🔄 Data Flow

1. **Upload** → PDF stored in Supabase Storage
2. **Create** → Analysis record in database
3. **Convert** → PDF to base64
4. **Analyze** → Google Gemini processes with NKBA rules
5. **Generate** → Suggestions with cabinet locations
6. **Store** → Suggestions saved to database
7. **Display** → Results shown in UI

## 📋 Default NKBA Rules

| Code | Title | Min Value | Severity |
|------|-------|-----------|----------|
| NKBA-31 | Work Aisle Width | 42" | Warning |
| NKBA-32 | Walkway Width | 36" | Warning |
| NKBA-41 | Work Triangle Distance | - | Suggestion |
| NKBA-42 | Work Triangle Minimum | 4 ft | Warning |
| NKBA-21 | Refrigerator Landing Space | 15" | Warning |
| NKBA-22 | Cooktop Landing Space | 12" | Critical |
| NKBA-23 | Sink Landing Space | 18" | Warning |

## 🛠️ Troubleshooting

### Admin Panel Not Visible
- Verify your email in `admin_users` table
- Log out and log back in
- Check browser console for errors

### File Upload Fails
- Confirm storage buckets exist
- Check storage policies are created
- Verify bucket permissions

### AI Analysis Fails
- Validate `VITE_GEMINI_API_KEY` is set
- Check API key is active and valid
- Verify NKBA rules exist in database
- Check browser console for API errors

### No Suggestions Generated
- Ensure PDF is a valid kitchen floor plan
- Check that NKBA rules are loaded
- Verify AI has access to analyze PDFs
- Try a different PDF file

## 🔐 Security

- **Row Level Security (RLS)** enabled on all tables
- **Storage policies** restrict access by user
- **Admin-only** access to rule management
- **User-specific** analysis records

## 🎯 Future Enhancements

- [ ] Pricing analysis mode
- [ ] Visual annotations on PDF
- [ ] Batch processing
- [ ] PDF report generation (formatted)
- [ ] Rule templates by region
- [ ] Team collaboration
- [ ] Version comparison
- [ ] Mobile app support

## 📝 Notes

- Uses **Google Gemini 1.5 Flash** for AI analysis
- PDF viewing via iframe (some limitations)
- Coordinates for highlighting are AI-generated
- Analysis typically takes 10-30 seconds
- Supports single-page and multi-page PDFs

## 🤝 Support

For issues or questions:
1. Check browser console
2. Verify Supabase connection
3. Ensure API keys are valid
4. Review setup documentation

---

**Built with** ❤️ **using React, TypeScript, Supabase, and Google Gemini AI**
