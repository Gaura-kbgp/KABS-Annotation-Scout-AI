import React, { useState } from 'react';
import { DrawingSuggestion } from '../../types';
import { ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import { Button } from '../ui/Button';

interface PDFViewerProps {
    pdfUrl: string;
    suggestions: DrawingSuggestion[];
    selectedSuggestion: DrawingSuggestion | null;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({
    pdfUrl,
    suggestions,
    selectedSuggestion,
}) => {
    const [zoom, setZoom] = useState(100);
    const [rotation, setRotation] = useState(0);

    const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 200));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 50));
    const handleRotate = () => setRotation(prev => (prev + 90) % 360);

    return (
        <div className="bg-dark-800 border border-dark-700 rounded-2xl overflow-hidden">
            {/* Toolbar */}
            <div className="bg-dark-900 border-b border-dark-700 p-4 flex items-center justify-between">
                <h2 className="font-semibold">Drawing Preview</h2>
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleZoomOut}
                        disabled={zoom <= 50}
                    >
                        <ZoomOut size={18} />
                    </Button>
                    <span className="text-sm text-gray-400 min-w-[60px] text-center">
                        {zoom}%
                    </span>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleZoomIn}
                        disabled={zoom >= 200}
                    >
                        <ZoomIn size={18} />
                    </Button>
                    <div className="w-px h-6 bg-dark-700 mx-2" />
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRotate}
                    >
                        <RotateCw size={18} />
                    </Button>
                </div>
            </div>

            {/* PDF Display */}
            <div className="relative bg-dark-900 p-6 overflow-auto custom-scrollbar" style={{ height: '600px' }}>
                <div
                    className="mx-auto transition-transform"
                    style={{
                        transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                        transformOrigin: 'center top',
                    }}
                >
                    <iframe
                        src={pdfUrl}
                        className="w-full border border-dark-700 rounded-lg bg-white"
                        style={{ height: '800px' }}
                        title="Drawing Preview"
                    />
                </div>

                {/* Highlight Markers for Suggestions */}
                {selectedSuggestion?.coordinates && (
                    <div
                        className="absolute border-4 border-red-500 rounded-lg pointer-events-none animate-pulse"
                        style={{
                            left: `${selectedSuggestion.coordinates.x}px`,
                            top: `${selectedSuggestion.coordinates.y}px`,
                            width: `${selectedSuggestion.coordinates.width}px`,
                            height: `${selectedSuggestion.coordinates.height}px`,
                            transform: `scale(${zoom / 100})`,
                            transformOrigin: 'top left',
                        }}
                    />
                )}
            </div>

            {/* Legend */}
            {suggestions.length > 0 && (
                <div className="bg-dark-900 border-t border-dark-700 p-4">
                    <div className="flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-red-500 rounded-full" />
                            <span className="text-gray-400">Critical ({suggestions.filter(s => s.severity === 'critical').length})</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                            <span className="text-gray-400">Warning ({suggestions.filter(s => s.severity === 'warning').length})</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-blue-500 rounded-full" />
                            <span className="text-gray-400">Info ({suggestions.filter(s => s.severity === 'info').length})</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
