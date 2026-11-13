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
  ComponentInteraction,
  AlignmentType
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
    navbar: {
      brandName: 'AppForge Studio',
      direction: 'row',
      gap: 'md',
      navLinks: [
        { label: 'Home' },
        { label: 'Features' },
        { label: 'Pricing' },
      ],
      ctaLabel: 'Open Studio',
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
    navbar: {
      backgroundColor: '#121215',
      borderColor: '#27272a',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderRadius: 'lg',
      padding: 'sm',
      width: 'full',
      textColor: '#ffffff',
      opacity: 100,
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
    navbar: 'Navigation Bar',
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
    children: type === 'container' || type === 'card' || type === 'navbar' ? [] : undefined,
    hidden: false,
    locked: false,
  };
}

// Ensure backwards compatibility with projects that stored flat elements[] and data collections
export function ensureProjectPages(project: Project): Project {
  const defaultCollections = project.collections && project.collections.length > 0 ? project.collections : [
    {
      id: 'col_users',
      name: 'Users',
      description: 'Application user directory and member profiles',
      fields: [
        { id: 'f_name', name: 'Full Name', type: 'text' as const, required: true },
        { id: 'f_email', name: 'Email Address', type: 'email' as const, required: true },
        { id: 'f_role', name: 'Role', type: 'text' as const },
        { id: 'f_status', name: 'Status', type: 'status' as const },
      ],
      records: [
        { id: 'rec_1', f_name: 'Alex Rivera', f_email: 'alex@appforge.io', f_role: 'Administrator', f_status: 'Active' },
        { id: 'rec_2', f_name: 'Elena Rostova', f_email: 'elena@client.com', f_role: 'Product Lead', f_status: 'Active' },
        { id: 'rec_3', f_name: 'Marcus Chen', f_email: 'marcus@partner.org', f_role: 'Analyst', f_status: 'Pending' },
      ],
    },
    {
      id: 'col_products',
      name: 'Products & Inventory',
      description: 'Product catalog, pricing tiers, and stock availability',
      fields: [
        { id: 'f_title', name: 'Product Name', type: 'text' as const, required: true },
        { id: 'f_price', name: 'Price ($)', type: 'number' as const, required: true },
        { id: 'f_stock', name: 'Stock Count', type: 'number' as const },
        { id: 'f_category', name: 'Category', type: 'text' as const },
      ],
      records: [
        { id: 'rec_p1', f_title: 'Enterprise Platform Pro', f_price: 199, f_stock: 500, f_category: 'Software' },
        { id: 'rec_p2', f_title: 'Custom Integration Setup', f_price: 850, f_stock: 25, f_category: 'Services' },
        { id: 'rec_p3', f_title: 'Dedicated Cloud Relay 1TB', f_price: 49, f_stock: 1200, f_category: 'Cloud' },
      ],
    },
  ];

  const defaultVariables = project.variables && project.variables.length > 0 ? project.variables : [
    { id: 'var_app_title', name: 'appName', type: 'string' as const, defaultValue: 'AppForge Platform', currentValue: 'AppForge Platform' },
    { id: 'var_auth_state', name: 'isAuthenticated', type: 'boolean' as const, defaultValue: true, currentValue: true },
    { id: 'var_cart_total', name: 'cartTotal', type: 'number' as const, defaultValue: 0, currentValue: 199 },
  ];

  if (project.pages && project.pages.length > 0) {
    const activeExists = project.pages.some((p) => p.id === project.activePageId);
    const homeExists = project.pages.some((p) => p.id === project.homePageId);
    return {
      ...project,
      activePageId: activeExists ? project.activePageId : project.pages[0].id,
      homePageId: homeExists ? project.homePageId : project.pages[0].id,
      collections: defaultCollections,
      variables: defaultVariables,
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
    collections: defaultCollections,
    variables: defaultVariables,
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
  } else if (templateId === 'practice') {
    homeElements = [
      {
        ...createNewElement('badge'),
        props: { text: '🎯 Guided Practice Project', badgeVariant: 'info' },
      },
      {
        ...createNewElement('heading'),
        props: {
          text: 'Learn AppForge in 5 Minutes',
          headingLevel: 'h1',
          subtext: 'Follow the 6 interactive missions on your screen to master drag-and-drop, multi-page links, and instant preview.',
        },
      },
      {
        ...createNewElement('button'),
        name: 'Profile Navigation Button',
        props: { 
          text: 'Go to My Profile →', 
          buttonVariant: 'primary',
          whenClicked: 'none',
        },
      },
      {
        ...createNewElement('text'),
        props: {
          text: '💡 Tip: Select the button above, open the Props tab on the right, and set "When Clicked" to "Open Page" -> "Profile".',
        },
        styles: {
          fontSize: 'sm',
          textColor: '#93c5fd',
        },
      },
    ];
  } else if (templateId === 'portfolio') {
    homeElements = [
      {
        ...createNewElement('navbar'),
        props: {
          brandName: name || 'Alex Rivera',
          direction: 'row',
          navLinks: [
            { label: 'Work', targetPageId: 'page_home' },
            { label: 'Contact', targetPageId: 'page_contact' },
          ],
          ctaLabel: 'Hire Me',
          ctaTargetPageId: 'page_contact',
        },
      },
      {
        ...createNewElement('heading'),
        props: {
          text: 'Product Designer & Systems Architect',
          headingLevel: 'h1',
          subtext: 'Designing resilient web applications, developer tools, and editorial software interfaces.',
        },
      },
      {
        ...createNewElement('card'),
        props: {
          text: 'Featured Case Study — Cloud Telemetry Console',
          subtext: 'Reduced incident triage latency by 42% through structured spatial layouts.',
        },
      },
      {
        ...createNewElement('button'),
        props: { text: 'Start a Project Inquiry', buttonVariant: 'primary', whenClicked: 'openPage', targetPageId: 'page_contact' },
      },
    ];
    extraPages = [
      {
        id: 'page_contact',
        name: 'Contact',
        path: '/contact',
        transition: 'fade',
        elements: [
          {
            ...createNewElement('heading'),
            props: { text: 'Book a Consultation', headingLevel: 'h2', subtext: 'Share your timeline and project goals.' },
          },
          { ...createNewElement('input'), props: { label: 'Your Email', placeholder: 'you@company.com' } },
          { ...createNewElement('textarea'), props: { label: 'Project Scope', placeholder: 'Tell me about your product...' } },
          {
            ...createNewElement('button'),
            props: { text: 'Send Inquiry', buttonVariant: 'primary', whenClicked: 'submitForm' },
          },
        ],
      },
    ];
  } else if (templateId === 'shop') {
    homeElements = [
      {
        ...createNewElement('navbar'),
        props: {
          brandName: name || 'Atelier Goods',
          direction: 'row',
          navLinks: [
            { label: 'Catalog', targetPageId: 'page_home' },
            { label: 'Checkout', targetPageId: 'page_checkout' },
          ],
          ctaLabel: 'Cart (1)',
          ctaTargetPageId: 'page_checkout',
        },
      },
      {
        ...createNewElement('heading'),
        props: {
          text: 'Precision Hardware & Studio Tools',
          headingLevel: 'h1',
          subtext: 'Small-batch industrial instruments engineered for daily creative work.',
        },
      },
      {
        ...createNewElement('card'),
        props: {
          text: 'Monolith Wireless Headphones — $249',
          subtext: 'Acoustic isolation, 40-hour battery life, milled aluminum frame.',
        },
      },
      {
        ...createNewElement('button'),
        props: { text: 'Proceed to Checkout →', buttonVariant: 'primary', whenClicked: 'openPage', targetPageId: 'page_checkout' },
      },
    ];
    extraPages = [
      {
        id: 'page_checkout',
        name: 'Checkout',
        path: '/checkout',
        transition: 'slide-left',
        elements: [
          { ...createNewElement('heading'), props: { text: 'Order Checkout', headingLevel: 'h2', subtext: 'Complete your order securely.' } },
          { ...createNewElement('input'), props: { label: 'Shipping Email', placeholder: 'buyer@example.com' } },
          { ...createNewElement('button'), props: { text: 'Confirm Order', buttonVariant: 'primary', whenClicked: 'submitForm' } },
        ],
      },
    ];
  } else if (templateId === 'mobile') {
    homeElements = [
      {
        ...createNewElement('badge'),
        props: { text: '📱 Mobile Native Experience', badgeVariant: 'info' },
      },
      {
        ...createNewElement('heading'),
        props: {
          text: 'Pocket Commerce',
          headingLevel: 'h2',
          subtext: 'Discover curated digital goods and manage your mobile wallet.',
        },
      },
      {
        ...createNewElement('card'),
        name: 'Product Card',
        props: {
          text: 'Premium Member Pass',
          title: 'Premium Member Pass',
          subtext: 'Instant access to all digital tools and fast checkouts.',
        },
      },
      {
        ...createNewElement('button'),
        name: 'Mobile Action Button',
        props: { 
          text: 'View Pass Details', 
          buttonVariant: 'primary',
          whenClicked: 'showToast',
          toastMessage: 'Pass details loaded!',
        },
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

/**
 * Reorders an element among its immediate siblings (root OR inside a nested Container/Card/Navbar)
 * without changing its parent or detaching any nested children (CR-PROJ-08).
 */
export function reorderElementInTree(
  elements: CanvasElement[],
  elementId: string,
  direction: 'up' | 'down'
): CanvasElement[] {
  const idx = elements.findIndex((el) => el.id === elementId);
  if (idx >= 0) {
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    return reorderElementsDeep(elements, idx, targetIdx);
  }
  return elements.map((el) => {
    if (el.children && el.children.length > 0) {
      return {
        ...el,
        children: reorderElementInTree(el.children, elementId, direction),
      };
    }
    return el;
  });
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
  // Locate which page owns this element
  const owningPage = proj.pages.find((p) => findElementDeep(p.elements, elementId) !== null);
  const targetPageId = owningPage ? owningPage.id : proj.activePageId;

  const updatedPages = proj.pages.map((p) => {
    if (p.id !== targetPageId) return p;
    return {
      ...p,
      elements: updateElementDeep(p.elements, elementId, updates),
    };
  });

  const activePage = updatedPages.find((p) => p.id === proj.activePageId) || updatedPages[0];

  return {
    ...proj,
    updatedAt: new Date().toISOString(),
    pages: updatedPages,
    elements: activePage.elements,
  };
}

export function deleteElement(project: Project, elementId: string): Project {
  const proj = ensureProjectPages(project);
  const owningPage = proj.pages.find((p) => findElementDeep(p.elements, elementId) !== null);
  const targetPageId = owningPage ? owningPage.id : proj.activePageId;

  const updatedPages = proj.pages.map((p) => {
    if (p.id !== targetPageId) return p;
    return {
      ...p,
      elements: deleteElementDeep(p.elements, elementId),
    };
  });

  const activePage = updatedPages.find((p) => p.id === proj.activePageId) || updatedPages[0];

  return {
    ...proj,
    updatedAt: new Date().toISOString(),
    pages: updatedPages,
    elements: activePage.elements,
  };
}

export function duplicateElement(project: Project, elementId: string): Project {
  const proj = ensureProjectPages(project);
  const owningPage = proj.pages.find((p) => findElementDeep(p.elements, elementId) !== null);
  const targetPageId = owningPage ? owningPage.id : proj.activePageId;

  const updatedPages = proj.pages.map((p) => {
    if (p.id !== targetPageId) return p;
    return {
      ...p,
      elements: duplicateElementDeep(p.elements, elementId),
    };
  });

  const activePage = updatedPages.find((p) => p.id === proj.activePageId) || updatedPages[0];

  return {
    ...proj,
    updatedAt: new Date().toISOString(),
    pages: updatedPages,
    elements: activePage.elements,
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

export function reorderElementInProject(
  project: Project,
  elementId: string,
  direction: 'up' | 'down'
): Project {
  const proj = ensureProjectPages(project);
  const activePage = getActivePage(proj);

  const newElements = reorderElementInTree(activePage.elements, elementId, direction);
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
  const proj = ensureProjectPages(project);
  for (const p of proj.pages) {
    const target = findElementDeep(p.elements, elementId);
    if (target) {
      return updateElement(project, elementId, { hidden: !target.hidden });
    }
  }
  return project;
}

export function toggleElementLock(project: Project, elementId: string): Project {
  const proj = ensureProjectPages(project);
  for (const p of proj.pages) {
    const target = findElementDeep(p.elements, elementId);
    if (target) {
      return updateElement(project, elementId, { locked: !target.locked });
    }
  }
  return project;
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

export function escapeHtml(str: unknown): string {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function sanitizeUrl(raw: unknown): string {
  const s = String(raw ?? '').trim();
  if (!s) return '#';
  if (s.startsWith('/') || s.startsWith('#') || s.startsWith('https://') || s.startsWith('http://') || s.startsWith('data:image/')) {
    return s;
  }
  return '#';
}

export function exportProjectToHtml(project: Project): string {
  const proj = ensureProjectPages(project);

  const safeProjectName = escapeHtml(proj.name);
  const pagesJson = JSON.stringify(proj.pages).replace(/<\//g, '<\\/');
  const homePageId = escapeHtml(proj.homePageId);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeProjectName} - Built with AppForge</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    .page-fade { animation: fadeIn 0.25s ease-in-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
  </style>
</head>
<body class="bg-zinc-950 text-zinc-100 min-h-screen py-8 px-4 font-sans">
  <div class="max-w-4xl mx-auto">
    <header class="flex items-center justify-between pb-4 mb-6 border-b border-zinc-800">
      <div class="flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
        <h1 class="text-sm font-bold tracking-tight text-white">${safeProjectName}</h1>
      </div>
      <nav id="nav-pills" class="flex items-center gap-1.5"></nav>
    </header>

    <main id="app-canvas" class="page-fade space-y-4"></main>
  </div>

  <div id="toast-container" class="fixed bottom-6 right-6 z-50 flex flex-col gap-2"></div>

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
    const formState = {};

    function esc(v) {
      return String(v ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
    }

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

    function findDeep(list, id) {
      for (const item of list || []) {
        if (item.id === id) return item;
        if (item.children) {
          const found = findDeep(item.children, id);
          if (found) return found;
        }
      }
      return null;
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
        '<button onclick="navigateToPage(\\'' + esc(p.id) + '\\')" class="px-2.5 py-1 rounded-lg text-xs font-medium ' +
        (p.id === activePageId ? 'bg-blue-600 text-white' : 'bg-zinc-900 text-zinc-400 hover:text-white') +
        '">' + esc(p.name) + '</button>'
      ).join('');
    }

    function renderElements(elements) {
      return (elements || []).map(el => {
        if (el.hidden) return '';
        const p = el.props || {};
        const s = el.styles || {};
        const childHtml = el.children && el.children.length ? renderElements(el.children) : '';
        switch (el.type) {
          case 'navbar':
            return '<nav class="w-full px-4 py-3 rounded-xl border border-zinc-800 bg-zinc-900/90 flex items-center justify-between gap-4 mb-4">' +
              '<span class="font-bold text-sm text-white">' + esc(p.brandName || 'AppForge') + '</span>' +
              '<div class="flex items-center gap-3">' +
              (p.navLinks || []).map(l => '<button onclick="' + (l.targetPageId ? 'navigateToPage(\\'' + esc(l.targetPageId) + '\\')' : '') + '" class="text-xs text-zinc-300 hover:text-white">' + esc(l.label) + '</button>').join('') +
              '</div>' +
              (p.ctaLabel ? '<button onclick="handleButtonClick(\\'' + esc(el.id) + '\\')" class="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold">' + esc(p.ctaLabel) + '</button>' : '') +
              '</nav>';
          case 'container':
          case 'card': {
            const isRow = p.direction === 'row';
            return '<div style="background-color:' + esc(s.backgroundColor || (el.type === 'card' ? '#18181b' : '#121215')) + ';" class="p-5 rounded-xl border border-zinc-800 mb-4 flex ' + (isRow ? 'flex-row flex-wrap items-center gap-4' : 'flex-col gap-3') + '">' +
              (p.text ? '<div class="w-full"><h4 class="text-base font-semibold text-white mb-1">' + esc(p.text) + '</h4>' + (p.subtext ? '<p class="text-xs text-zinc-400">' + esc(p.subtext) + '</p>' : '') + '</div>' : '') +
              childHtml + '</div>';
          }
          case 'heading': {
            const tag = p.headingLevel === 'h2' ? 'h2' : p.headingLevel === 'h3' ? 'h3' : 'h1';
            return '<div class="mb-3"><' + tag + ' class="text-3xl font-bold text-white tracking-tight">' + esc(p.text || '') + '</' + tag + '>' +
              (p.subtext ? '<p class="text-zinc-400 mt-1 text-sm">' + esc(p.subtext) + '</p>' : '') + '</div>';
          }
          case 'text':
            return '<p class="text-zinc-300 text-sm mb-3 leading-relaxed">' + esc(p.text || '') + '</p>';
          case 'badge':
            return '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2">' + esc(p.text || 'Badge') + '</span>';
          case 'button':
            return '<button onclick="handleButtonClick(\\'' + esc(el.id) + '\\')" style="background-color:' + esc(s.backgroundColor || '#3b82f6') + ';" class="px-5 py-2.5 rounded-lg text-sm font-semibold text-white shadow-md hover:opacity-90 inline-block mb-3 transition cursor-pointer">' + esc(p.text || 'Button') + '</button>';
          case 'input':
            return '<div class="w-full mb-3">' + (p.label ? '<label class="block text-xs font-semibold uppercase text-zinc-300 mb-1">' + esc(p.label) + '</label>' : '') + '<input oninput="formState[\\'' + esc(el.id) + '\\']=this.value" placeholder="' + esc(p.placeholder || '') + '" class="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white" /></div>';
          case 'textarea':
            return '<div class="w-full mb-3">' + (p.label ? '<label class="block text-xs font-semibold uppercase text-zinc-300 mb-1">' + esc(p.label) + '</label>' : '') + '<textarea rows="3" oninput="formState[\\'' + esc(el.id) + '\\']=this.value" placeholder="' + esc(p.placeholder || '') + '" class="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white"></textarea></div>';
          case 'image':
            return '<div class="w-full overflow-hidden rounded-xl border border-zinc-800 mb-3"><img src="' + esc(p.imageUrl || '') + '" alt="' + esc(p.imageAlt || 'Media') + '" class="w-full h-48 object-cover" /></div>';
          case 'metric':
            return '<div class="p-5 rounded-xl border border-zinc-800 bg-zinc-900 mb-3 shadow"><span class="text-xs text-zinc-400 uppercase">' + esc(p.metricLabel || 'KPI') + '</span><div class="text-2xl font-bold text-white mt-1">' + esc(p.metricValue || '0') + '</div></div>';
          case 'divider':
            return '<hr class="border-zinc-800 my-4" />';
          case 'table':
            return '<div class="border border-zinc-800 rounded-xl overflow-hidden mb-4"><table class="w-full text-left text-xs text-zinc-300"><thead class="bg-zinc-800 text-zinc-400 uppercase"><tr>' +
              (p.tableHeaders || []).map(h => '<th class="px-3.5 py-2">' + esc(h) + '</th>').join('') +
              '</tr></thead><tbody>' +
              (p.tableRows || []).map(r => '<tr class="border-t border-zinc-800">' + r.map(c => '<td class="px-3.5 py-2">' + esc(c) + '</td>').join('') + '</tr>').join('') +
              '</tbody></table></div>';
          default:
            return '';
        }
      }).join('\\n');
    }

    function handleButtonClick(elementId) {
      const page = pages.find(p => p.id === activePageId);
      const el = findDeep(page.elements, elementId);
      if (!el) return;
      const p = el.props || {};
      if (p.whenClicked === 'openPage' && p.targetPageId) { navigateToPage(p.targetPageId); return; }
      if (p.whenClicked === 'showToast') { showToast(p.toastMessage || 'Action executed!', 'success'); return; }
      if (p.whenClicked === 'showPopup') { openModal(p.popupTitle, p.popupContent); return; }
      if (p.whenClicked === 'submitForm') { showToast('Form submitted successfully!', 'success'); return; }
      if (!el.interactions || el.interactions.length === 0) {
        showToast('Clicked ' + (el.name || 'element'));
        return;
      }
      el.interactions[0].steps.forEach(step => {
        if (step.type === 'toast') showToast(step.toastMessage, step.toastType);
        if (step.type === 'navigate' && step.targetPageId) navigateToPage(step.targetPageId);
        if (step.type === 'openModal') openModal(step.modalTitle, step.modalContent);
        if (step.type === 'submitForm') showToast(step.toastMessage || 'Form submitted successfully!', 'success');
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

// ----------------------------------------------------
// CANVAS & ELEMENT ALIGNMENT PRECISION ENGINE
// ----------------------------------------------------

export function getAlignedElementStyles(
  currentStyles: ComponentStyles = {}, 
  alignment: AlignmentType
): ComponentStyles {
  const styles: ComponentStyles = { ...currentStyles };

  switch (alignment) {
    case 'center-h':
      styles.textAlign = 'center';
      styles.alignSelf = 'center';
      styles.marginMode = 'individual';
      styles.marginLeft = 'auto';
      styles.marginRight = 'auto';
      break;

    case 'center-v':
      styles.alignSelf = 'center';
      styles.marginMode = 'individual';
      styles.marginTop = 'auto';
      styles.marginBottom = 'auto';
      break;

    case 'center-both':
      styles.textAlign = 'center';
      styles.alignSelf = 'center';
      styles.marginMode = 'individual';
      styles.marginLeft = 'auto';
      styles.marginRight = 'auto';
      styles.marginTop = 'auto';
      styles.marginBottom = 'auto';
      break;

    case 'anchor-left':
      styles.textAlign = 'left';
      styles.alignSelf = 'start';
      styles.marginMode = 'individual';
      styles.marginLeft = '0px';
      styles.marginRight = 'auto';
      break;

    case 'anchor-right':
      styles.textAlign = 'right';
      styles.alignSelf = 'end';
      styles.marginMode = 'individual';
      styles.marginLeft = 'auto';
      styles.marginRight = '0px';
      break;

    case 'anchor-top':
      styles.alignSelf = 'start';
      styles.marginMode = 'individual';
      styles.marginTop = '0px';
      styles.marginBottom = 'auto';
      break;

    case 'anchor-bottom':
      styles.alignSelf = 'end';
      styles.marginMode = 'individual';
      styles.marginTop = 'auto';
      styles.marginBottom = '0px';
      break;

    case 'full-width':
      styles.width = 'full';
      styles.alignSelf = 'stretch';
      styles.marginMode = 'individual';
      styles.marginLeft = '0px';
      styles.marginRight = '0px';
      break;

    case 'distribute-h':
    case 'distribute-v':
    case 'space-between':
      styles.marginMode = 'linked';
      styles.margin = 'md';
      styles.alignSelf = 'center';
      break;
  }

  return styles;
}

export function alignElements(
  elements: CanvasElement[], 
  alignment: AlignmentType
): CanvasElement[] {
  return elements.map((el) => ({
    ...el,
    styles: getAlignedElementStyles(el.styles, alignment),
  }));
}
