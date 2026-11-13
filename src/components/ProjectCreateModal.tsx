import React, { useState } from 'react';
import { X, Layout, Layers, FormInput, Sparkles, Monitor, Tablet, Smartphone, Briefcase, ShoppingBag } from 'lucide-react';
import { ViewportMode } from '../types/editor';

interface ProjectCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, templateId: string, viewport: ViewportMode) => void;
}

export const ProjectCreateModal: React.FC<ProjectCreateModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [name, setName] = useState('');
  const [templateId, setTemplateId] = useState('saas');
  const [viewport, setViewport] = useState<ViewportMode>('desktop');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(name.trim() || 'New AppForge Project', templateId, viewport);
    setName('');
  };

  const templates = [
    {
      id: 'blank',
      title: 'Blank Canvas',
      desc: 'Clean slate with starter action button and header.',
      icon: Layout,
      badge: 'Flexible',
    },
    {
      id: 'saas',
      title: 'SaaS Metric Hub',
      desc: 'Pre-configured with KPI metrics, header, action CTA, and data table.',
      icon: Sparkles,
      badge: 'Popular',
    },
    {
      id: 'portfolio',
      title: 'Portfolio & Studio',
      desc: 'Navbar, hero showcase, case study card, and contact page.',
      icon: Briefcase,
      badge: 'Portfolio',
    },
    {
      id: 'shop',
      title: 'E-Commerce Shop',
      desc: 'Storefront catalog with navigation bar and checkout flow.',
      icon: ShoppingBag,
      badge: 'Store',
    },
    {
      id: 'contact',
      title: 'Contact & Lead Portal',
      desc: 'Complete form with inputs, dropdown, textarea, and submit event.',
      icon: FormInput,
      badge: 'Form',
    },
    {
      id: 'card',
      title: 'Product Showcase Card',
      desc: 'Hero image showcase with typography and interactive outline button.',
      icon: Layers,
      badge: 'Card',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
      <div 
        role="dialog" 
        aria-modal="true" 
        aria-labelledby="modal-title"
        className="w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/50">
          <div>
            <h2 id="modal-title" className="text-base font-semibold text-zinc-100 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50"></span>
              Create New AppForge Project
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">Configure your application base and initial template</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Project Name */}
          <div>
            <label htmlFor="proj-name-input" className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2">
              Application Name
            </label>
            <input
              id="proj-name-input"
              type="text"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Acme Customer CRM, Finance Tracker..."
              className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
            />
          </div>

          {/* Target Viewport */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2">
              Target Device Frame
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { id: 'desktop', label: 'Desktop (1200px)', icon: Monitor },
                { id: 'tablet', label: 'Tablet (768px)', icon: Tablet },
                { id: 'mobile', label: 'Mobile (390px)', icon: Smartphone },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = viewport === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setViewport(item.id as ViewportMode)}
                    className={`flex flex-col items-center justify-center py-2.5 px-3 rounded-xl border text-xs font-medium transition cursor-pointer ${
                      isSelected
                        ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                        : 'border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                    }`}
                  >
                    <Icon size={16} className="mb-1.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Template Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2">
              Select Starting Template
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {templates.map((tmpl) => {
                const Icon = tmpl.icon;
                const isSelected = templateId === tmpl.id;
                return (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => setTemplateId(tmpl.id)}
                    className={`text-left p-3.5 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-zinc-800 bg-zinc-950/60 hover:border-zinc-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <Icon size={15} className={isSelected ? 'text-blue-400' : 'text-zinc-400'} />
                          <span className={`text-xs font-semibold ${isSelected ? 'text-zinc-100' : 'text-zinc-200'}`}>
                            {tmpl.title}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                          {tmpl.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                        {tmpl.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles size={14} />
              <span>Create & Open Editor</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
