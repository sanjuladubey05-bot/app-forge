import React, { useEffect, useState, useRef } from 'react';
import { 
  Type, 
  AlignLeft, 
  MousePointerClick, 
  LayoutTemplate, 
  FormInput, 
  Image as ImageIcon, 
  Box, 
  Tag, 
  X, 
  Sparkles,
  Plus
} from 'lucide-react';
import { ComponentType } from '../types/editor';

export interface QuickAddOption {
  type: ComponentType;
  label: string;
  shortDesc: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  accentColor: string;
}

export const QUICK_ADD_OPTIONS: QuickAddOption[] = [
  {
    type: 'button',
    label: 'Button',
    shortDesc: 'Clickable action or link',
    icon: MousePointerClick,
    accentColor: 'text-blue-400 group-hover:text-blue-300',
  },
  {
    type: 'heading',
    label: 'Heading',
    shortDesc: 'Page title or section header',
    icon: Type,
    accentColor: 'text-amber-400 group-hover:text-amber-300',
  },
  {
    type: 'text',
    label: 'Text',
    shortDesc: 'Body paragraph or description',
    icon: AlignLeft,
    accentColor: 'text-zinc-300 group-hover:text-white',
  },
  {
    type: 'card',
    label: 'Card',
    shortDesc: 'Content box with border & shadow',
    icon: LayoutTemplate,
    accentColor: 'text-purple-400 group-hover:text-purple-300',
  },
  {
    type: 'input',
    label: 'Input',
    shortDesc: 'Form field for user text input',
    icon: FormInput,
    accentColor: 'text-emerald-400 group-hover:text-emerald-300',
  },
  {
    type: 'image',
    label: 'Image',
    shortDesc: 'Media asset with responsive sizing',
    icon: ImageIcon,
    accentColor: 'text-sky-400 group-hover:text-sky-300',
  },
  {
    type: 'container',
    label: 'Container',
    shortDesc: 'Flexbox wrapper for nesting elements',
    icon: Box,
    accentColor: 'text-indigo-400 group-hover:text-indigo-300',
  },
  {
    type: 'badge',
    label: 'Badge',
    shortDesc: 'Tag or status indicator',
    icon: Tag,
    accentColor: 'text-rose-400 group-hover:text-rose-300',
  },
];

interface QuickAddRadialMenuProps {
  isOpen: boolean;
  position: { x: number; y: number } | null;
  onClose: () => void;
  onSelectComponent: (type: ComponentType) => void;
  activePageName: string;
}

export const QuickAddRadialMenu: React.FC<QuickAddRadialMenuProps> = ({
  isOpen,
  position,
  onClose,
  onSelectComponent,
  activePageName,
}) => {
  const [hoveredOption, setHoveredOption] = useState<QuickAddOption | null>(null);
  const [animateIn, setAnimateIn] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Trigger smooth blooming animation
      const animTimer = setTimeout(() => setAnimateIn(true), 20);
      setHoveredOption(null);

      // Close on Escape key
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        clearTimeout(animTimer);
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      setAnimateIn(false);
    }
  }, [isOpen, onClose]);

  if (!isOpen || !position) return null;

  // Radial geometry constants
  const radius = 92; // Distance from center hub in pixels
  const totalItems = QUICK_ADD_OPTIONS.length;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center select-none"
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
      data-testid="quick-add-backdrop"
    >
      {/* Backdrop overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity duration-200" />

      {/* Floating Radial Menu positioned at touch coordinates */}
      <div
        ref={menuRef}
        onClick={(e) => e.stopPropagation()}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: 'translate(-50%, -50%)',
        }}
        className="absolute pointer-events-auto"
        data-testid="quick-add-radial-menu"
      >
        {/* Radial Orbit Ring Guides */}
        <div 
          style={{ width: `${radius * 2 + 50}px`, height: `${radius * 2 + 50}px` }}
          className="absolute -top-[117px] -left-[117px] rounded-full border border-zinc-700/40 pointer-events-none animate-pulse opacity-40" 
        />
        <div 
          style={{ width: `${radius * 2}px`, height: `${radius * 2}px` }}
          className="absolute -top-[92px] -left-[92px] rounded-full border border-dashed border-zinc-800 pointer-events-none opacity-60" 
        />

        {/* Central Hub Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="relative z-20 w-12 h-12 rounded-full bg-zinc-900 border border-zinc-700/90 text-zinc-300 hover:text-white hover:border-zinc-500 shadow-2xl flex items-center justify-center transition-all duration-150 cursor-pointer active:scale-90 group"
          title="Close Quick Add (Esc)"
          aria-label="Close Quick Add Menu"
        >
          <X size={18} className="transition-transform group-hover:rotate-90 duration-200" />
        </button>

        {/* Satellite Node Shortcuts */}
        {QUICK_ADD_OPTIONS.map((opt, index) => {
          // Angle in radians: distributed evenly around 360deg, starting from top (-90deg)
          const angle = (index * 2 * Math.PI) / totalItems - Math.PI / 2;
          const nodeX = Math.round(Math.cos(angle) * radius);
          const nodeY = Math.round(Math.sin(angle) * radius);
          const Icon = opt.icon;

          return (
            <div
              key={opt.type}
              style={{
                position: 'absolute',
                left: '24px', // Centered relative to the 48px (w-12) center hub
                top: '24px',
                transform: animateIn 
                  ? `translate(calc(-50% + ${nodeX}px), calc(-50% + ${nodeY}px)) scale(1)` 
                  : 'translate(-50%, -50%) scale(0)',
                opacity: animateIn ? 1 : 0,
                transition: `transform 260ms cubic-bezier(0.34, 1.56, 0.64, 1) ${index * 25}ms, opacity 200ms ease-out ${index * 20}ms`,
              }}
              className="z-30 flex flex-col items-center pointer-events-auto"
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectComponent(opt.type);
                  onClose();
                }}
                onMouseEnter={() => setHoveredOption(opt)}
                onMouseLeave={() => setHoveredOption(null)}
                onTouchStart={() => setHoveredOption(opt)}
                className="w-11 h-11 rounded-full bg-zinc-900 border border-zinc-700/80 hover:border-blue-500 active:border-blue-400 bg-zinc-900/95 hover:bg-zinc-800 text-zinc-300 hover:text-white shadow-xl flex items-center justify-center transition-all duration-150 cursor-pointer active:scale-90 group focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                title={`Add ${opt.label}: ${opt.shortDesc}`}
                data-testid={`quick-add-${opt.type}`}
              >
                <Icon size={18} className={`transition-transform group-hover:scale-110 duration-150 ${opt.accentColor}`} />
              </button>

              {/* Node Mini Label */}
              <span className="mt-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-zinc-950/90 text-zinc-300 border border-zinc-800/80 shadow-md whitespace-nowrap pointer-events-none transition-all">
                {opt.label}
              </span>
            </div>
          );
        })}

        {/* Dynamic Descriptive Badge positioned below or above */}
        <div 
          className="absolute left-1/2 -translate-x-1/2 top-32 w-52 text-center pointer-events-none transition-all duration-150"
        >
          <div className="bg-zinc-950/95 border border-zinc-800 shadow-2xl rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 backdrop-blur-md">
            {hoveredOption ? (
              <div>
                <div className="font-semibold text-white flex items-center justify-center gap-1">
                  <span>+ Add {hoveredOption.label}</span>
                </div>
                <div className="text-[10px] text-zinc-400 mt-0.5 font-mono">
                  {hoveredOption.shortDesc}
                </div>
              </div>
            ) : (
              <div>
                <div className="text-[11px] font-semibold text-zinc-300 flex items-center justify-center gap-1">
                  <Sparkles size={11} className="text-blue-400" />
                  <span>Quick Add to {activePageName}</span>
                </div>
                <div className="text-[10px] text-zinc-400 mt-0.5">
                  Tap an icon to insert instantly
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
