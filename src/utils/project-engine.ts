import { 
  CanvasElement, 
  ComponentProps, 
  ComponentStyles, 
  ComponentType, 
  Page, 
  PageTransition, 
  Project,
  ActionStep,
  ActionCondition,
  ComponentInteraction
} from '../types/editor';

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
    container: {
      direction: 'column',
      gap: 'md',
      wrap: true,
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
      fontFamily: 'sans',
      textColor: '#ffffff',
      textAlign: 'left',
      margin: 'sm',
      width: 'full',
      opacity: 100,
    },
    text: {
      fontSize: 'base',
      fontWeight: 'normal',
      fontFamily: 'sans',
      textColor: '#a1a1aa',
      textAlign: 'left',
      margin: 'xs',
      width: 'full',
      opacity: 100,
    },
    button: {
      fontSize: 'sm',
      fontWeight: 'semibold',
      fontFamily: 'sans',
      padding: 'md',
      borderRadius: 'md',
      width: 'auto',
      backgroundColor: '#3b82f6',
      textColor: '#ffffff',
      shadow: 'sm',
      opacity: 100,
      animationHover: 'lift',
    },
    card: {
      backgroundColor: '#18181b',
      borderColor: '#27272a',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderRadius: 'lg',
      padding: 'lg',
      width: 'full',
      shadow: 'md',
      opacity: 100,
    },
    container: {
      backgroundColor: '#121215',
      borderColor: '#27272a',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderRadius: 'xl',
      padding: 'md',
      width: 'full',
      opacity: 100,
      minHeight: '80px',
    },
    input: {
      fontSize: 'sm',
      backgroundColor: '#18181b',
      borderColor: '#27272a',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderRadius: 'md',
      padding: 'sm',
      textColor: '#ffffff',
      width: 'full',
      opacity: 100,
    },
    textarea: {
      fontSize: 'sm',
      backgroundColor: '#18181b',
      borderColor: '#27272a',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderRadius: 'md',
      padding: 'sm',
      textColor: '#ffffff',
      width: 'full',
      opacity: 100,
    },
    select: {
      fontSize: 'sm',
      backgroundColor: '#18181b',
      borderColor: '#27272a',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderRadius: 'md',
      padding: 'sm',
      textColor: '#ffffff',
      width: 'full',
      opacity: 100,
    },
    badge: {
      fontSize: 'xs',
      fontWeight: 'medium',
      borderRadius: 'full',
      padding: 'xs',
      width: 'auto',
      opacity: 100,
    },
    metric: {
      backgroundColor: '#18181b',
      borderColor: '#27272a',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderRadius: 'lg',
      padding: 'md',
      width: 'full',
      shadow: 'sm',
      opacity: 100,
    },
    image: {
      borderRadius: 'lg',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: '#27272a',
      width: 'full',
      shadow: 'sm',
      opacity: 100,
    },
    divider: {
      borderColor: '#27272a',
      margin: 'md',
      width: 'full',
      opacity: 100,
    },
    toggle: {
      width: 'full',
      margin: 'xs',
      opacity: 100,
    },
    table: {
      backgroundColor: '#18181b',
      borderColor: '#27272a',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderRadius: 'lg',
      padding: 'sm',
      width: 'full',
      opacity: 100,
    },
  };

  const readableNames: Record<ComponentType, string> = {
    heading: 'Heading',
    text: 'Paragraph Text',
    button: 'Action Button',
    card: 'Content Card',
    container: 'Flex Container',
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
    interactions: [],
    children: type === 'container' || type === 'card' ? [] : undefined,
    hidden: false,
    locked: false,
  };
}

// Ensure backwards compatibility with projects that stored flat elements[]
export function ensureProjectPages(project: Project): Project {
  if (project.pages && project.pages.length > 0) {
    const activeExists = project.pages.some((p) => p.id === project.activePageId);
    const homeExists = project.pages.some((p) => p.id === project.homePageId);
    return {
      ...project,
      activePageId: activeExists ? project.activePageId : project.pages[0].id,
      homePageId: homeExists ? project.homePageId : project.pages[0].id,
    };
  }

  // Upgrade legacy project
  const initialElements = project.elements || [];
  const homePage: Page = {
    id: 'page_home',
    name: 'Home',
    path: '/',
    transition: 'fade',
    elements: initialElements,
    canvasBg: project.canvasBg,
  };

  return {
    ...project,
    pages: [homePage],
    activePageId: homePage.id,
    homePageId: homePage.id,
  };
}

export function createInitialProject(name: string, templateId?: string): Project {
  const projectId = 'proj_' + Math.random().toString(36).substring(2, 9);
  const now = new Date().toISOString();

  let homeElements: CanvasElement[] = [];
  let extraPages: Page[] = [];

  if (templateId === 'saas') {
    homeElements = [
      {
        ...createNewElement('badge'),
        props: { text: 'AppForge v2.4 Enterprise', badgeVariant: 'info' },
      },
      {
        ...createNewElement('heading'),
        props: {
          text: 'Executive Analytics Hub',
          headingLevel: 'h1',
          subtext: 'Monitor revenue, customer retention, and operations across global nodes.',
        },
      },
      {
        ...createNewElement('metric'),
        props: {
          metricLabel: 'Monthly Recurring Revenue (MRR)',
          metricValue: '$148,250',
          metricTrend: '+28.4% vs last quarter',
          metricTrendPositive: true,
        },
      },
      {
        ...createNewElement('button'),
        props: { text: 'View Customers Table', buttonVariant: 'primary' },
        interactions: [
          {
            id: 'inter_nav',
            trigger: 'onClick',
            name: 'Navigate to Customers Page',
            steps: [
              {
                id: 'step_toast',
                type: 'toast',
                toastType: 'info',
                toastMessage: 'Opening customer database...',
              },
              {
                id: 'step_nav',
                type: 'navigate',
                targetPageId: 'page_customers',
              },
            ],
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

    extraPages = [
      {
        id: 'page_customers',
        name: 'Customers',
        path: '/customers',
        transition: 'slide-left',
        elements: [
          {
            ...createNewElement('heading'),
            props: {
              text: 'Customer Management Portal',
              headingLevel: 'h2',
              subtext: 'Directory of enterprise accounts and assigned account leads.',
            },
          },
          {
            ...createNewElement('button'),
            props: { text: '← Back to Overview', buttonVariant: 'outline' },
            interactions: [
              {
                id: 'inter_back',
                trigger: 'onClick',
                steps: [
                  {
                    id: 'step_back',
                    type: 'navigate',
                    targetPageId: 'page_home',
                  },
                ],
              },
            ],
          },
          {
            ...createNewElement('table'),
            props: {
              tableHeaders: ['Company', 'Plan', 'Seats', 'Status'],
              tableRows: [
                ['Vanguard Logistics', 'Enterprise Plus', '140', 'Active'],
                ['Helios Capital', 'Scale', '45', 'Active'],
                ['Nova Robotics', 'Developer Pro', '12', 'Trial'],
              ],
            },
          },
        ],
      },
      {
        id: 'page_settings',
        name: 'Settings',
        path: '/settings',
        transition: 'fade',
        elements: [
          {
            ...createNewElement('heading'),
            props: {
              text: 'Platform Configuration',
              headingLevel: 'h2',
              subtext: 'Manage notifications, API access, and workspace roles.',
            },
          },
          {
            ...createNewElement('toggle'),
            props: {
              label: 'Real-time Webhook Streaming',
              toggleChecked: true,
              subtext: 'Stream events directly into your logging pipeline.',
            },
          },
          {
            ...createNewElement('button'),
            props: { text: 'Save Configuration', buttonVariant: 'primary' },
            interactions: [
              {
                id: 'inter_save',
                trigger: 'onClick',
                steps: [
                  {
                    id: 'step_save_toast',
                    type: 'toast',
                    toastType: 'success',
                    toastMessage: 'Workspace preferences saved successfully!',
                  },
                ],
              },
            ],
          },
        ],
      },
    ];
  } else if (templateId === 'contact') {
    homeElements = [
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
        props: { text: 'Submit Request', buttonVariant: 'primary' },
        interactions: [
          {
            id: 'inter_submit',
            trigger: 'onClick',
            steps: [
              {
                id: 'step_submit',
                type: 'submitForm',
                toastMessage: 'Thank you! Your inquiry has been dispatched to our engineering team.',
              },
            ],
          },
        ],
      },
    ];
  } else {
    // Blank template
    homeElements = [
      {
        ...createNewElement('heading'),
        props: {
          text: 'Welcome to ' + (name || 'Your New App'),
          headingLevel: 'h1',
          subtext: 'Start building by adding components from the library or customizing this layout.',
        },
      },
      {
        ...createNewElement('button'),
        props: { text: 'Interactive Action Button', buttonVariant: 'primary' },
        interactions: [
          {
            id: 'inter_init',
            trigger: 'onClick',
            steps: [
              {
                id: 'step_init_toast',
                type: 'toast',
                toastType: 'success',
                toastMessage: 'Success! Action pipeline executed in preview mode.',
              },
            ],
          },
        ],
      },
    ];
  }

  const homePage: Page = {
    id: 'page_home',
    name: 'Home',
    path: '/',
    transition: 'fade',
    elements: homeElements,
    canvasBg: '#0f0f12',
  };

  const pages = [homePage, ...extraPages];

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
    pages,
    activePageId: homePage.id,
    homePageId: homePage.id,
    elements: homeElements, // for legacy fallback
  };
}

// ----------------------------------------------------
// PAGE MANAGEMENT FUNCTIONS
// ----------------------------------------------------

export function getActivePage(project: Project): Page {
  const proj = ensureProjectPages(project);
  return proj.pages.find((p) => p.id === proj.activePageId) || proj.pages[0];
}

export function createPage(project: Project, name: string, path?: string, transition: PageTransition = 'fade'): Project {
  const proj = ensureProjectPages(project);
  const id = 'page_' + Math.random().toString(36).substring(2, 9);
  const cleanPath = path || '/' + name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  const newPage: Page = {
    id,
    name: name.trim() || 'New Screen',
    path: cleanPath,
    transition,
    elements: [
      {
        ...createNewElement('heading'),
        props: { text: name.trim() || 'New Screen', headingLevel: 'h1' },
      },
    ],
    canvasBg: proj.canvasBg,
  };

  return {
    ...proj,
    updatedAt: new Date().toISOString(),
    pages: [...proj.pages, newPage],
    activePageId: id,
  };
}

export function duplicatePage(project: Project, pageId: string): Project {
  const proj = ensureProjectPages(project);
  const target = proj.pages.find((p) => p.id === pageId);
  if (!target) return proj;

  const newId = 'page_' + Math.random().toString(36).substring(2, 9);
  const clonedPage: Page = {
    ...JSON.parse(JSON.stringify(target)),
    id: newId,
    name: `${target.name} (Copy)`,
    path: `${target.path}-copy`,
  };

  const index = proj.pages.findIndex((p) => p.id === pageId);
  const pages = [...proj.pages];
  pages.splice(index + 1, 0, clonedPage);

  return {
    ...proj,
    updatedAt: new Date().toISOString(),
    pages,
    activePageId: newId,
  };
}

export function deletePage(project: Project, pageId: string): Project {
  const proj = ensureProjectPages(project);
  if (proj.pages.length <= 1) return proj; // Cannot delete the last remaining page

  const pages = proj.pages.filter((p) => p.id !== pageId);
  const newActiveId = proj.activePageId === pageId ? pages[0].id : proj.activePageId;
  const newHomeId = proj.homePageId === pageId ? pages[0].id : proj.homePageId;

  return {
    ...proj,
    updatedAt: new Date().toISOString(),
    pages,
    activePageId: newActiveId,
    homePageId: newHomeId,
  };
}

export function renamePage(project: Project, pageId: string, name: string, path?: string): Project {
  const proj = ensureProjectPages(project);
  return {
    ...proj,
    updatedAt: new Date().toISOString(),
    pages: proj.pages.map((p) => {
      if (p.id !== pageId) return p;
      return {
        ...p,
        name: name.trim() || p.name,
        path: path !== undefined ? path : p.path,
      };
    }),
  };
}

export function setHomePage(project: Project, pageId: string): Project {
  const proj = ensureProjectPages(project);
  return {
    ...proj,
    updatedAt: new Date().toISOString(),
    homePageId: pageId,
  };
}

export function switchActivePage(project: Project, pageId: string): Project {
  const proj = ensureProjectPages(project);
  return {
    ...proj,
    activePageId: pageId,
  };
}

export function updatePageTransition(project: Project, pageId: string, transition: PageTransition): Project {
  const proj = ensureProjectPages(project);
  return {
    ...proj,
    updatedAt: new Date().toISOString(),
    pages: proj.pages.map((p) => (p.id === pageId ? { ...p, transition } : p)),
  };
}

// ----------------------------------------------------
// NESTED ELEMENT TREE TRAVERSAL & MUTATIONS
// ----------------------------------------------------

export function findElementDeep(elements: CanvasElement[], id: string): CanvasElement | null {
  for (const el of elements) {
    if (el.id === id) return el;
    if (el.children && el.children.length > 0) {
      const found = findElementDeep(el.children, id);
      if (found) return found;
    }
  }
  return null;
}

export function updateElementDeep(
  elements: CanvasElement[], 
  id: string, 
  updates: Partial<CanvasElement>
): CanvasElement[] {
  return elements.map((el) => {
    if (el.id === id) {
      return {
        ...el,
        ...updates,
        props: { ...el.props, ...(updates.props || {}) },
        styles: { ...el.styles, ...(updates.styles || {}) },
      };
    }
    if (el.children && el.children.length > 0) {
      return {
        ...el,
        children: updateElementDeep(el.children, id, updates),
      };
    }
    return el;
  });
}

export function deleteElementDeep(elements: CanvasElement[], id: string): CanvasElement[] {
  return elements
    .filter((el) => el.id !== id)
    .map((el) => {
      if (el.children && el.children.length > 0) {
        return {
          ...el,
          children: deleteElementDeep(el.children, id),
        };
      }
      return el;
    });
}

export function duplicateElementDeep(elements: CanvasElement[], id: string): CanvasElement[] {
  const result: CanvasElement[] = [];

  for (const el of elements) {
    result.push(el);
    if (el.id === id) {
      const duplicate: CanvasElement = {
        ...JSON.parse(JSON.stringify(el)),
        id: 'el_' + Math.random().toString(36).substring(2, 9),
        name: `${el.name} (Copy)`,
      };
      result.push(duplicate);
    } else if (el.children && el.children.length > 0) {
      el.children = duplicateElementDeep(el.children, id);
    }
  }

  return result;
}

export function reorderElementsDeep(
  elements: CanvasElement[], 
  fromIndex: number, 
  toIndex: number
): CanvasElement[] {
  if (fromIndex < 0 || fromIndex >= elements.length || toIndex < 0 || toIndex >= elements.length) {
    return elements;
  }
  const cloned = [...elements];
  const [removed] = cloned.splice(fromIndex, 1);
  cloned.splice(toIndex, 0, removed);
  return cloned;
}

// Group selected elements into a new Flex Container
export function groupElementsIntoContainer(
  elements: CanvasElement[], 
  elementIds: string[]
): CanvasElement[] {
  if (elementIds.length === 0) return elements;

  const targetElements: CanvasElement[] = [];
  const remainingElements: CanvasElement[] = [];

  for (const el of elements) {
    if (elementIds.includes(el.id)) {
      targetElements.push(el);
    } else {
      remainingElements.push(el);
    }
  }

  if (targetElements.length === 0) return elements;

  const container = createNewElement('container');
  container.name = 'Group Container';
  container.children = targetElements;

  // Insert container at index of first matched element
  const firstIndex = elements.findIndex((el) => elementIds.includes(el.id));
  const insertIndex = firstIndex >= 0 ? firstIndex : remainingElements.length;
  remainingElements.splice(insertIndex, 0, container);

  return remainingElements;
}

// Ungroup container: lifts its children into parent list
export function ungroupContainer(
  elements: CanvasElement[], 
  containerId: string
): CanvasElement[] {
  const result: CanvasElement[] = [];

  for (const el of elements) {
    if (el.id === containerId && el.children && el.children.length > 0) {
      result.push(...el.children);
    } else {
      if (el.children && el.children.length > 0) {
        el.children = ungroupContainer(el.children, containerId);
      }
      result.push(el);
    }
  }

  return result;
}

// ----------------------------------------------------
// PROJECT-LEVEL WRAPPERS (TARGETING ACTIVE PAGE)
// ----------------------------------------------------

export function addElement(
  project: Project, 
  element: CanvasElement, 
  targetContainerId?: string | null,
  targetIndex?: number
): Project {
  const proj = ensureProjectPages(project);
  const activePage = getActivePage(proj);

  let newElements: CanvasElement[];

  if (targetContainerId) {
    // Add inside specific container
    newElements = updateElementDeep(activePage.elements, targetContainerId, {
      children: [
        ...(findElementDeep(activePage.elements, targetContainerId)?.children || []),
        element,
      ],
    });
  } else {
    // Add to root page elements
    newElements = [...activePage.elements];
    if (typeof targetIndex === 'number' && targetIndex >= 0 && targetIndex <= newElements.length) {
      newElements.splice(targetIndex, 0, element);
    } else {
      newElements.push(element);
    }
  }

  const updatedPages = proj.pages.map((p) =>
    p.id === activePage.id ? { ...p, elements: newElements } : p
  );

  return {
    ...proj,
    updatedAt: new Date().toISOString(),
    pages: updatedPages,
    elements: newElements,
  };
}

export function updateElement(
  project: Project, 
  elementId: string, 
  updates: Partial<CanvasElement>
): Project {
  const proj = ensureProjectPages(project);
  const activePage = getActivePage(proj);

  const newElements = updateElementDeep(activePage.elements, elementId, updates);
  const updatedPages = proj.pages.map((p) =>
    p.id === activePage.id ? { ...p, elements: newElements } : p
  );

  return {
    ...proj,
    updatedAt: new Date().toISOString(),
    pages: updatedPages,
    elements: newElements,
  };
}

export function deleteElement(project: Project, elementId: string): Project {
  const proj = ensureProjectPages(project);
  const activePage = getActivePage(proj);

  const newElements = deleteElementDeep(activePage.elements, elementId);
  const updatedPages = proj.pages.map((p) =>
    p.id === activePage.id ? { ...p, elements: newElements } : p
  );

  return {
    ...proj,
    updatedAt: new Date().toISOString(),
    pages: updatedPages,
    elements: newElements,
  };
}

export function duplicateElement(project: Project, elementId: string): Project {
  const proj = ensureProjectPages(project);
  const activePage = getActivePage(proj);

  const newElements = duplicateElementDeep(activePage.elements, elementId);
  const updatedPages = proj.pages.map((p) =>
    p.id === activePage.id ? { ...p, elements: newElements } : p
  );

  return {
    ...proj,
    updatedAt: new Date().toISOString(),
    pages: updatedPages,
    elements: newElements,
  };
}

export function reorderElements(
  project: Project, 
  fromIndex: number, 
  toIndex: number
): Project {
  const proj = ensureProjectPages(project);
  const activePage = getActivePage(proj);

  const newElements = reorderElementsDeep(activePage.elements, fromIndex, toIndex);
  const updatedPages = proj.pages.map((p) =>
    p.id === activePage.id ? { ...p, elements: newElements } : p
  );

  return {
    ...proj,
    updatedAt: new Date().toISOString(),
    pages: updatedPages,
    elements: newElements,
  };
}

export function toggleElementVisibility(project: Project, elementId: string): Project {
  const target = findElementDeep(getActivePage(project).elements, elementId);
  if (!target) return project;
  return updateElement(project, elementId, { hidden: !target.hidden });
}

export function toggleElementLock(project: Project, elementId: string): Project {
  const target = findElementDeep(getActivePage(project).elements, elementId);
  if (!target) return project;
  return updateElement(project, elementId, { locked: !target.locked });
}

// ----------------------------------------------------
// ACTION BUILDER HELPERS
// ----------------------------------------------------

export function createDefaultActionStep(type: ActionStep['type']): ActionStep {
  const id = 'step_' + Math.random().toString(36).substring(2, 8);
  switch (type) {
    case 'navigate':
      return { id, type, label: 'Navigate to Screen', targetPageId: 'page_home' };
    case 'toast':
      return { id, type, label: 'Show Notification', toastType: 'success', toastMessage: 'Action executed successfully!' };
    case 'openModal':
      return { id, type, label: 'Open Popup Modal', modalTitle: 'Popup Dialog', modalContent: 'This modal was opened by an AppForge action trigger.' };
    case 'closeModal':
      return { id, type, label: 'Close Active Popup' };
    case 'submitForm':
      return { id, type, label: 'Submit Form', toastMessage: 'Form validated and submitted successfully!' };
    case 'toggleVisibility':
      return { id, type, label: 'Toggle Element Visibility', targetElementId: '' };
    case 'setText':
      return { id, type, label: 'Update Text Value', targetElementId: '', textValue: 'Updated content' };
    case 'downloadFile':
      return { id, type, label: 'Download File', fileName: 'export-data.json', fileData: '{"status":"exported","timestamp":"now"}' };
    case 'condition':
      return {
        id,
        type,
        label: 'Conditional Branch (IF / ELSE)',
        condition: { field: 'input', operator: 'isNotEmpty', value: '' },
        thenActions: [
          { id: 'sub_then', type: 'toast', toastType: 'success', toastMessage: 'Condition met (True)!' }
        ],
        elseActions: [
          { id: 'sub_else', type: 'toast', toastType: 'warning', toastMessage: 'Condition not met (False)!' }
        ],
      };
    default:
      return { id, type, label: 'Notification', toastType: 'info', toastMessage: 'Action triggered' };
  }
}

export function evaluateCondition(
  condition: ActionCondition | undefined, 
  formValues: Record<string, any>
): boolean {
  if (!condition) return true;
  const val = formValues[condition.field] !== undefined ? String(formValues[condition.field]) : '';

  switch (condition.operator) {
    case 'isNotEmpty':
      return val.trim().length > 0;
    case 'isEmpty':
      return val.trim().length === 0;
    case 'equals':
      return val.trim().toLowerCase() === condition.value.trim().toLowerCase();
    case 'notEquals':
      return val.trim().toLowerCase() !== condition.value.trim().toLowerCase();
    case 'contains':
      return val.toLowerCase().includes(condition.value.toLowerCase());
    default:
      return true;
  }
}

// ----------------------------------------------------
// EXPORT GENERATION
// ----------------------------------------------------

export function exportProjectToJson(project: Project): string {
  return JSON.stringify(ensureProjectPages(project), null, 2);
}

export function exportProjectToHtml(project: Project): string {
  const proj = ensureProjectPages(project);

  const pagesJson = JSON.stringify(proj.pages);
  const homePageId = proj.homePageId;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${proj.name} - Built with AppForge</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    .page-fade { animation: fadeIn 0.25s ease-in-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
  </style>
</head>
<body class="bg-zinc-950 text-zinc-100 min-h-screen py-8 px-4 font-sans">
  <!-- AppForge Multi-Page Runner -->
  <div class="max-w-4xl mx-auto">
    <!-- Screen Header Nav -->
    <header class="flex items-center justify-between pb-4 mb-6 border-b border-zinc-800">
      <div class="flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
        <h1 class="text-sm font-bold tracking-tight text-white">${proj.name}</h1>
      </div>
      <div id="nav-pills" class="flex items-center gap-1.5"></div>
    </header>

    <!-- Page Target Canvas -->
    <main id="app-canvas" class="page-fade"></main>
  </div>

  <!-- Toast Notification Overlay -->
  <div id="toast-container" class="fixed bottom-6 right-6 z-50 flex flex-col gap-2"></div>

  <!-- Modal Dialog Container -->
  <div id="modal-container" class="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 hidden">
    <div class="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl">
      <h3 id="modal-title" class="text-base font-semibold text-white mb-2"></h3>
      <p id="modal-body" class="text-xs text-zinc-400 mb-6 leading-relaxed"></p>
      <div class="flex justify-end">
        <button onclick="closeModal()" class="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white">Close</button>
      </div>
    </div>
  </div>

  <script>
    const pages = ${pagesJson};
    let activePageId = '${homePageId}';

    function showToast(message, type = 'info') {
      const c = document.getElementById('toast-container');
      const t = document.createElement('div');
      const border = type === 'success' ? 'border-emerald-500/50' : type === 'error' ? 'border-red-500/50' : 'border-blue-500/50';
      t.className = 'p-3 rounded-xl bg-zinc-900 border ' + border + ' text-white text-xs shadow-xl page-fade';
      t.innerText = message;
      c.appendChild(t);
      setTimeout(() => t.remove(), 4000);
    }

    function openModal(title, content) {
      document.getElementById('modal-title').innerText = title || 'Popup';
      document.getElementById('modal-body').innerText = content || '';
      document.getElementById('modal-container').classList.remove('hidden');
    }

    function closeModal() {
      document.getElementById('modal-container').classList.add('hidden');
    }

    function navigateToPage(pageId) {
      const page = pages.find(p => p.id === pageId);
      if (!page) return;
      activePageId = pageId;
      renderApp();
      showToast('Navigated to: ' + page.name);
    }

    function renderNav() {
      const nav = document.getElementById('nav-pills');
      nav.innerHTML = pages.map(p => 
        '<button onclick="navigateToPage(\\'' + p.id + '\\')" class="px-2.5 py-1 rounded-lg text-xs font-medium ' +
        (p.id === activePageId ? 'bg-blue-600 text-white' : 'bg-zinc-900 text-zinc-400 hover:text-white') +
        '">' + p.name + '</button>'
      ).join('');
    }

    function renderElements(elements) {
      return elements.map(el => {
        if (el.hidden) return '';
        switch (el.type) {
          case 'heading':
            return '<div class="mb-4"><h1 class="text-3xl font-bold text-white tracking-tight">' + (el.props.text || '') + '</h1>' +
              (el.props.subtext ? '<p class="text-zinc-400 mt-1 text-sm">' + el.props.subtext + '</p>' : '') + '</div>';
          case 'text':
            return '<p class="text-zinc-300 text-sm mb-4 leading-relaxed">' + (el.props.text || '') + '</p>';
          case 'button':
            return '<button onclick="handleButtonClick(\\'' + el.id + '\\')" style="background-color: ' + (el.styles.backgroundColor || '#3b82f6') + ';" class="px-5 py-2.5 rounded-lg text-sm font-semibold text-white shadow-md hover:opacity-90 inline-block mb-4 transition">' + (el.props.text || 'Button') + '</button>';
          case 'card':
            return '<div class="p-5 rounded-xl border border-zinc-800 bg-zinc-900 mb-4 shadow"><h4 class="text-base font-semibold text-white mb-1">' + (el.props.text || 'Card Title') + '</h4><p class="text-xs text-zinc-400">' + (el.props.subtext || '') + '</p></div>';
          case 'metric':
            return '<div class="p-5 rounded-xl border border-zinc-800 bg-zinc-900 mb-4 shadow"><span class="text-xs text-zinc-400 uppercase">' + (el.props.metricLabel || 'KPI') + '</span><div class="text-2xl font-bold text-white mt-1">' + (el.props.metricValue || '0') + '</div></div>';
          case 'divider':
            return '<hr class="border-zinc-800 my-4" />';
          case 'table':
            return '<div class="border border-zinc-800 rounded-xl overflow-hidden mb-4"><table class="w-full text-left text-xs text-zinc-300"><thead class="bg-zinc-800 text-zinc-400 uppercase"><tr>' +
              (el.props.tableHeaders || []).map(h => '<th class="px-3.5 py-2">' + h + '</th>').join('') +
              '</tr></thead><tbody>' +
              (el.props.tableRows || []).map(r => '<tr class="border-t border-zinc-800">' + r.map(c => '<td class="px-3.5 py-2">' + c + '</td>').join('') + '</tr>').join('') +
              '</tbody></table></div>';
          default:
            return '';
        }
      }).join('\\n');
    }

    function handleButtonClick(elementId) {
      const page = pages.find(p => p.id === activePageId);
      const el = page.elements.find(e => e.id === elementId);
      if (!el || !el.interactions || el.interactions.length === 0) {
        showToast('Button clicked!');
        return;
      }
      el.interactions[0].steps.forEach(step => {
        if (step.type === 'toast') showToast(step.toastMessage, step.toastType);
        if (step.type === 'navigate' && step.targetPageId) navigateToPage(step.targetPageId);
        if (step.type === 'openModal') openModal(step.modalTitle, step.modalContent);
      });
    }

    function renderApp() {
      const page = pages.find(p => p.id === activePageId) || pages[0];
      renderNav();
      document.getElementById('app-canvas').innerHTML = renderElements(page.elements);
    }

    renderApp();
  </script>
</body>
</html>`;
}
