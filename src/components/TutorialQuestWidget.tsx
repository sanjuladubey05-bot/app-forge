import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  X, 
  Minimize2, 
  Maximize2,
  ArrowRight,
  Play,
  Compass
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
  const [isMinimized, setIsMinimized] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);
  const [previewCompletedOnce, setPreviewCompletedOnce] = useState(false);

  useEffect(() => {
    if (isPreviewing) {
      setPreviewCompletedOnce(true);
    }
  }, [isPreviewing]);

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
    if (el.props.whenClicked === 'openPage' && profilePage && el.props.targetPageId === profilePage.id) {
      return true;
    }
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
      description: 'Add an interactive action button to the canvas.',
      hint: 'In the left rail, open "Components" and click "Action Button".',
      isComplete: hasButton,
      actionLabel: 'Open Components',
      actionTab: 'components',
    },
    {
      id: 'step_profile',
      title: '2. Create a "Profile" Screen',
      description: 'Add a second screen named Profile to start multi-page navigation.',
      hint: 'In the left rail, open "Pages", type "Profile", and click "Create".',
      isComplete: hasProfilePage,
      actionLabel: 'Open Pages',
      actionTab: 'pages',
    },
    {
      id: 'step_link',
      title: '3. Connect Button to Profile',
      description: 'Link your button so tapping it opens the Profile screen in preview.',
      hint: 'Select the Button, open "Props" on the right, and set When Clicked to "Open Page" -> "Profile".',
      isComplete: hasButtonLinkedToProfile,
    },
    {
      id: 'step_section',
      title: '4. Add a Prebuilt Section',
      description: 'Insert an editable layout section from the Section Library.',
      hint: 'Open the "Sections" tab on the left and click "Add to Canvas".',
      isComplete: hasSectionOrComplex,
      actionLabel: 'Browse Sections',
      actionTab: 'sections',
    },
    {
      id: 'step_design',
      title: '5. Customize Design & Motion',
      description: 'Adjust sizing, colors, radius, or pick entrance motion.',
      hint: 'Select an element and customize styles in the Design or Motion tabs.',
      isComplete: hasCustomizedDesign,
    },
    {
      id: 'step_preview',
      title: '6. Test Interactive Prototype',
      description: 'Run live interactive preview to test page switching and actions.',
      hint: 'Click "Preview" in the top bar to test live clicks.',
      isComplete: hasPreviewed,
      actionLabel: 'Launch Preview',
    },
  ];

  const completedCount = quests.filter((q) => q.isComplete).length;
  const progressPercent = Math.round((completedCount / quests.length) * 100);
  const allComplete = completedCount === quests.length;

  const activeQuestIndex = quests.findIndex((q) => !q.isComplete);
  const activeQuest = activeQuestIndex !== -1 ? quests[activeQuestIndex] : null;

  if (isDismissed) {
    return (
      <button
        onClick={() => setIsDismissed(false)}
        className="fixed bottom-6 right-6 lg:right-84 z-40 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 shadow-lg rounded-lg px-3 py-1.5 flex items-center gap-2 text-xs text-zinc-300 transition cursor-pointer"
        title="Show onboarding guide"
      >
        <Compass size={13} className="text-zinc-400" />
        <span>Guide · {completedCount}/{quests.length}</span>
      </button>
    );
  }

  if (isMinimized) {
    return (
      <div className="hidden sm:flex fixed bottom-6 right-6 lg:right-84 z-40 bg-zinc-900 border border-zinc-800 shadow-xl rounded-xl p-3 items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300">
            <Compass size={13} />
          </div>
          <div>
            <div className="text-xs font-medium text-zinc-200">
              Guide · {completedCount} of {quests.length}
            </div>
            <div className="text-[11px] text-zinc-500 truncate max-w-[170px]">
              {allComplete ? 'All steps completed' : activeQuest?.title}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-0.5 border-l border-zinc-800 pl-2">
          <button
            onClick={() => setIsMinimized(false)}
            className="p-1 text-zinc-400 hover:text-white rounded transition"
            title="Expand guide"
          >
            <Maximize2 size={13} />
          </button>
          <button
            onClick={() => setIsDismissed(true)}
            className="p-1 text-zinc-400 hover:text-white rounded transition"
            title="Dismiss guide"
          >
            <X size={13} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="hidden sm:block fixed bottom-6 right-6 lg:right-84 z-40 w-92 bg-zinc-900 border border-zinc-800 shadow-2xl rounded-xl overflow-hidden select-none font-sans">
      {/* Header */}
      <div className="p-3 border-b border-zinc-800 flex items-center justify-between bg-zinc-900">
        <div>
          <div className="text-xs font-semibold text-zinc-100 flex items-center gap-2">
            <span>Onboarding Guide</span>
            <span className="text-[11px] text-zinc-500 font-normal">
              · {completedCount} of {quests.length}
            </span>
          </div>
          <div className="text-[11px] text-zinc-400 mt-0.5">
            Essential steps to build and connect your app
          </div>
        </div>

        <div className="flex items-center gap-0.5">
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1 text-zinc-400 hover:text-zinc-200 rounded transition cursor-pointer"
            title="Minimize"
          >
            <Minimize2 size={13} />
          </button>
          <button
            onClick={() => setIsDismissed(true)}
            className="p-1 text-zinc-400 hover:text-zinc-200 rounded transition cursor-pointer"
            title="Dismiss"
          >
            <X size={13} />
          </button>
        </div>
      </div>

      {/* Thin Progress hairline */}
      <div className="w-full h-1 bg-zinc-800">
        <div 
          className="h-full bg-zinc-400 transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Quest Steps List */}
      <div className="max-h-72 overflow-y-auto p-3 space-y-2">
        {quests.map((quest) => {
          const isActive = !allComplete && activeQuest?.id === quest.id;
          return (
            <div
              key={quest.id}
              className={`p-2.5 rounded-lg border transition ${
                quest.isComplete
                  ? 'bg-zinc-950/40 border-zinc-800/60 text-zinc-500'
                  : isActive
                  ? 'bg-zinc-950 border-zinc-700 text-zinc-200'
                  : 'bg-zinc-950/20 border-zinc-900 text-zinc-600'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 shrink-0">
                  {quest.isComplete ? (
                    <CheckCircle2 size={14} className="text-zinc-400" />
                  ) : isActive ? (
                    <Circle size={14} className="text-zinc-200 fill-zinc-200/20" />
                  ) : (
                    <Circle size={14} className="text-zinc-700" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className={`text-xs ${quest.isComplete ? 'line-through text-zinc-500' : isActive ? 'font-medium text-zinc-100' : 'text-zinc-500'}`}>
                      {quest.title}
                    </span>
                    {quest.isComplete && (
                      <span className="text-[10px] text-zinc-500">
                        Complete
                      </span>
                    )}
                  </div>

                  {isActive && (
                    <div className="mt-1.5 space-y-2">
                      <p className="text-[11px] text-zinc-400 leading-relaxed">
                        {quest.description}
                      </p>
                      <div className="p-2 rounded bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-300">
                        {quest.hint}
                      </div>

                      {quest.actionTab && onNavigateTab && (
                        <button
                          type="button"
                          onClick={() => onNavigateTab(quest.actionTab!)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition cursor-pointer"
                        >
                          <span>{quest.actionLabel}</span>
                          <ArrowRight size={11} />
                        </button>
                      )}

                      {quest.id === 'step_preview' && onOpenPreview && (
                        <button
                          type="button"
                          onClick={onOpenPreview}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition cursor-pointer"
                        >
                          <Play size={11} />
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

      {/* Completion message */}
      {allComplete && (
        <div className="p-3 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between text-xs">
          <span className="text-zinc-300">All 6 steps completed.</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMinimized(true)}
              className="text-zinc-500 hover:text-zinc-300 cursor-pointer"
            >
              Minimize
            </button>
            {onOpenPreview && (
              <button
                onClick={onOpenPreview}
                className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium cursor-pointer"
              >
                Open Preview
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
