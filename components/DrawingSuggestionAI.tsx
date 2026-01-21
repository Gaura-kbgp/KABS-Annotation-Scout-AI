import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/Button';
import { User } from '../types';

interface DrawingSuggestionAIProps {
    user: User;
}

export const DrawingSuggestionAI: React.FC<DrawingSuggestionAIProps> = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-dark-900 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-20 h-20 bg-dark-800 rounded-2xl flex items-center justify-center mb-6 text-purple-500 animate-bounce">
                <div className="flex flex-col items-center">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="40"
                        height="40"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-calculator"
                    >
                        <rect width="16" height="20" x="4" y="2" rx="2" />
                        <line x1="8" x2="16" y1="6" y2="6" />
                        <line x1="16" x2="16" y1="14" y2="18" />
                        <path d="M16 10h.01" />
                        <path d="M12 10h.01" />
                        <path d="M8 10h.01" />
                        <path d="M12 14h.01" />
                        <path d="M8 14h.01" />
                        <path d="M12 18h.01" />
                        <path d="M8 18h.01" />
                    </svg>
                </div>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">Scout AI Coming Soon</h1>
            <p className="text-gray-400 max-w-lg mb-8 text-lg">
                We are building a powerful AI that will automatically convert 2D floor plans
                to colored presentation-ready plans and validate designs. Stay tuned!
            </p>
            <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
        </div>
    );
};
