export type ComponentType = 
  | 'button' 
  | 'heading' 
  | 'text' 
  | 'card' 
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
}

export interface ComponentStyles {
  textColor?: string;
  backgroundColor?: string;
  fontSize?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  fontWeight?: 'normal' | 'medium' | 'semibold' | 'bold';
  textAlign?: 'left' | 'center' | 'right';
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  margin?: 'none' | 'xs' | 'sm' | 'md' | 'lg';
  borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  borderWidth?: 'none' | '1px' | '2px';
  borderColor?: string;
  width?: 'auto' | 'full' | 'half' | 'third';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
}

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
  events: ComponentEvent[];
  hidden?: boolean;
  locked?: boolean;
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
  elements: CanvasElement[];
}

export type BottomPanelTab = 'layers' | 'assets' | 'events';
