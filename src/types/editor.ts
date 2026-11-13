export type ComponentType = 
  | 'button' 
  | 'heading' 
  | 'text' 
  | 'card' 
  | 'container' 
  | 'navbar'
  | 'input' 
  | 'textarea' 
  | 'select' 
  | 'badge' 
  | 'metric' 
  | 'image' 
  | 'divider' 
  | 'toggle'
  | 'table'
  | 'widget3d';

export type ThemePresetName =
  | 'midnight-saas'
  | 'minimal-light'
  | 'cyberpunk-neon'
  | 'warm-editorial'
  | 'custom';

export interface ThemeTokens {
  presetName: ThemePresetName;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  mutedTextColor: string;
  borderColor: string;
  fontFamily: 'Inter' | 'Plus Jakarta Sans' | 'Space Grotesk' | 'Georgia' | 'JetBrains Mono';
  borderRadius: '4px' | '8px' | '12px' | '16px' | '24px';
}

export interface PageSeoConfig {
  title?: string;
  metaDescription?: string;
  faviconUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'product';
  canonicalUrl?: string;
}

export type Widget3DPresetId =
  | 'glass-tilt-card'
  | 'neon-iso-button'
  | 'webgl-orbital-prism'
  | 'webgl-particle-field'
  | 'webgl-wireframe-terrain'
  | 'ai-custom';

export interface Widget3DConfig {
  presetId: Widget3DPresetId;
  presetMode: 'css-3d' | 'threejs-webgl';
  title: string;
  subtitle?: string;
  accentColor?: string;
  heightPx?: number;
  autoRotate?: boolean;
  interactiveTilt?: boolean;
  htmlSnippet?: string;
  cssSnippet?: string;
  jsSnippet?: string;
  promptUsed?: string;
}

export type ExportFramework = 'html' | 'react-vite' | 'nextjs' | 'vue';

export type ViewportMode = 'desktop' | 'tablet' | 'mobile';
export type PageTransition = 'fade' | 'slide-left' | 'slide-right' | 'slide-up' | 'scale' | 'none';

export interface NavLinkItem {
  label: string;
  targetPageId?: string;
  url?: string;
}

export interface ComponentProps {
  text?: string;
  headingLevel?: 'h1' | 'h2' | 'h3';
  placeholder?: string;
  label?: string;
  buttonVariant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  badgeVariant?: 'neutral' | 'success' | 'warning' | 'info' | 'danger';
  metricValue?: string;
  metricLabel?: string;
  metricTrend?: string;
  metricTrendPositive?: boolean;
  imageUrl?: string;
  imageAlt?: string;
  imageLicense?: string;
  options?: string[];
  toggleChecked?: boolean;
  tableHeaders?: string[];
  tableRows?: string[][];
  subtext?: string;
  // Navbar props
  brandName?: string;
  navLinks?: NavLinkItem[];
  ctaLabel?: string;
  ctaTargetPageId?: string;
  // Data / Form wiring
  dataCollectionId?: string;
  unknownType?: string;
  // 3D UI Widget props
  widget3d?: Widget3DConfig;
  // Simple "When Clicked" / Link To interaction bindings
  whenClicked?: 'none' | 'openPage' | 'openUrl' | 'showPopup' | 'showToast' | 'submitForm';
  targetPageId?: string;
  targetUrl?: string;
  popupTitle?: string;
  popupContent?: string;
  toastMessage?: string;
  buttonText?: string;
  buttonSize?: 'sm' | 'md' | 'lg';
  inputLabel?: string;
  rows?: number;
  title?: string;
  content?: string;
  altText?: string;
  // Container props
  direction?: 'column' | 'row';
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  wrap?: boolean;
}

export interface ComponentStyles {
  // Sizing
  width?: 'auto' | 'full' | 'half' | 'third' | 'custom';
  customWidth?: string;
  height?: 'auto' | 'full' | 'sm' | 'md' | 'lg' | 'custom';
  customHeight?: string;
  minHeight?: string;
  maxWidth?: string;
  alignSelf?: 'auto' | 'start' | 'center' | 'end' | 'stretch';

  // Colors & Backgrounds
  textColor?: string;
  backgroundColor?: string;
  backgroundGradient?: {
    enabled: boolean;
    direction: 'to-r' | 'to-b' | 'to-br' | 'to-tr';
    fromColor: string;
    toColor: string;
  };
  opacity?: number; // 0 to 100

  // Typography
  fontFamily?: 'sans' | 'mono' | 'serif' | 'display';
  fontSize?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
  fontWeight?: 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  lineHeight?: 'tight' | 'normal' | 'relaxed' | 'loose';
  letterSpacing?: 'tighter' | 'normal' | 'wide' | 'widest';
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';

  // Spacing (4 sides)
  paddingMode?: 'linked' | 'individual';
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  paddingTop?: string;
  paddingRight?: string;
  paddingBottom?: string;
  paddingLeft?: string;

  marginMode?: 'linked' | 'individual';
  margin?: 'none' | 'xs' | 'sm' | 'md' | 'lg';
  marginTop?: string;
  marginRight?: string;
  marginBottom?: string;
  marginLeft?: string;

  // Borders & Radii
  borderWidth?: 'none' | '1px' | '2px' | '4px';
  borderStyle?: 'solid' | 'dashed' | 'dotted';
  borderColor?: string;
  borderRadiusMode?: 'linked' | 'individual';
  borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  radiusTopLeft?: string;
  radiusTopRight?: string;
  radiusBottomRight?: string;
  radiusBottomLeft?: string;

  // Shadows & Effects
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'inner' | 'glow-blue' | 'glow-emerald';
  shadowColor?: string;

  // Motion & Animation System
  motion?: MotionSettings;

  // Animations (legacy compatibility)
  animationMount?: 'none' | 'fade-in' | 'slide-up' | 'scale-up' | 'pulse';
  animationHover?: 'none' | 'lift' | 'scale' | 'glow';

  // Responsive Visibility
  hideOnMobile?: boolean;
  hideOnDesktop?: boolean;
}

export type MotionEffect = 
  | 'none' 
  // Entrance Presets
  | 'fade' 
  | 'fade-in'
  | 'zoom-in'
  | 'scale'
  | 'slide-up' 
  | 'slide-down' 
  | 'slide-left' 
  | 'slide-right' 
  | 'bounce-in'
  | 'flip-in'
  | 'rotate-in'
  // Exit Presets
  | 'fade-out'
  | 'zoom-out'
  | 'slide-up-out'
  | 'slide-down-out'
  | 'slide-left-out'
  | 'slide-right-out'
  | 'bounce-out'
  | 'flip-out'
  | 'rotate-out'
  // Continuous & Emphasis
  | 'bounce' 
  | 'rotate' 
  | 'pulse' 
  | 'flip';

export type MotionCategory = 'entrance' | 'exit' | 'emphasis';
export type MotionPresetView = 'pairs' | 'all' | 'entrance' | 'exit' | 'emphasis';

export type AlignmentType = 
  | 'center-h' 
  | 'center-v' 
  | 'center-both' 
  | 'anchor-left' 
  | 'anchor-right' 
  | 'anchor-top' 
  | 'anchor-bottom' 
  | 'distribute-h' 
  | 'distribute-v' 
  | 'space-between'
  | 'full-width';

export interface MotionPresetItem {
  id: MotionEffect;
  name: string;
  category: MotionCategory;
  description: string;
  defaultDuration: number;
  defaultEasing: MotionEasing | string;
  defaultTrigger: 'onMount' | 'onHover' | 'onClick' | 'infinite';
}

export interface MotionPresetPair {
  family: string;
  entrance: MotionPresetItem;
  exit: MotionPresetItem;
}

export type MotionEasing = 
  | 'ease' 
  | 'linear' 
  | 'ease-in' 
  | 'ease-out' 
  | 'ease-in-out' 
  | 'bounce';

export interface MotionSettings {
  effect: MotionEffect;
  duration: number; // in milliseconds (e.g. 100 to 3000)
  easing: MotionEasing | string; // e.g. 'ease-out', 'linear', or cubic-bezier
  delay: number; // in milliseconds (e.g. 0 to 2000)
  trigger: 'onMount' | 'onHover' | 'onClick' | 'infinite';
  iterationCount?: '1' | '2' | '3' | 'infinite';
}

export type WorkspaceMode = 'design' | 'logic' | 'data';
export type StudioTheme = 'dark' | 'light';

export interface DataField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'boolean' | 'date' | 'email' | 'status';
  required?: boolean;
}

export interface DataCollection {
  id: string;
  name: string;
  description?: string;
  fields: DataField[];
  records: Record<string, any>[];
}

export interface AppVariable {
  id: string;
  name: string;
  type: 'string' | 'number' | 'boolean';
  defaultValue: any;
  currentValue: any;
}

// Action & Event System (Action Builder & Pipeline)
export type ActionType = 
  | 'navigate' 
  | 'openModal' 
  | 'closeModal' 
  | 'toast' 
  | 'submitForm' 
  | 'toggleVisibility' 
  | 'setText' 
  | 'downloadFile' 
  | 'condition';

export interface ActionCondition {
  field: string;
  operator: 'equals' | 'notEquals' | 'contains' | 'isNotEmpty' | 'isEmpty';
  value: string;
}

export interface ActionStep {
  id: string;
  type: ActionType;
  label?: string;
  // Payload fields
  targetPageId?: string;
  targetElementId?: string;
  modalTitle?: string;
  modalContent?: string;
  toastType?: 'success' | 'error' | 'info' | 'warning';
  toastMessage?: string;
  textValue?: string;
  fileName?: string;
  fileData?: string;
  // Conditional logic
  condition?: ActionCondition;
  thenActions?: ActionStep[];
  elseActions?: ActionStep[];
}

export interface ComponentInteraction {
  id: string;
  trigger: 'onClick' | 'onChange' | 'onHover' | 'onMount';
  name?: string;
  steps: ActionStep[];
}

// Legacy event backward-compatibility
export interface ComponentEvent {
  id: string;
  trigger: 'onClick' | 'onChange';
  action: 'alert' | 'link' | 'incrementCounter' | 'resetForm' | 'toast';
  actionPayload?: string;
}

export interface CanvasElement {
  id: string;
  type: ComponentType;
  name: string;
  props: ComponentProps;
  styles: ComponentStyles;
  events: ComponentEvent[]; // legacy compatibility
  interactions?: ComponentInteraction[]; // new multi-step & conditional interaction pipeline
  children?: CanvasElement[]; // nested container hierarchy
  parentId?: string | null;
  hidden?: boolean;
  locked?: boolean;
}

export interface Page {
  id: string;
  name: string;
  path: string;
  transition: PageTransition;
  elements: CanvasElement[];
  canvasBg?: string;
  seo?: PageSeoConfig;
}

export interface LegalComplianceConfig {
  businessName: string;
  businessAddress: string;
  supportEmail: string;
  privacyEmail: string;
  registrationId: string;
  refundWindowDays: number;
  collectsKidsData: boolean;
  minimumAge: number;
  requireFormConsent: boolean;
  includeCookieBanner: boolean;
  includeLegalFooter: boolean;
  unsubscribeEmail: string;
  marketingSubscribed: boolean;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  viewport: ViewportMode;
  zoom: number;
  canvasBg: string;
  canvasPadding: 'sm' | 'md' | 'lg' | 'xl';
  // Global design tokens & responsive stacking rule
  themeTokens?: ThemeTokens;
  responsiveStackBelowPx?: number;
  // Multi-page architecture
  pages: Page[];
  activePageId: string;
  homePageId: string;
  // Data Mode & Backend Studio
  collections?: DataCollection[];
  variables?: AppVariable[];
  // Global Keyboard Shortcuts Settings Configuration
  customShortcuts?: Record<string, string>;
  // Legal, Privacy & Business Transparency Config
  compliance?: LegalComplianceConfig;
  // Vercel Deploy & Domain state (no tokens)
  lastVercelProjectId?: string;
  lastVercelProjectName?: string;
  lastDeploymentUrl?: string;
  customDomains?: string[];
  // Canvas editing helpers
  snapToGrid?: boolean;
  showGuides?: boolean;
  // Legacy backward-compatibility
  elements?: CanvasElement[];
}

export type LeftPanelTab = 'components' | 'sections' | 'pages' | 'layers' | 'assets' | 'tutorial';
export type BottomDrawerTab = 'logic' | 'logs' | 'test';

export interface AppExecutionLog {
  id: string;
  timestamp: string;
  type: 'action' | 'navigation' | 'modal' | 'form' | 'condition';
  sourceElement: string;
  message: string;
  status: 'success' | 'info' | 'warning' | 'error';
}
