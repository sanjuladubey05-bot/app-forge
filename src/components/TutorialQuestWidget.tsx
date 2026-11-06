import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  CheckCircle2, 
  Circle, 
  ChevronRight, 
  Sparkles, 
  X, 
  RotateCcw, 
  Minimize2, 
  Maximize2,
  HelpCircle,
  ArrowRight,
  Zap,
  Play
} from 'lucide-react';
import { CanvasElement, LeftPanelTab, Project } from '../types/editor';

interface TutorialQuestWidgetProps {
  project: Project;
  selectedElement: CanvasElement | null;
  isPreviewing: boolean;
  onNavigateTab?: (tab: LeftPanelTab) => void;
  onOpenPreview?: () => void;
  onCreateProfilePageShortcut?: () => void;
}

export interface QuestStep {
  id: string;
  title: string;
  description: string;
  hint: string;
  isComplete: boolean;
  actionLabel?: string;
  actionTab?: LeftPanelTab;
}

export const TutorialQuestWidget: React.FC<TutorialQuestWidgetProps> = ({
  project,
  selectedElement,
  isPreviewing,
  onNavigateTab,
  onOpenPreview,
  onCreateProfilePageShortcut,
}) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [previewCompletedOnce, setPreviewCompletedOnce] = useState(false);

  // Mark preview as completed when isPreviewing becomes true
  useEffect(() => {
    if (isPreviewing) {
      setPreviewCompletedOnce(true);
    }
  }, [isPreviewing]);

  // All elements across all pages
  const allElements: CanvasElement[] = project.pages.flatMap((p) => p.elements);

  // Check 1: Button exists
  const hasButton = allElements.some((el) => el.type === 'button');

  // Check 2: Profile page exists
  const profilePage = project.pages.find((p) =>
    p.name.trim().toLowerCase().includes('profile')
  );
  const hasProfilePage = Boolean(profilePage);

  // Check 3: Button linked to Profile
  const hasButtonLinkedToProfile = allElements.some((el) => {
    if (el.type !== 'button') return false;
    // Check whenClicked prop
    if (el.props.whenClicked === 'openPage' && profilePage && el.props.targetPageId === profilePage.id) {
      return true;
    }
    // Check interactions
    if (el.interactions && profilePage) {
      const clickInter = el.interactions.find((i) => i.trigger === 'onClick');
      if (clickInter?.steps.some((s) => s.type === 'navigate' && s.targetPageId === profilePage.id)) {
        return true;
      }
    }
    return false;
  });

  // Check 4: Prebuilt Section or multi-element group added
  const hasSectionOrComplex = allElements.some(
    (el) =>
      el.name.toLowerCase().includes('section') ||
      el.name.toLowerCase().includes('hero') ||
      el.name.toLowerCase().includes('card') ||
      (el.children && el.children.length >= 2) ||
      allElements.length >= 4
  );

  // Check 5: Customized design or motion
  const hasCustomizedDesign = allElements.some((el) => {
    const hasCustomMotion = Boolean(el.styles.motion && el.styles.motion.effect !== 'none');
    const hasCustomBg = Boolean(el.styles.backgroundColor && el.styles.backgroundColor !== 'transparent');
    const hasCustomRadius = Boolean(el.styles.borderRadius && el.styles.borderRadius !== 'none');
    const hasCustomBorder = Boolean(el.styles.borderColor);
    return hasCustomMotion || hasCustomBg || hasCustomRadius || hasCustomBorder;
  });

  // Check 6: Previewed application
  const hasPreviewed = isPreviewing || previewCompletedOnce;

  const quests: QuestStep[] = [
    {
      id: 'step_button',
      title: '1. Add your first Button',
      description: 'Add an interactive Action Button to your canvas screen.',
      hint: 'Click "Components" tab on the left rail and click "Action Button".',
      isComplete: hasButton,
      actionLabel: 'Open Components',
      actionTab: 'components',
    },
    {
      id: 'step_profile',
      title: '2. Create a "Profile" Screen',
      description: 'Add a new screen named Profile to build a multi-page app.',
      hint: 'Click "Pages" tab on the left, type "Profile" in the name field, and click "+".',
      isComplete: hasProfilePage,
      actionLabel: 'Open Pages',
      actionTab: 'pages',
    },
    {
      id: 'step_link',
      title: '3. Connect Button to Profile',
      description: 'Link your button so clicking it navigates to the Profile screen.',
      hint: 'Select the Button, go to "Props" on right, set "When Clicked" to "Open Page" and choose "Profile".',
      isComplete: hasButtonLinkedToProfile,
    },
    {
      id: 'step_section',
      title: '4. Add a Prebuilt Section',
      description: 'Drop in a ready-made responsive section from the Section Library.',
      hint: 'Click the "Sections" tab on the left and click "Add to Canvas" on any section.',
      isComplete: hasSectionOrComplex,
      actionLabel: 'Browse Sections',
      actionTab: 'sections',
    },
    {
      id: 'step_design',
      title: '5. Customize Design & Motion',
      description: 'Tweak colors, border radius, or pick entrance animations.',
      hint: 'Select an element, open the "Design" or "Motion" tab, and choose your favorite style.',
      isComplete: hasCustomizedDesign,
    },
    {
      id: 'step_preview',
      title: '6. Test Interactive Prototype',
      description: 'Launch Preview mode and click your button to navigate between screens.',
      hint: 'Click the "Preview" button in the top toolbar to test your interactive application live.',
      isComplete: hasPreviewed,
      actionLabel: 'Launch Preview',
    },
  ];

  const completedCount = quests.filter((q) => q.isComplete).length;
  const progressPercent = Math.round((completedCount / quests.length) * 100);
  const allComplete = completedCount === quests.length;

  // Active quest is the first incomplete quest
  const activeQuestIndex = quests.findIndex((q) => !q.isComplete);
  const activeQuest = activeQuestIndex !== -1 ? quests[activeQuestIndex] : null;

  if (isDismissed) {
    return (
      <button
        onClick={() => setIsDismissed(false)}
        className="fixed bottom-12 right-6 z-40 bg-zinc-900 border border-zinc-700/80 hover:border-blue-500 shadow-xl rounded-full px-3.5 py-2 flex items-center gap-2 text-xs text-white transition cursor-pointer"
        title="Resume Guided Missions"
      >
        <Trophy size={14} className="text-amber-400" />
        <span className="font-semibold">Missions: {completedCount}/{quests.length}</span>
      </button>
    );
  }

  if (isMinimized) {
    return (
      <div className="fixed bottom-12 right-6 z-40 bg-zinc-950/95 border border-zinc-800 shadow-2xl rounded-2xl p-3 flex items-center gap-3 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Trophy size={16} className={allComplete ? 'text-amber-400' : 'text-blue-400'} />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>Quick Start Quest</span>
              <span className="text-[10px] font-mono text-zinc-400">({completedCount}/6)</span>
            </div>
            <div className="text-[10px] text-zinc-400 truncate max-w-[160px]">
              {allComplete ? 'All missions completed!' : activeQuest?.title}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(false)}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition cursor-pointer"
            title="Expand Missions"
          >
            <Maximize2 size={13} />
          </button>
          <button
            onClick={() => setIsDismissed(true)}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition cursor-pointer"
            title="Dismiss"
          >
            <X size={13} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-12 right-6 z-40 w-96 bg-zinc-950/95 border border-zinc-800 shadow-2xl rounded-2xl overflow-hidden backdrop-blur-lg select-none transition-all">
      {/* Header */}
      <div className="p-3.5 bg-gradient-to-r from-blue-950/60 via-zinc-900 to-zinc-950 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Trophy size={15} className={allComplete ? 'text-amber-300' : 'text-white'} />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>AppForge Play-to-Build</span>
              <span className="px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 text-[9px] font-mono font-semibold">
                QUICK QUEST
              </span>
            </div>
            <div className="text-[10px] text-zinc-400">
              Zero coding • Complete steps to build your first app
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 transition cursor-pointer"
            title="Minimize"
          >
            <Minimize2 size={13} />
          </button>
          <button
            onClick={() => setIsDismissed(true)}
            className="p-1 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 transition cursor-pointer"
            title="Hide Missions"
          >
            <X size={13} />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-4 py-2.5 bg-zinc-900/60 border-b border-zinc-800/80 flex items-center justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="text-zinc-300 font-medium">Mission Progress</span>
            <span className="font-mono font-bold text-blue-400">{progressPercent}% ({completedCount}/{quests.length})</span>
          </div>
          <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Quest Steps List */}
      <div className="max-h-72 overflow-y-auto p-3 space-y-2">
        {quests.map((quest, idx) => {
          const isActive = !allComplete && activeQuest?.id === quest.id;
          return (
            <div
              key={quest.id}
              className={`p-2.5 rounded-xl border transition ${
                quest.isComplete
                  ? 'bg-zinc-900/40 border-zinc-800/80 text-zinc-400'
                  : isActive
                  ? 'bg-blue-950/30 border-blue-500/50 text-zinc-200 ring-1 ring-blue-500/30'
                  : 'bg-zinc-900/20 border-zinc-900 text-zinc-500 opacity-60'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 shrink-0">
                  {quest.isComplete ? (
                    <CheckCircle2 size={15} className="text-emerald-400" />
                  ) : isActive ? (
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" />
                  ) : (
                    <Circle size={15} className="text-zinc-600" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className={`text-xs font-semibold ${quest.isComplete ? 'line-through text-zinc-400' : isActive ? 'text-white font-bold' : 'text-zinc-400'}`}>
                      {quest.title}
                    </span>
                    {quest.isComplete && (
                      <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded font-semibold">
                        DONE
                      </span>
                    )}
                  </div>

                  {isActive && (
                    <div className="mt-1 space-y-1.5">
                      <p className="text-[11px] text-zinc-300 leading-tight">
                        {quest.description}
                      </p>
                      <div className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-[10px] text-amber-300/90 flex items-start gap-1">
                        <Sparkles size={11} className="shrink-0 mt-0.5 text-amber-400" />
                        <span>{quest.hint}</span>
                      </div>

                      {quest.actionTab && onNavigateTab && (
                        <button
                          type="button"
                          onClick={() => onNavigateTab(quest.actionTab!)}
                          className="mt-1 inline-flex items-center gap-1 px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-semibold transition cursor-pointer"
                        >
                          <span>{quest.actionLabel}</span>
                          <ArrowRight size={10} />
                        </button>
                      )}

                      {quest.id === 'step_preview' && onOpenPreview && (
                        <button
                          type="button"
                          onClick={onOpenPreview}
                          className="mt-1 inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-semibold transition cursor-pointer"
                        >
                          <Play size={10} />
                          <span>{quest.actionLabel}</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer / All Complete Celebration */}
      {allComplete ? (
        <div className="p-3 bg-gradient-to-r from-emerald-950/40 via-zinc-900 to-zinc-950 border-t border-emerald-500/30 flex flex-col items-center text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-300">
            <Trophy size={14} className="text-amber-400 animate-bounce" />
            <span>🎉 All 6 Missions Completed!</span>
          </div>
          <p className="text-[10px] text-zinc-400 max-w-xs">
            Congratulations! You built and connected a multi-page interactive application completely without code.
          </p>
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => {
                setPreviewCompletedOnce(false);
                setIsMinimized(true);
              }}
              className="px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 transition cursor-pointer"
            >
              Minimize
            </button>
            {onOpenPreview && (
              <button
                onClick={onOpenPreview}
                className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition cursor-pointer flex items-center gap-1"
              >
                <Play size={11} />
                <span>Play Live Preview</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="p-2.5 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between text-[10px] text-zinc-500">
          <span>Tip: Complete each step to master AppForge.</span>
          <button
            onClick={() => setIsMinimized(true)}
            className="hover:text-zinc-300 cursor-pointer"
          >
            Hide for now
          </button>
        </div>
      )}
    </div>
  );
};
