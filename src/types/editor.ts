export type ComponentType = 
  | 'button' 
  | 'heading' 
  | 'text' 
  | 'card' 
  | 'container'
  | 'input' 
  | 'textarea' 
  | 'select' 
  | 'badge' 
  | 'metric' 
  | 'image' 
  | 'divider' 
  | 'toggle'
  | 'table';

export type ViewportMode = 'desktop' | 'tablet' | 'mobile';
export type PageTransition = 'fade' | 'slide-left' | 'slide-up' | 'none';

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
  options?: string[];
  toggleChecked?: boolean;
  tableHeaders?: string[];
  tableRows?: string[][];
  subtext?: string;
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

  // Animations
  animationMount?: 'none' | 'fade-in' | 'slide-up' | 'scale-up' | 'pulse';
  animationHover?: 'none' | 'lift' | 'scale' | 'glow';

  // Responsive Visibility
  hideOnMobile?: boolean;
  hideOnDesktop?: boolean;
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
  // Multi-page architecture
  pages: Page[];
  activePageId: string;
  homePageId: string;
  // Legacy backward-compatibility
  elements?: CanvasElement[];
}

export type LeftPanelTab = 'components' | 'pages' | 'layers' | 'assets';
export type BottomDrawerTab = 'logic' | 'logs' | 'test';

export interface AppExecutionLog {
  id: string;
  timestamp: string;
  type: 'action' | 'navigation' | 'modal' | 'form' | 'condition';
  sourceElement: string;
  message: string;
  status: 'success' | 'info' | 'warning' | 'error';
}
