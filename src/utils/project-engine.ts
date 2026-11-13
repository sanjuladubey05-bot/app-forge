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
  AlignmentType,
  PageSeoConfig
} from '../types/editor';
import { LICENSED_STOCK_ASSETS } from './licensed-assets';
import { ensureComplianceConfig } from './compliance-audit';
import { ensureThemeTokens } from './theme-engine';

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
      imageUrl: LICENSED_STOCK_ASSETS[0].url,
      imageAlt: LICENSED_STOCK_ASSETS[0].alt,
      imageLicense: LICENSED_STOCK_ASSETS[0].license,
    },
    divider: {},
    toggle: {
      label: 'Enable Real-time Sync',
      toggleChecked: false,
      subtext: 'Opt-in to push changes automatically.',
    },
    table: {
      tableHeaders: ['Project Name', 'Status', 'Members', 'Updated'],
      tableRows: [
        ['Customer Portal', 'Active', '4 devs', 'Just now'],
        ['Analytics Engine', 'Building', '2 devs', '2 hrs ago'],
        ['Mobile App API', 'Deployed', '6 devs', 'Yesterday'],
      ],
    },
    widget3d: {
      widget3d: {
        presetId: 'webgl-orbital-prism',
        presetMode: 'threejs-webgl',
        title: 'Interactive 3D Showcase',
        subtitle: 'Drag to orbit · Procedural WebGL scene',
        accentColor: '#38bdf8',
        heightPx: 280,
        autoRotate: true,
        interactiveTilt: true,
      },
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
      backgroundColor: '#2563eb',
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
    widget3d: {
      backgroundColor: '#121215',
      borderColor: '#27272a',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderRadius: 'xl',
      padding: 'none',
      width: 'full',
      shadow: 'lg',
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
    widget3d: '3D UI Widget',
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

  const compliance = ensureComplianceConfig(project);
  const themeTokens = ensureThemeTokens(project);
  const responsiveStackBelowPx = project.responsiveStackBelowPx ?? 768;

  if (project.pages && project.pages.length > 0) {
    const activeExists = project.pages.some((p) => p.id === project.activePageId);
    const homeExists = project.pages.some((p) => p.id === project.homePageId);
    return {
      ...project,
      activePageId: activeExists ? project.activePageId : project.pages[0].id,
      homePageId: homeExists ? project.homePageId : project.pages[0].id,
      collections: defaultCollections,
      variables: defaultVariables,
      compliance,
      themeTokens,
      responsiveStackBelowPx,
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
    compliance,
    themeTokens,
    responsiveStackBelowPx,
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
              toggleChecked: false,
              subtext: 'Opt-in to stream events into your logging pipeline.',
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
  } else if (templateId === 'linkinbio') {
    homeElements = [
      {
        ...createNewElement('badge'),
        props: { text: 'Creator & Studio Links', badgeVariant: 'info' },
      },
      {
        ...createNewElement('heading'),
        props: {
          text: name || 'Jordan Blake',
          headingLevel: 'h1',
          subtext: 'Design Engineer · Building open developer tools and spatial web experiences.',
        },
        styles: { textAlign: 'center', width: 'full' },
      },
      {
        ...createNewElement('widget3d'),
        props: {
          widget3d: {
            presetId: 'glass-tilt-card',
            presetMode: 'css-3d',
            title: 'Featured Release: Spatial UI Kit',
            subtitle: 'Interactive WebGL & React starter pack',
            accentColor: '#38bdf8',
            heightPx: 230,
            autoRotate: true,
            interactiveTilt: true,
          },
        },
      },
      {
        ...createNewElement('button'),
        props: { text: 'Explore Live Portfolio', buttonVariant: 'primary', whenClicked: 'showToast', toastMessage: 'Opening portfolio showcase!' },
        styles: { width: 'full' },
      },
      {
        ...createNewElement('button'),
        props: { text: 'Book a 20-Min Intro Call', buttonVariant: 'outline', whenClicked: 'showToast', toastMessage: 'Scheduling calendar selected.' },
        styles: { width: 'full' },
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
    compliance: ensureComplianceConfig(),
    themeTokens: ensureThemeTokens({ canvasBg: '#0f0f12' }),
    responsiveStackBelowPx: 768,
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

export const PAGE_TRANSITION_PRESETS: {
  id: PageTransition;
  label: string;
  description: string;
}[] = [
  { id: 'fade', label: 'Crossfade', description: 'Smooth opacity dissolve between routes' },
  { id: 'slide-left', label: 'Slide Left', description: 'Enters smoothly from the right edge' },
  { id: 'slide-right', label: 'Slide Right', description: 'Enters smoothly from the left edge' },
  { id: 'slide-up', label: 'Slide Up', description: 'Lifts upward smoothly on route change' },
  { id: 'scale', label: 'Zoom Scale', description: 'Subtle depth zoom entrance' },
  { id: 'none', label: 'Instant', description: 'No transition animation' },
];

export function getPageTransitionClass(transition?: PageTransition): string {
  switch (transition) {
    case 'slide-left':
      return 'af-page-transition-slide-left';
    case 'slide-right':
      return 'af-page-transition-slide-right';
    case 'slide-up':
      return 'af-page-transition-slide-up';
    case 'scale':
      return 'af-page-transition-scale';
    case 'none':
      return 'af-page-transition-none';
    case 'fade':
    default:
      return 'af-page-transition-fade';
  }
}

export function updatePageTransition(project: Project, pageId: string, transition: PageTransition): Project {
  const proj = ensureProjectPages(project);
  return {
    ...proj,
    updatedAt: new Date().toISOString(),
    pages: proj.pages.map((p) => (p.id === pageId ? { ...p, transition } : p)),
  };
}

export function updatePageSeo(project: Project, pageId: string, seoPatch: Partial<PageSeoConfig>): Project {
  const proj = ensureProjectPages(project);
  return {
    ...proj,
    updatedAt: new Date().toISOString(),
    pages: proj.pages.map((p) =>
      p.id === pageId ? { ...p, seo: { ...(p.seo || {}), ...seoPatch } } : p
    ),
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
  const comp = ensureComplianceConfig(proj);

  const safeProjectName = escapeHtml(proj.name);
  const safeBizName = escapeHtml(comp.businessName);
  const safeBizAddr = escapeHtml(comp.businessAddress);
  const safeSupport = escapeHtml(comp.supportEmail);
  const safePrivacy = escapeHtml(comp.privacyEmail);
  const safeUnsubscribe = escapeHtml(comp.unsubscribeEmail);
  const pagesJson = JSON.stringify(proj.pages).replace(/<\//g, '<\\/');
  const homePageId = escapeHtml(proj.homePageId);

  const homePage = proj.pages.find((p) => p.id === proj.homePageId) || proj.pages[0];
  const initialSeoTitle = escapeHtml(homePage?.seo?.title || `${proj.name} - Built with AppForge`);
  const initialSeoDesc = escapeHtml(homePage?.seo?.metaDescription || proj.description || `${proj.name} web application`);
  const initialOgTitle = escapeHtml(homePage?.seo?.ogTitle || homePage?.seo?.title || proj.name);
  const initialOgDesc = escapeHtml(homePage?.seo?.ogDescription || homePage?.seo?.metaDescription || proj.description || `${proj.name} web application`);
  const initialOgType = escapeHtml(homePage?.seo?.ogType || 'website');
  const initialOgImage = homePage?.seo?.ogImage ? `\n  <meta property="og:image" content="${escapeHtml(sanitizeUrl(homePage.seo.ogImage))}">` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${initialSeoTitle}</title>
  <meta name="description" content="${initialSeoDesc}">
  <meta property="og:type" content="${initialOgType}">
  <meta property="og:title" content="${initialOgTitle}">
  <meta property="og:description" content="${initialOgDesc}">${initialOgImage}
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; background: #09090b; color: #f4f4f5; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.5; }
    .sr-skip { position: absolute; left: -9999px; top: auto; width: 1px; height: 1px; overflow: hidden; }
    .sr-skip:focus { position: fixed; left: 16px; top: 16px; width: auto; height: auto; padding: 10px 14px; background: #2563eb; color: #fff; border-radius: 8px; z-index: 100; font-size: 13px; font-weight: 600; text-decoration: none; }
    :focus-visible { outline: 2px solid #60a5fa; outline-offset: 2px; }
    .container { max-width: 960px; margin: 0 auto; padding: 28px 16px; }
    .hdr { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; padding-bottom: 16px; margin-bottom: 24px; border-bottom: 1px solid #27272a; }
    .btn { display: inline-flex; align-items: center; justify-content: center; padding: 10px 18px; border-radius: 8px; border: 1px solid transparent; font-size: 13px; font-weight: 600; cursor: pointer; background: #2563eb; color: #fff; }
    .btn:hover { background: #1d4ed8; }
    .btn-ghost { background: #18181b; color: #e4e4e7; border-color: #3f3f46; }
    .card { padding: 20px; border-radius: 12px; border: 1px solid #27272a; background: #18181b; margin-bottom: 16px; }
    .input { width: 100%; padding: 9px 12px; border-radius: 8px; border: 1px solid #3f3f46; background: #09090b; color: #fff; font-size: 13px; }
    .muted { color: #a1a1aa; font-size: 13px; }
    .hidden { display: none !important; }
    .af-page-transition-fade { animation: fadeIn 0.28s cubic-bezier(0.16, 1, 0.3, 1) both; }
    .af-page-transition-slide-left { animation: slideLeftIn 0.32s cubic-bezier(0.16, 1, 0.3, 1) both; }
    .af-page-transition-slide-right { animation: slideRightIn 0.32s cubic-bezier(0.16, 1, 0.3, 1) both; }
    .af-page-transition-slide-up { animation: slideUpIn 0.32s cubic-bezier(0.16, 1, 0.3, 1) both; }
    .af-page-transition-scale { animation: scaleIn 0.28s cubic-bezier(0.16, 1, 0.3, 1) both; }
    .af-page-transition-none { animation: none; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideLeftIn { from { opacity: 0; transform: translateX(28px); } to { opacity: 1; transform: translateX(0); } }
    @keyframes slideRightIn { from { opacity: 0; transform: translateX(-28px); } to { opacity: 1; transform: translateX(0); } }
    @keyframes slideUpIn { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes scaleIn { from { opacity: 0; transform: scale(0.92); } to { opacity: 1; transform: scale(1); } }
    .footer-legal { margin-top: 40px; padding-top: 20px; border-top: 1px solid #27272a; font-size: 12px; color: #a1a1aa; display: flex; flex-wrap: wrap; justify-content: space-between; gap: 12px; }
    .link-btn { background: none; border: none; color: #93c5fd; text-decoration: underline; cursor: pointer; font-size: 12px; padding: 2px 4px; }
  </style>
</head>
<body>
  <a href="#app-canvas" class="sr-skip">Skip to main content</a>
  <div class="container">
    <header class="hdr">
      <div style="display:flex;align-items:center;gap:8px;">
        <span style="width:10px;height:10px;border-radius:999px;background:#3b82f6;display:inline-block;"></span>
        <span style="font-size:15px;font-weight:700;color:#fff;">${safeProjectName}</span>
      </div>
      <nav id="nav-pills" aria-label="Primary Navigation" style="display:flex;flex-wrap:wrap;gap:6px;"></nav>
    </header>

    <main id="app-canvas" tabindex="-1" class="af-page-transition-fade"></main>

    <footer class="footer-legal" aria-label="Legal & Business Information">
      <div>
        <div><strong>${safeBizName}</strong> · ${safeBizAddr}</div>
        <div>Support: <a href="mailto:${safeSupport}" style="color:#93c5fd;">${safeSupport}</a> · Unsubscribe: <a href="mailto:${safeUnsubscribe}?subject=Unsubscribe" style="color:#93c5fd;">One-click opt-out</a></div>
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;">
        <button type="button" class="link-btn" onclick="openLegal('Privacy Policy')">Privacy Policy</button>
        <button type="button" class="link-btn" onclick="openLegal('Terms of Service')">Terms of Service</button>
        <button type="button" class="link-btn" onclick="openLegal('Refund Policy')">Refund Policy (${comp.refundWindowDays} days)</button>
        <button type="button" class="link-btn" onclick="openLegal('Cookie Policy')">Cookie Settings</button>
        <button type="button" class="link-btn" onclick="openLegal('Data Deletion Request')">Data Deletion</button>
      </div>
    </footer>
  </div>

  ${comp.includeCookieBanner ? `
  <aside id="cookie-banner" role="region" aria-label="Cookie Consent" style="position:fixed;bottom:14px;left:14px;right:14px;max-width:780px;margin:0 auto;padding:12px 16px;background:#18181b;border:1px solid #3f3f46;border-radius:12px;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px;z-index:40;font-size:12px;">
    <div style="flex:1;min-width:220px;color:#e4e4e7;">
      We use essential cookies to operate this app. Optional analytics/marketing cookies stay off unless you choose to accept.
    </div>
    <div style="display:flex;gap:8px;">
      <button type="button" class="btn btn-ghost" onclick="setCookieChoice('rejected')">Reject Non-Essential</button>
      <button type="button" class="btn" onclick="setCookieChoice('accepted')">Accept All</button>
    </div>
  </aside>` : ''}

  <div id="toast-container" aria-live="polite" style="position:fixed;bottom:24px;right:24px;z-index:50;display:flex;flex-direction:column;gap:8px;"></div>

  <div id="modal-container" role="dialog" aria-modal="true" class="hidden" style="position:fixed;inset:0;z-index:50;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.75);padding:16px;">
    <div style="width:100%;max-width:520px;background:#18181b;border:1px solid #3f3f46;border-radius:16px;padding:24px;">
      <h2 id="modal-title" style="font-size:16px;font-weight:700;color:#fff;margin:0 0 8px;"></h2>
      <div id="modal-body" style="font-size:13px;color:#d4d4d8;margin-bottom:20px;line-height:1.6;"></div>
      <div style="display:flex;justify-content:flex-end;gap:8px;">
        <button type="button" onclick="closeModal()" class="btn btn-ghost">Close</button>
      </div>
    </div>
  </div>

  <script>
    const pages = ${pagesJson};
    let activePageId = '${homePageId}';
    const formState = {};
    const requireFormConsent = ${comp.requireFormConsent ? 'true' : 'false'};

    function esc(v) {
      return String(v ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
    }

    function setCookieChoice(choice) {
      try { localStorage.setItem('af_exported_cookie_choice', choice); } catch {}
      var b = document.getElementById('cookie-banner');
      if (b) b.classList.add('hidden');
      showToast(choice === 'accepted' ? 'Cookie preferences saved (All accepted).' : 'Non-essential cookies rejected.', 'success');
    }

    function openLegal(section) {
      var body = '';
      if (section === 'Privacy Policy') body = 'Controller: ${safeBizName} (${safeBizAddr}). We collect only data you explicitly submit, never sell personal information, and enforce minimum age ${comp.minimumAge}+ or verifiable parental consent. Contact: ${safePrivacy}.';
      else if (section === 'Terms of Service') body = 'Provided by ${safeBizName} (${escapeHtml(comp.registrationId)}). Transparent pricing with zero hidden fees. Contact ${safeSupport} for assistance.';
      else if (section === 'Refund Policy') body = 'All paid plans include a ${comp.refundWindowDays}-day full refund guarantee with no hidden cancellation fees. Email ${safeSupport} to request a refund.';
      else if (section === 'Cookie Policy') body = 'Essential cookies keep navigation working. Optional cookies remain disabled unless explicitly enabled.';
      else body = 'To request permanent deletion of your data or unsubscribe from emails, contact ${safePrivacy} or ${safeUnsubscribe}.';
      openModal(section, body);
    }

    function showToast(message, type) {
      const c = document.getElementById('toast-container');
      const t = document.createElement('div');
      t.style.cssText = 'padding:10px 14px;border-radius:10px;background:#18181b;border:1px solid ' + (type === 'error' ? '#ef4444' : '#3b82f6') + ';color:#fff;font-size:12px;';
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
        '<button type="button" onclick="navigateToPage(\\'' + esc(p.id) + '\\')" class="btn ' +
        (p.id === activePageId ? '' : 'btn-ghost') +
        '" style="padding:6px 12px;font-size:12px;">' + esc(p.name) + '</button>'
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
            return '<nav class="card" style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;">' +
              '<span style="font-weight:700;font-size:14px;color:#fff;">' + esc(p.brandName || 'AppForge') + '</span>' +
              '<div style="display:flex;gap:10px;align-items:center;">' +
              (p.navLinks || []).map(l => '<button type="button" class="btn btn-ghost" style="padding:5px 10px;font-size:12px;" onclick="' + (l.targetPageId ? 'navigateToPage(\\'' + esc(l.targetPageId) + '\\')' : '') + '">' + esc(l.label) + '</button>').join('') +
              (p.ctaLabel ? '<button type="button" onclick="handleButtonClick(\\'' + esc(el.id) + '\\')" class="btn" style="padding:6px 12px;font-size:12px;">' + esc(p.ctaLabel) + '</button>' : '') +
              '</div></nav>';
          case 'container':
          case 'card':
            return '<div class="card" style="background:' + esc(s.backgroundColor || (el.type === 'card' ? '#18181b' : '#121215')) + ';">' +
              (p.text ? '<h3 style="margin:0 0 6px;font-size:16px;color:#fff;">' + esc(p.text) + '</h3>' : '') +
              (p.subtext ? '<p class="muted" style="margin:0 0 12px;">' + esc(p.subtext) + '</p>' : '') +
              childHtml + '</div>';
          case 'heading': {
            const tag = p.headingLevel === 'h2' ? 'h2' : p.headingLevel === 'h3' ? 'h3' : 'h1';
            return '<div style="margin-bottom:12px;"><' + tag + ' style="margin:0;color:#fff;">' + esc(p.text || '') + '</' + tag + '>' +
              (p.subtext ? '<p class="muted" style="margin:4px 0 0;">' + esc(p.subtext) + '</p>' : '') + '</div>';
          }
          case 'text':
            return '<p style="color:#d4d4d8;font-size:14px;margin:0 0 12px;">' + esc(p.text || '') + '</p>';
          case 'badge':
            return '<span style="display:inline-block;padding:3px 10px;border-radius:999px;font-size:12px;background:#1e3a8a;color:#bfdbfe;margin-bottom:8px;">' + esc(p.text || 'Badge') + '</span>';
          case 'button':
            return '<button type="button" onclick="handleButtonClick(\\'' + esc(el.id) + '\\')" class="btn" style="margin-bottom:12px;">' + esc(p.text || 'Button') + '</button>';
          case 'input':
            return '<label style="display:block;margin-bottom:12px;">' + (p.label ? '<span style="display:block;font-size:12px;font-weight:600;color:#e4e4e7;margin-bottom:4px;">' + esc(p.label) + '</span>' : '') + '<input class="input" oninput="formState[\\'' + esc(el.id) + '\\']=this.value" placeholder="' + esc(p.placeholder || '') + '" /></label>';
          case 'textarea':
            return '<label style="display:block;margin-bottom:12px;">' + (p.label ? '<span style="display:block;font-size:12px;font-weight:600;color:#e4e4e7;margin-bottom:4px;">' + esc(p.label) + '</span>' : '') + '<textarea class="input" rows="3" oninput="formState[\\'' + esc(el.id) + '\\']=this.value" placeholder="' + esc(p.placeholder || '') + '"></textarea></label>';
          case 'toggle':
            return '<label class="card" style="display:flex;align-items:center;justify-content:space-between;cursor:pointer;"><span style="font-size:13px;color:#fff;">' + esc(p.label || 'Toggle') + '</span><input type="checkbox" ' + (p.toggleChecked ? 'checked' : '') + ' /></label>';
          case 'image':
            return '<div style="margin-bottom:12px;border-radius:12px;overflow:hidden;border:1px solid #27272a;"><img src="' + esc(p.imageUrl || '') + '" alt="' + esc(p.imageAlt || 'Illustration') + '" style="width:100%;height:200px;object-fit:cover;display:block;" /></div>';
          case 'metric':
            return '<div class="card"><span class="muted" style="text-transform:uppercase;font-size:11px;">' + esc(p.metricLabel || 'KPI') + '</span><div style="font-size:24px;font-weight:700;color:#fff;margin-top:4px;">' + esc(p.metricValue || '0') + '</div></div>';
          case 'divider':
            return '<hr style="border:0;border-top:1px solid #27272a;margin:16px 0;" />';
          case 'table':
            return '<div class="card" style="overflow-x:auto;"><table style="width:100%;border-collapse:collapse;font-size:12px;text-align:left;"><thead><tr>' +
              (p.tableHeaders || []).map(h => '<th style="padding:8px;border-bottom:1px solid #27272a;color:#a1a1aa;">' + esc(h) + '</th>').join('') +
              '</tr></thead><tbody>' +
              (p.tableRows || []).map(r => '<tr>' + r.map(c => '<td style="padding:8px;border-bottom:1px solid #27272a;color:#e4e4e7;">' + esc(c) + '</td>').join('') + '</tr>').join('') +
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
      if (p.whenClicked === 'submitForm' && requireFormConsent) {
        var box = document.getElementById('af-form-consent');
        if (box && !box.checked) {
          showToast('Please confirm Privacy Policy & age (${comp.minimumAge}+) consent before submitting.', 'error');
          return;
        }
      }
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
      const seo = page.seo || {};
      if (seo.title) document.title = seo.title;
      const canvas = document.getElementById('app-canvas');
      const transitionName = page.transition || 'fade';
      canvas.className = 'af-page-transition-' + transitionName;
      void canvas.offsetWidth;
      const hasInputs = (page.elements || []).some(e => e.type === 'input' || e.type === 'textarea');
      const consentBlock = (hasInputs && requireFormConsent)
        ? '<label class="card" style="display:flex;align-items:flex-start;gap:10px;font-size:12px;color:#d4d4d8;cursor:pointer;"><input id="af-form-consent" type="checkbox" style="margin-top:3px;" /><span>I confirm I am at least ${comp.minimumAge} years old (or have verifiable guardian consent) and agree to the Privacy Policy.</span></label>'
        : '';
      canvas.innerHTML = renderElements(page.elements) + consentBlock;
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
