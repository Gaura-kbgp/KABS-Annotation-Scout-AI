import { GoogleGenerativeAI } from '@google/generative-ai';
import { DrawingSuggestion, NKBARule } from '../types';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

export interface AnalysisResult {
    suggestions: Omit<DrawingSuggestion, 'id' | 'analysis_id' | 'created_at'>[];
    summary: string;
    totalIssues: number;
    criticalCount: number;
    warningCount: number;
    infoCount: number;
}

/**
 * Analyze a kitchen drawing PDF against NKBA rules
 */
export async function analyzeDrawingWithNKBA(
    pdfBase64: string,
    nkbaRules: NKBARule[]
): Promise<AnalysisResult> {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        // Create a comprehensive prompt with NKBA rules
        const rulesContext = nkbaRules.map(rule =>
            `${rule.rule_code}: ${rule.title}\n` +
            `Description: ${rule.description}\n` +
            `${rule.min_value ? `Minimum: ${rule.min_value} ${rule.unit || ''}` : ''}\n` +
            `${rule.max_value ? `Maximum: ${rule.max_value} ${rule.unit || ''}` : ''}\n` +
            `Severity: ${rule.severity}\n`
        ).join('\n---\n');

        const prompt = `You are an expert kitchen designer and NKBA (National Kitchen & Bath Association) standards validator.

Analyze this kitchen floor plan/drawing and identify any violations or issues according to NKBA guidelines.

NKBA RULES TO CHECK:
${rulesContext}

For each issue found, provide:
1. The specific NKBA rule code that applies (from the list above)
2. The cabinet code or location where the issue exists (e.g., "W3030", "Base Cabinet B21", "Sink Area")
3. A clear description of the location
4. The issue type (violation, warning, or suggestion)
5. Current measurement if applicable
6. Required measurement if applicable
7. A clear, actionable suggestion for fixing the issue
8. Your confidence level (0.0 to 1.0)
9. Approximate page number if multi-page

Return your analysis as a JSON object with this structure:
{
  "summary": "Brief overall assessment of the drawing",
  "suggestions": [
    {
      "rule_code": "NKBA-31",
      "cabinet_code": "W3030",
      "location_description": "Between island and wall cabinets",
      "issue_type": "violation",
      "severity": "critical",
      "current_value": 36,
      "required_value": 42,
      "unit": "inches",
      "suggestion_text": "Increase work aisle width to at least 42 inches for proper clearance",
      "ai_confidence": 0.95,
      "page_number": 1
    }
  ]
}

Focus on:
- Work triangle dimensions
- Clearances and walkways
- Landing spaces near appliances
- Counter heights and depths
- Cabinet spacing
- Door swing clearances
- Accessibility requirements

Be thorough but only report actual issues you can identify from the drawing.`;

        const result = await model.generateContent([
            {
                inlineData: {
                    mimeType: 'application/pdf',
                    data: pdfBase64,
                },
            },
            { text: prompt },
        ]);

        const response = await result.response;
        const text = response.text();

        // Parse the JSON response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Failed to parse AI response');
        }

        const analysisData = JSON.parse(jsonMatch[0]);

        // Map rule codes to rule IDs and enrich suggestions
        const suggestions = analysisData.suggestions.map((suggestion: any) => {
            const rule = nkbaRules.find(r => r.rule_code === suggestion.rule_code);
            return {
                rule_id: rule?.id,
                cabinet_code: suggestion.cabinet_code,
                location_description: suggestion.location_description,
                issue_type: suggestion.issue_type || 'warning',
                severity: suggestion.severity || 'warning',
                current_value: suggestion.current_value,
                required_value: suggestion.required_value,
                unit: suggestion.unit,
                suggestion_text: suggestion.suggestion_text,
                ai_confidence: suggestion.ai_confidence || 0.8,
                page_number: suggestion.page_number || 1,
                coordinates: suggestion.coordinates,
            };
        });

        const criticalCount = suggestions.filter((s: any) => s.severity === 'critical').length;
        const warningCount = suggestions.filter((s: any) => s.severity === 'warning').length;
        const infoCount = suggestions.filter((s: any) => s.severity === 'info').length;

        return {
            suggestions,
            summary: analysisData.summary || 'Analysis completed',
            totalIssues: suggestions.length,
            criticalCount,
            warningCount,
            infoCount,
        };
    } catch (error) {
        console.error('Error analyzing drawing:', error);
        throw new Error('Failed to analyze drawing. Please try again.');
    }
}

/**
 * Extract text and measurements from a drawing
 */
export async function extractDrawingData(pdfBase64: string): Promise<{
    cabinetCodes: string[];
    measurements: { label: string; value: number; unit: string }[];
    rooms: string[];
}> {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `Analyze this kitchen floor plan and extract:
1. All cabinet codes/labels (e.g., W3030, B24, etc.)
2. All measurements with their values and units
3. Room/area labels

Return as JSON:
{
  "cabinetCodes": ["W3030", "B24", ...],
  "measurements": [{"label": "Work Aisle", "value": 42, "unit": "inches"}, ...],
  "rooms": ["Kitchen", "Pantry", ...]
}`;

        const result = await model.generateContent([
            {
                inlineData: {
                    mimeType: 'application/pdf',
                    data: pdfBase64,
                },
            },
            { text: prompt },
        ]);

        const response = await result.response;
        const text = response.text();

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            return { cabinetCodes: [], measurements: [], rooms: [] };
        }

        return JSON.parse(jsonMatch[0]);
    } catch (error) {
        console.error('Error extracting drawing data:', error);
        return { cabinetCodes: [], measurements: [], rooms: [] };
    }
}
