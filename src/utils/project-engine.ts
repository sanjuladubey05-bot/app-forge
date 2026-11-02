import { CanvasElement, ComponentProps, ComponentStyles, ComponentType, Project } from '../types/editor';

export function createNewElement(type: ComponentType): CanvasElement {
  const id = 'el_' + Math.random().toString(36).substring(2, 9);
  
  const defaultProps: Record<ComponentType, ComponentProps> = {
    heading: {
      text: 'Build Anything Without Code',
      headingLevel: 'h1',
      subtext: 'Turn ideas into production-ready software in minutes.',
    },
    text: {
      text: 'AppForge gives you complete control over your application layout, styling, and interactions with visual tools designed for speed and precision.',
    },
    button: {
      text: 'Get Started Now',
      buttonVariant: 'primary',
    },
    card: {
      text: 'Card Title',
      subtext: 'This is a modular card container to organize your UI elements and content neatly.',
    },
    input: {
      label: 'Email Address',
      placeholder: 'alex@example.com',
      text: '',
    },
    textarea: {
      label: 'Project Description',
      placeholder: 'Describe what you are building...',
      text: '',
    },
    select: {
      label: 'Target Platform',
      options: ['Web Application', 'Mobile Dashboard', 'Internal Tool', 'Landing Page'],
      text: 'Web Application',
    },
    badge: {
      text: 'v1.0 Ready',
      badgeVariant: 'success',
    },
    metric: {
      metricLabel: 'Active Users',
      metricValue: '24,890',
      metricTrend: '+18.4% this month',
      metricTrendPositive: true,
    },
    image: {
      imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
      imageAlt: 'Analytics and growth overview',
    },
    divider: {},
    toggle: {
      label: 'Enable Real-time Sync',
      toggleChecked: true,
      subtext: 'Automatically push changes to live instances.',
    },
    table: {
      tableHeaders: ['Project Name', 'Status', 'Members', 'Updated'],
      tableRows: [
        ['Customer Portal', 'Active', '4 devs', 'Just now'],
        ['Analytics Engine', 'Building', '2 devs', '2 hrs ago'],
        ['Mobile App API', 'Deployed', '6 devs', 'Yesterday'],
      ],
    },
  };

  const defaultStyles: Record<ComponentType, ComponentStyles> = {
    heading: {
      fontSize: '3xl',
      fontWeight: 'bold',
      textColor: '#ffffff',
      textAlign: 'left',
      margin: 'sm',
      width: 'full',
    },
    text: {
      fontSize: 'base',
      fontWeight: 'normal',
      textColor: '#a1a1aa',
      textAlign: 'left',
      margin: 'xs',
      width: 'full',
    },
    button: {
      fontSize: 'sm',
      fontWeight: 'semibold',
      padding: 'md',
      borderRadius: 'md',
      width: 'auto',
      backgroundColor: '#3b82f6',
      textColor: '#ffffff',
    },
    card: {
      backgroundColor: '#18181b',
      borderColor: '#27272a',
      borderWidth: '1px',
      borderRadius: 'lg',
      padding: 'lg',
      width: 'full',
      shadow: 'md',
    },
    input: {
      fontSize: 'sm',
      backgroundColor: '#18181b',
      borderColor: '#27272a',
      borderWidth: '1px',
      borderRadius: 'md',
      padding: 'sm',
      textColor: '#ffffff',
      width: 'full',
    },
    textarea: {
      fontSize: 'sm',
      backgroundColor: '#18181b',
      borderColor: '#27272a',
      borderWidth: '1px',
      borderRadius: 'md',
      padding: 'sm',
      textColor: '#ffffff',
      width: 'full',
    },
    select: {
      fontSize: 'sm',
      backgroundColor: '#18181b',
      borderColor: '#27272a',
      borderWidth: '1px',
      borderRadius: 'md',
      padding: 'sm',
      textColor: '#ffffff',
      width: 'full',
    },
    badge: {
      fontSize: 'xs',
      fontWeight: 'medium',
      borderRadius: 'full',
      padding: 'xs',
      width: 'auto',
    },
    metric: {
      backgroundColor: '#18181b',
      borderColor: '#27272a',
      borderWidth: '1px',
      borderRadius: 'lg',
      padding: 'md',
      width: 'full',
      shadow: 'sm',
    },
    image: {
      borderRadius: 'lg',
      borderWidth: '1px',
      borderColor: '#27272a',
      width: 'full',
      shadow: 'sm',
    },
    divider: {
      borderColor: '#27272a',
      margin: 'md',
      width: 'full',
    },
    toggle: {
      width: 'full',
      margin: 'xs',
    },
    table: {
      backgroundColor: '#18181b',
      borderColor: '#27272a',
      borderWidth: '1px',
      borderRadius: 'lg',
      padding: 'sm',
      width: 'full',
    },
  };

  const readableNames: Record<ComponentType, string> = {
    heading: 'Heading',
    text: 'Paragraph Text',
    button: 'Action Button',
    card: 'Content Card',
    input: 'Text Input',
    textarea: 'Multi-line Textarea',
    select: 'Dropdown Select',
    badge: 'Status Badge',
    metric: 'Metric Stat Card',
    image: 'Image Box',
    divider: 'Divider Line',
    toggle: 'Switch Toggle',
    table: 'Data Table',
  };

  return {
    id,
    type,
    name: readableNames[type],
    props: { ...defaultProps[type] },
    styles: { ...defaultStyles[type] },
    events: [],
    hidden: false,
    locked: false,
  };
}

export function createInitialProject(name: string, templateId?: string): Project {
  const projectId = 'proj_' + Math.random().toString(36).substring(2, 9);
  const now = new Date().toISOString();

  let elements: CanvasElement[] = [];

  if (templateId === 'saas') {
    elements = [
      {
        ...createNewElement('badge'),
        props: { text: 'AppForge v2.4 Release', badgeVariant: 'info' },
      },
      {
        ...createNewElement('heading'),
        props: {
          text: 'Next-Gen Analytics Platform',
          headingLevel: 'h1',
          subtext: 'Monitor revenue, churn, and customer engagement live without coding.',
        },
      },
      {
        ...createNewElement('metric'),
        props: {
          metricLabel: 'Monthly Recurring Revenue (MRR)',
          metricValue: '$124,500',
          metricTrend: '+22.5% vs last month',
          metricTrendPositive: true,
        },
      },
      {
        ...createNewElement('button'),
        props: { text: 'Generate Report', buttonVariant: 'primary' },
        events: [
          {
            id: 'ev_1',
            trigger: 'onClick',
            action: 'toast',
            actionPayload: 'Monthly report generated successfully!',
          },
        ],
      },
      {
        ...createNewElement('divider'),
      },
      {
        ...createNewElement('table'),
      },
    ];
  } else if (templateId === 'contact') {
    elements = [
      {
        ...createNewElement('heading'),
        props: {
          text: 'Get in Touch With Our Team',
          headingLevel: 'h2',
          subtext: 'We typically respond within 2 business hours.',
        },
      },
      {
        ...createNewElement('input'),
        props: { label: 'Full Name', placeholder: 'Jane Doe' },
      },
      {
        ...createNewElement('input'),
        props: { label: 'Work Email', placeholder: 'jane@company.com' },
      },
      {
        ...createNewElement('select'),
        props: {
          label: 'Inquiry Reason',
          options: ['Product Support', 'Enterprise Sales', 'Partnership', 'Feedback'],
        },
      },
      {
        ...createNewElement('textarea'),
        props: { label: 'Your Message', placeholder: 'How can we help your team succeed?' },
      },
      {
        ...createNewElement('button'),
        props: { text: 'Send Message', buttonVariant: 'primary' },
        events: [
          {
            id: 'ev_2',
            trigger: 'onClick',
            action: 'toast',
            actionPayload: 'Thank you! Your message has been received.',
          },
        ],
      },
    ];
  } else if (templateId === 'card') {
    elements = [
      {
        ...createNewElement('image'),
        props: {
          imageUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=800&q=80',
          imageAlt: 'Gradient Abstract Art',
        },
      },
      {
        ...createNewElement('heading'),
        props: { text: 'Interactive Design System', headingLevel: 'h2' },
      },
      {
        ...createNewElement('text'),
        props: { text: 'Craft robust, accessible design tokens and interactive primitives.' },
      },
      {
        ...createNewElement('button'),
        props: { text: 'Explore Primitives', buttonVariant: 'outline' },
      },
    ];
  } else {
    // Blank template starts with a warm starter heading + button so the user immediately sees a working canvas
    elements = [
      {
        ...createNewElement('heading'),
        props: {
          text: 'Welcome to ' + (name || 'Your New App'),
          headingLevel: 'h1',
          subtext: 'Start building by adding components from the left library or customizing this layout.',
        },
      },
      {
        ...createNewElement('button'),
        props: { text: 'Click Me (Try Preview)', buttonVariant: 'primary' },
        events: [
          {
            id: 'ev_init',
            trigger: 'onClick',
            action: 'toast',
            actionPayload: 'Button clicked! Events work in preview mode.',
          },
        ],
      },
    ];
  }

  return {
    id: projectId,
    name: name.trim() || 'Untitled Project',
    description: 'Created with AppForge No-Code Builder',
    createdAt: now,
    updatedAt: now,
    viewport: 'desktop',
    zoom: 100,
    canvasBg: '#0f0f12',
    canvasPadding: 'lg',
    elements,
  };
}

export function addElement(project: Project, element: CanvasElement, targetIndex?: number): Project {
  const elements = [...project.elements];
  if (typeof targetIndex === 'number' && targetIndex >= 0 && targetIndex <= elements.length) {
    elements.splice(targetIndex, 0, element);
  } else {
    elements.push(element);
  }
  return {
    ...project,
    updatedAt: new Date().toISOString(),
    elements,
  };
}

export function updateElement(project: Project, elementId: string, updates: Partial<CanvasElement>): Project {
  return {
    ...project,
    updatedAt: new Date().toISOString(),
    elements: project.elements.map((el) => {
      if (el.id !== elementId) return el;
      return {
        ...el,
        ...updates,
        props: { ...el.props, ...(updates.props || {}) },
        styles: { ...el.styles, ...(updates.styles || {}) },
      };
    }),
  };
}

export function deleteElement(project: Project, elementId: string): Project {
  return {
    ...project,
    updatedAt: new Date().toISOString(),
    elements: project.elements.filter((el) => el.id !== elementId),
  };
}

export function duplicateElement(project: Project, elementId: string): Project {
  const index = project.elements.findIndex((el) => el.id === elementId);
  if (index === -1) return project;
  const original = project.elements[index];
  const duplicate: CanvasElement = {
    ...original,
    id: 'el_' + Math.random().toString(36).substring(2, 9),
    name: `${original.name} (Copy)`,
    props: JSON.parse(JSON.stringify(original.props)),
    styles: JSON.parse(JSON.stringify(original.styles)),
    events: original.events.map((ev) => ({ ...ev, id: 'ev_' + Math.random().toString(36).substring(2, 7) })),
  };

  const elements = [...project.elements];
  elements.splice(index + 1, 0, duplicate);

  return {
    ...project,
    updatedAt: new Date().toISOString(),
    elements,
  };
}

export function reorderElements(project: Project, fromIndex: number, toIndex: number): Project {
  if (fromIndex < 0 || fromIndex >= project.elements.length || toIndex < 0 || toIndex >= project.elements.length) {
    return project;
  }
  const elements = [...project.elements];
  const [removed] = elements.splice(fromIndex, 1);
  elements.splice(toIndex, 0, removed);
  return {
    ...project,
    updatedAt: new Date().toISOString(),
    elements,
  };
}

export function toggleElementVisibility(project: Project, elementId: string): Project {
  return {
    ...project,
    updatedAt: new Date().toISOString(),
    elements: project.elements.map((el) => (el.id === elementId ? { ...el, hidden: !el.hidden } : el)),
  };
}

export function toggleElementLock(project: Project, elementId: string): Project {
  return {
    ...project,
    updatedAt: new Date().toISOString(),
    elements: project.elements.map((el) => (el.id === elementId ? { ...el, locked: !el.locked } : el)),
  };
}

export function addEventToElement(project: Project, elementId: string, event: Omit<CanvasElement['events'][0], 'id'>): Project {
  const newEvent = {
    ...event,
    id: 'ev_' + Math.random().toString(36).substring(2, 7),
  };
  return {
    ...project,
    updatedAt: new Date().toISOString(),
    elements: project.elements.map((el) => {
      if (el.id !== elementId) return el;
      return {
        ...el,
        events: [...el.events, newEvent],
      };
    }),
  };
}

export function removeEventFromElement(project: Project, elementId: string, eventId: string): Project {
  return {
    ...project,
    updatedAt: new Date().toISOString(),
    elements: project.elements.map((el) => {
      if (el.id !== elementId) return el;
      return {
        ...el,
        events: el.events.filter((ev) => ev.id !== eventId),
      };
    }),
  };
}

export function exportProjectToJson(project: Project): string {
  return JSON.stringify(project, null, 2);
}

export function exportProjectToHtml(project: Project): string {
  const elementsHtml = project.elements
    .filter((el) => !el.hidden)
    .map((el) => {
      switch (el.type) {
        case 'heading': {
          const tag = el.props.headingLevel || 'h1';
          const sizeClass = tag === 'h1' ? 'text-3xl' : tag === 'h2' ? 'text-2xl' : 'text-xl';
          return `
      <div class="mb-4">
        <${tag} class="${sizeClass} font-bold text-white tracking-tight">${el.props.text || ''}</${tag}>
        ${el.props.subtext ? `<p class="text-zinc-400 mt-1 text-sm">${el.props.subtext}</p>` : ''}
      </div>`;
        }
        case 'text':
          return `
      <p class="text-zinc-300 text-base mb-4 leading-relaxed">${el.props.text || ''}</p>`;
        case 'button': {
          const bg = el.styles.backgroundColor || '#2563eb';
          const color = el.styles.textColor || '#ffffff';
          const clickAction = el.events.length > 0 ? `onclick="alert('${el.events[0].actionPayload || 'Action fired'}')"` : '';
          return `
      <button ${clickAction} style="background-color: ${bg}; color: ${color};" class="px-5 py-2.5 rounded-lg font-medium text-sm transition hover:opacity-90 inline-block mb-4 shadow">
        ${el.props.text || 'Button'}
      </button>`;
        }
        case 'card':
          return `
      <div class="p-6 rounded-xl border border-zinc-800 bg-zinc-900/80 mb-4 shadow-lg">
        <h3 class="text-lg font-semibold text-white mb-1">${el.props.text || 'Card Title'}</h3>
        <p class="text-zinc-400 text-sm">${el.props.subtext || ''}</p>
      </div>`;
        case 'input':
          return `
      <div class="mb-4">
        <label class="block text-xs font-medium text-zinc-300 mb-1.5">${el.props.label || 'Input'}</label>
        <input type="text" placeholder="${el.props.placeholder || ''}" class="w-full px-3.5 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 text-sm" />
      </div>`;
        case 'textarea':
          return `
      <div class="mb-4">
        <label class="block text-xs font-medium text-zinc-300 mb-1.5">${el.props.label || 'Textarea'}</label>
        <textarea rows="3" placeholder="${el.props.placeholder || ''}" class="w-full px-3.5 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 text-sm"></textarea>
      </div>`;
        case 'select':
          return `
      <div class="mb-4">
        <label class="block text-xs font-medium text-zinc-300 mb-1.5">${el.props.label || 'Select'}</label>
        <select class="w-full px-3.5 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-blue-500 text-sm">
          ${(el.props.options || []).map((opt) => `<option value="${opt}">${opt}</option>`).join('')}
        </select>
      </div>`;
        case 'badge':
          return `
      <div class="mb-4">
        <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          ${el.props.text || 'Badge'}
        </span>
      </div>`;
        case 'metric':
          return `
      <div class="p-5 rounded-xl border border-zinc-800 bg-zinc-900/80 mb-4 shadow">
        <span class="text-xs font-medium text-zinc-400 uppercase tracking-wider">${el.props.metricLabel || 'Metric'}</span>
        <div class="text-3xl font-bold text-white mt-1">${el.props.metricValue || '0'}</div>
        <div class="text-xs text-emerald-400 mt-2 font-medium flex items-center gap-1">
          ↑ ${el.props.metricTrend || ''}
        </div>
      </div>`;
        case 'image':
          return `
      <div class="mb-4 overflow-hidden rounded-xl border border-zinc-800">
        <img src="${el.props.imageUrl || ''}" alt="${el.props.imageAlt || ''}" class="w-full h-48 object-cover" />
      </div>`;
        case 'divider':
          return `
      <hr class="border-zinc-800 my-6" />`;
        case 'toggle':
          return `
      <div class="flex items-center justify-between p-3.5 rounded-lg border border-zinc-800 bg-zinc-900 mb-4">
        <div>
          <div class="text-sm font-medium text-white">${el.props.label || 'Toggle'}</div>
          ${el.props.subtext ? `<div class="text-xs text-zinc-400 mt-0.5">${el.props.subtext}</div>` : ''}
        </div>
        <input type="checkbox" ${el.props.toggleChecked ? 'checked' : ''} class="w-4 h-4 accent-blue-500 rounded cursor-pointer" />
      </div>`;
        case 'table':
          return `
      <div class="border border-zinc-800 rounded-xl overflow-hidden mb-4 bg-zinc-900/60">
        <table class="w-full text-left text-sm text-zinc-300">
          <thead class="bg-zinc-800/80 text-xs uppercase text-zinc-400 font-semibold border-b border-zinc-800">
            <tr>
              ${(el.props.tableHeaders || []).map((h) => `<th class="px-4 py-3">${h}</th>`).join('')}
            </tr>
          </thead>
          <tbody class="divide-y divide-zinc-800">
            ${(el.props.tableRows || [])
              .map(
                (row) => `
              <tr class="hover:bg-zinc-800/30">
                ${row.map((cell) => `<td class="px-4 py-3">${cell}</td>`).join('')}
              </tr>`
              )
              .join('')}
          </tbody>
        </table>
      </div>`;
        default:
          return '';
      }
    })
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${project.name} - Built with AppForge</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-zinc-950 text-zinc-100 min-h-screen py-10 px-4">
  <div class="max-w-3xl mx-auto">
${elementsHtml}
  </div>
</body>
</html>`;
}
