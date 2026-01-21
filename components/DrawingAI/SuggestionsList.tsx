import React from 'react';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { DrawingSuggestion } from '../../types';
import { motion } from 'framer-motion';

interface SuggestionsListProps {
    suggestions: DrawingSuggestion[];
    selectedSuggestion: DrawingSuggestion | null;
    onSelect: (suggestion: DrawingSuggestion) => void;
}

export const SuggestionsList: React.FC<SuggestionsListProps> = ({
    suggestions,
    selectedSuggestion,
    onSelect,
}) => {
    const getSeverityIcon = (severity: string) => {
        switch (severity) {
            case 'critical':
                return <AlertTriangle size={18} className="text-red-400" />;
            case 'warning':
                return <AlertCircle size={18} className="text-yellow-400" />;
            default:
                return <Info size={18} className="text-blue-400" />;
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical':
                return 'border-red-500/50 bg-red-500/10';
            case 'warning':
                return 'border-yellow-500/50 bg-yellow-500/10';
            default:
                return 'border-blue-500/50 bg-blue-500/10';
        }
    };

    if (suggestions.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Info size={32} className="text-green-400" />
                </div>
                <p className="text-gray-400">No issues found!</p>
                <p className="text-sm text-gray-500 mt-2">
                    Your drawing appears to comply with NKBA standards
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
            {suggestions.map((suggestion, index) => (
                <motion.div
                    key={suggestion.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => onSelect(suggestion)}
                    className={`
            border rounded-lg p-4 cursor-pointer transition-all
            ${selectedSuggestion?.id === suggestion.id
                            ? 'ring-2 ring-purple-500 ' + getSeverityColor(suggestion.severity)
                            : 'border-dark-700 hover:border-dark-600'
                        }
          `}
                >
                    <div className="flex items-start gap-3">
                        <div className="mt-1">
                            {getSeverityIcon(suggestion.severity)}
                        </div>
                        <div className="flex-1 min-w-0">
                            {/* Location */}
                            {(suggestion.cabinet_code || suggestion.location_description) && (
                                <div className="flex items-center gap-2 mb-2">
                                    {suggestion.cabinet_code && (
                                        <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-xs rounded font-mono">
                                            {suggestion.cabinet_code}
                                        </span>
                                    )}
                                    {suggestion.location_description && (
                                        <span className="text-xs text-gray-400 truncate">
                                            {suggestion.location_description}
                                        </span>
                                    )}
                                </div>
                            )}

                            {/* Suggestion Text */}
                            <p className="text-sm mb-2 leading-relaxed">
                                {suggestion.suggestion_text}
                            </p>

                            {/* Measurements */}
                            {(suggestion.current_value !== undefined || suggestion.required_value !== undefined) && (
                                <div className="flex items-center gap-4 text-xs">
                                    {suggestion.current_value !== undefined && (
                                        <div>
                                            <span className="text-gray-500">Current: </span>
                                            <span className="font-medium text-red-400">
                                                {suggestion.current_value} {suggestion.unit}
                                            </span>
                                        </div>
                                    )}
                                    {suggestion.required_value !== undefined && (
                                        <div>
                                            <span className="text-gray-500">Required: </span>
                                            <span className="font-medium text-green-400">
                                                {suggestion.required_value} {suggestion.unit}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Rule Reference */}
                            {suggestion.rule && (
                                <div className="mt-2 pt-2 border-t border-dark-700">
                                    <p className="text-xs text-gray-500">
                                        <span className="font-medium text-gray-400">
                                            {suggestion.rule.rule_code}
                                        </span>
                                        {' - '}
                                        {suggestion.rule.title}
                                    </p>
                                </div>
                            )}

                            {/* Confidence */}
                            {suggestion.ai_confidence && (
                                <div className="mt-2">
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 h-1 bg-dark-700 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-purple-500 rounded-full"
                                                style={{ width: `${suggestion.ai_confidence * 100}%` }}
                                            />
                                        </div>
                                        <span className="text-xs text-gray-500">
                                            {Math.round(suggestion.ai_confidence * 100)}%
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
};
