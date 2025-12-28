import React from 'react';
import { ToolType } from '../../types';
import { 
  MousePointer2, 
  Hand, 
  Pen, 
  Minus, 
  MoveRight, 
  Square, 
  Circle, 
  Type, 
  Ruler, 
  Eraser,
  Triangle
} from 'lucide-react';

interface EditorToolbarProps {
  currentTool: ToolType;
  setTool: (t: ToolType) => void;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({ currentTool, setTool }) => {
  const tools = [
    { type: ToolType.SELECT, icon: MousePointer2, label: 'Select' },
    { type: ToolType.PAN, icon: Hand, label: 'Pan' },
    { type: ToolType.PEN, icon: Pen, label: 'Freehand' },
    { type: ToolType.LINE, icon: Minus, label: 'Line' },
    { type: ToolType.ARROW, icon: MoveRight, label: 'Arrow' },
    { type: ToolType.RECTANGLE, icon: Square, label: 'Rectangle' },
    { type: ToolType.ELLIPSE, icon: Circle, label: 'Ellipse' },
    { type: ToolType.TEXT, icon: Type, label: 'Text' },
    { type: ToolType.MEASURE, icon: Ruler, label: 'Measure' },
    { type: ToolType.ANGLE, icon: Triangle, label: 'Angle' },
    { type: ToolType.ERASER, icon: Eraser, label: 'Eraser' },
  ];

  return (
    <div className="w-14 md:w-16 bg-dark-800 border-r border-dark-700 flex flex-col items-center py-4 gap-2 md:gap-3 z-10 shrink-0 overflow-y-auto custom-scrollbar">
      {tools.map((tool) => {
        const isActive = currentTool === tool.type;
        return (
          <button
            key={tool.type}
            onClick={() => setTool(tool.type)}
            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all relative group shrink-0 ${
              isActive 
                ? 'bg-brand-600 text-white shadow-lg shadow-brand-900/50' 
                : 'text-gray-400 hover:bg-dark-700 hover:text-white'
            }`}
            title={tool.label}
          >
            <tool.icon size={20} />
            <div className="absolute left-14 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity hidden md:block">
              {tool.label}
            </div>
          </button>
        );
      })}
    </div>
  );
};