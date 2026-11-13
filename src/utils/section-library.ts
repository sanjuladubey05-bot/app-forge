/**
 * Prebuilt Section Library for AppForge Play-to-Build Experience
 * 
 * Each section is composed of real, 100% editable CanvasElements.
 * Users can customize text, colors, layouts, buttons, and interactions.
 */

import { CanvasElement, ComponentType } from '../types/editor';
import { createNewElement } from './project-engine';
import { LICENSED_STOCK_ASSETS } from './licensed-assets';

export type SectionCategory = 
  | 'website' 
  | 'content' 
  | 'business' 
  | 'account' 
  | 'application';

export interface PrebuiltSection {
  id: string;
  name: string;
  category: SectionCategory;
  categoryLabel: string;
  description: string;
  badge?: string;
  elements: () => CanvasElement[];
}

function makeElement(
  type: ComponentType, 
  customProps: Record<string, any> = {}, 
  customStyles: Record<string, any> = {}
): CanvasElement {
  const el = createNewElement(type);
  el.props = { ...el.props, ...customProps };
  el.styles = { ...el.styles, ...customStyles };
  return el;
}

export const PREBUILT_SECTIONS: PrebuiltSection[] = [
  // ================= WEBSITE SECTIONS =================
  {
    id: 'sec-hero',
    name: 'Hero Banner Section',
    category: 'website',
    categoryLabel: 'Website',
    description: 'High-impact landing hero with pill badge, headline, subheadline, and primary CTA button.',
    badge: 'Popular',
    elements: () => {
      const container = makeElement('card', {
        title: '',
        bgColor: '#121218',
        borderColor: '#27272a',
        padding: 'xl',
      });
      container.name = 'Hero Section';
      container.styles.textAlign = 'center';
      container.styles.shadow = 'xl';

      const badge = makeElement('badge', {
        label: '✨ Next-Gen Visual Platform',
        color: '#3b82f6',
      });
      badge.styles.margin = 'sm';

      const heading = makeElement('heading', {
        text: 'Build Exceptional Apps Without Code',
        level: 'h1',
        subtitle: 'From visual layout to interactive business logic, design and launch frontend applications in minutes.',
      });
      heading.styles.textColor = '#ffffff';

      const btnCta = makeElement('button', {
        buttonText: 'Get Started Free',
        buttonVariant: 'primary',
        buttonSize: 'lg',
        whenClicked: 'openPage',
        targetPageId: 'page_home',
      });
      btnCta.styles.margin = 'md';
      btnCta.styles.motion = {
        effect: 'slide-up',
        duration: 450,
        easing: 'ease-out',
        delay: 100,
        trigger: 'onMount',
        iterationCount: '1',
      };

      return [badge, heading, btnCta];
    },
  },
  {
    id: 'sec-navbar',
    name: 'Header & Navigation Bar',
    category: 'website',
    categoryLabel: 'Website',
    description: 'Top navigation header with brand title, nav links, and login button.',
    elements: () => {
      const bar = makeElement('container', {
        direction: 'row',
        gap: 'md',
        bgColor: '#18181b',
        borderColor: '#27272a',
        padding: 'md',
      });
      bar.name = 'Header Navbar';

      const logo = makeElement('heading', {
        text: '⚡ AppForge Studio',
        level: 'h3',
        subtitle: '',
      });

      const navBtn1 = makeElement('button', {
        buttonText: 'Explore Features',
        buttonVariant: 'secondary',
        buttonSize: 'sm',
      });

      const navBtn2 = makeElement('button', {
        buttonText: 'Sign In',
        buttonVariant: 'primary',
        buttonSize: 'sm',
      });

      return [logo, navBtn1, navBtn2];
    },
  },
  {
    id: 'sec-features',
    name: 'Key Features Grid',
    category: 'website',
    categoryLabel: 'Website',
    description: 'Feature showcase highlights for speed, security, and scalability.',
    elements: () => {
      const heading = makeElement('heading', {
        text: 'Engineered for Performance',
        level: 'h2',
        subtitle: 'Everything you need to deliver production-ready software directly in the browser.',
      });

      const card1 = makeElement('card', {
        title: 'Instant Drag & Drop',
        content: 'Place components, arrange responsive layouts, and configure properties in real-time.',
        bgColor: '#18181b',
      });

      const card2 = makeElement('card', {
        title: 'Zero-Code Button Actions',
        content: 'Link pages, trigger modals, and dispatch alerts without writing a single line of JavaScript.',
        bgColor: '#18181b',
      });

      return [heading, card1, card2];
    },
  },
  {
    id: 'sec-pricing-cards',
    name: 'Pricing Tier Cards',
    category: 'website',
    categoryLabel: 'Website',
    description: 'Tiered pricing cards comparing Starter and Enterprise subscriptions.',
    badge: 'Popular',
    elements: () => {
      const heading = makeElement('heading', {
        text: 'Transparent Pricing Plans',
        level: 'h2',
        subtitle: 'Start free and scale as your user base and project requirements grow.',
      });

      const cardStarter = makeElement('metric', {
        metricLabel: 'Starter Tier - Free ($0 due)',
        metricValue: '$0 /mo',
        metricTrend: 'Single workspace • No card required',
      });

      const cardPro = makeElement('metric', {
        metricLabel: 'Pro Tier - Cancel Anytime',
        metricValue: '$29 /mo',
        metricTrend: 'Multi-page exports • 14-day refund policy',
      });

      const btnPlan = makeElement('button', {
        text: 'Choose Pro Plan ($29/mo)',
        buttonVariant: 'primary',
        buttonSize: 'md',
      });

      return [heading, cardStarter, cardPro, btnPlan];
    },
  },
  {
    id: 'sec-contact',
    name: 'Contact & Inquiry Form',
    category: 'website',
    categoryLabel: 'Website',
    description: 'Contact form with name field, email input, message textarea, and submit button.',
    elements: () => {
      const heading = makeElement('heading', {
        text: 'Get in Touch',
        level: 'h2',
        subtitle: 'Have a question or request? Send a message to our engineering team.',
      });

      const nameInput = makeElement('input', {
        inputLabel: 'Your Full Name',
        placeholder: 'e.g. Alex Morgan',
      });

      const emailInput = makeElement('input', {
        inputLabel: 'Work Email Address',
        placeholder: 'alex@company.com',
      });

      const msgInput = makeElement('textarea', {
        inputLabel: 'Project Details / Message',
        placeholder: 'Tell us about your project goals...',
        rows: 3,
      });

      const consentToggle = makeElement('toggle', {
        label: 'I consent to process my inquiry under the Privacy Policy (Age 13+)',
        toggleChecked: false,
        subtext: 'Required before sending form data. Request deletion anytime.',
      });

      const submitBtn = makeElement('button', {
        text: 'Send Inquiry',
        buttonVariant: 'primary',
        buttonSize: 'md',
        whenClicked: 'submitForm',
        toastMessage: 'Your message has been sent successfully!',
      });

      return [heading, nameInput, emailInput, msgInput, consentToggle, submitBtn];
    },
  },
  {
    id: 'sec-footer',
    name: 'Website Footer',
    category: 'website',
    categoryLabel: 'Website',
    description: 'Clean bottom footer with business details, legal disclosures, and unsubscribe notice.',
    elements: () => {
      const divider = makeElement('divider');
      const footerText = makeElement('text', {
        text: '© 2026 AppForge Studio LLC · Privacy Policy · Terms of Service · 14-Day Refund Policy · Data Deletion & Email Unsubscribe',
      });
      footerText.styles.fontSize = 'xs';
      footerText.styles.textColor = '#a1a1aa';

      return [divider, footerText];
    },
  },

  // ================= WRITING & CONTENT =================
  {
    id: 'sec-article',
    name: 'Article & Editorial Section',
    category: 'content',
    categoryLabel: 'Writing & Content',
    description: 'Full blog post with headline, publication byline, formatted paragraphs, and callout.',
    elements: () => {
      const badge = makeElement('badge', {
        label: 'Engineering Story',
        color: '#10b981',
      });

      const title = makeElement('heading', {
        text: 'The Architecture Behind Visual App Development',
        level: 'h1',
        subtitle: 'Published by AppForge Team • 5 min read',
      });

      const body = makeElement('text', {
        text: 'Visual application builders bridge the divide between rapid prototyping and production deployment. By formalizing component hierarchies, reactive state containers, and deterministic event pipelines, modern visual tools achieve clean separation of concerns without sacrificing expressive power.',
      });

      const quoteCard = makeElement('card', {
        title: 'Key Takeaway',
        content: '“Great software development is about reducing cognitive overhead so creators can focus on user outcomes.”',
        bgColor: '#1c1917',
      });

      return [badge, title, body, quoteCard];
    },
  },
  {
    id: 'sec-newsletter',
    name: 'Newsletter Subscription Box',
    category: 'content',
    categoryLabel: 'Writing & Content',
    description: 'Email capture card with title, input field, and subscribe action.',
    elements: () => {
      const card = makeElement('card', {
        title: 'Join the Weekly Developer Digest',
        content: 'Get curated visual dev tutorials, system templates, and release updates delivered every Tuesday.',
        bgColor: '#18181b',
        padding: 'lg',
      });

      const emailInput = makeElement('input', {
        label: 'Email Address',
        placeholder: 'you@example.com',
      });

      const optInToggle = makeElement('toggle', {
        label: 'Send me weekly product updates (Unsubscribe anytime)',
        toggleChecked: false,
        subtext: 'Every email includes a one-click unsubscribe link.',
      });

      const btnSubscribe = makeElement('button', {
        text: 'Subscribe',
        buttonVariant: 'primary',
        buttonSize: 'md',
        whenClicked: 'submitForm',
        toastMessage: 'Subscribed! Every email includes a one-click unsubscribe link.',
      });

      return [card, emailInput, optInToggle, btnSubscribe];
    },
  },

  // ================= BUSINESS & PAYMENT =================
  {
    id: 'sec-checkout-proto',
    name: 'Payment & Checkout (UI Prototype)',
    category: 'business',
    categoryLabel: 'Business & Payment',
    description: 'Order summary card with item details, total amount, and prototype checkout button.',
    badge: 'UI Prototype',
    elements: () => {
      const badge = makeElement('badge', {
        label: 'Payment UI Prototype',
        color: '#f59e0b',
      });

      const heading = makeElement('heading', {
        text: 'Order Summary & Checkout',
        level: 'h2',
        subtitle: 'Review your selected application plan and confirm payment details.',
      });

      const card = makeElement('card', {
        text: 'AppForge Professional Edition',
        subtext: 'Total due today: $290.00/year (taxes included where applicable). Zero hidden fees. Backed by a 14-day refund policy.',
      });

      const emailField = makeElement('input', {
        label: 'Billing Email Address',
        placeholder: 'billing@company.com',
      });

      const btnPay = makeElement('button', {
        text: 'Pay $290.00 Total (Prototype Test)',
        buttonVariant: 'primary',
        buttonSize: 'lg',
        whenClicked: 'showToast',
        toastMessage: 'Prototype Payment Simulation: Order confirmed! (No real charges made)',
      });

      return [badge, heading, card, emailField, btnPay];
    },
  },
  {
    id: 'sec-product-details',
    name: 'Product Details Showcase',
    category: 'business',
    categoryLabel: 'Business & Payment',
    description: 'Commerce product card with licensed image, transparent price, and Add to Cart button.',
    elements: () => {
      const img = makeElement('image', {
        imageUrl: LICENSED_STOCK_ASSETS[1].url,
        imageAlt: LICENSED_STOCK_ASSETS[1].alt,
        imageLicense: LICENSED_STOCK_ASSETS[1].license,
      });

      const heading = makeElement('heading', {
        text: 'Studio Precision Headphones',
        headingLevel: 'h2',
        subtext: 'Active noise cancellation with 40-hour battery life and 14-day return policy.',
      });

      const priceMetric = makeElement('metric', {
        metricLabel: 'Total Price • Free Standard Shipping',
        metricValue: '$249.00',
        metricTrend: 'CC0 Licensed Preview • Zero hidden fees',
      });

      const btnCart = makeElement('button', {
        text: 'Add to Shopping Cart ($249.00)',
        buttonVariant: 'primary',
        buttonSize: 'md',
        whenClicked: 'showToast',
        toastMessage: 'Product added to shopping cart!',
      });

      return [img, heading, priceMetric, btnCart];
    },
  },

  // ================= USER & ACCOUNT =================
  {
    id: 'sec-login',
    name: 'User Sign In Card',
    category: 'account',
    categoryLabel: 'User & Account',
    description: 'Clean user authentication form with email, password, and Sign In action.',
    badge: 'Popular',
    elements: () => {
      const heading = makeElement('heading', {
        text: 'Sign In to Your Workspace',
        level: 'h2',
        subtitle: 'Enter your account credentials to access your projects and settings.',
      });

      const email = makeElement('input', {
        inputLabel: 'Email Address',
        placeholder: 'name@work.com',
      });

      const password = makeElement('input', {
        inputLabel: 'Password',
        placeholder: '••••••••••••',
      });

      const btnLogin = makeElement('button', {
        buttonText: 'Sign In',
        buttonVariant: 'primary',
        buttonSize: 'md',
        whenClicked: 'toast',
        toastMessage: 'Welcome back! Signed in successfully.',
      });

      return [heading, email, password, btnLogin];
    },
  },
  {
    id: 'sec-profile',
    name: 'User Profile & Identity Card',
    category: 'account',
    categoryLabel: 'User & Account',
    description: 'User avatar, verified role badge, biography, and settings link button.',
    elements: () => {
      const badge = makeElement('badge', {
        label: 'Verified Lead Architect',
        color: '#8b5cf6',
      });

      const heading = makeElement('heading', {
        text: 'Sarah Jenkins',
        level: 'h2',
        subtitle: 'sarah.jenkins@nexuscloud.io • Node: US-East-1',
      });

      const bio = makeElement('text', {
        text: 'Full-stack software architect specializing in zero-code platforms, micro-frontends, and distributed data systems.',
      });

      const btnSettings = makeElement('button', {
        buttonText: 'Edit Profile Settings',
        buttonVariant: 'secondary',
        buttonSize: 'sm',
        whenClicked: 'openPage',
        targetPageId: 'page_settings',
      });

      return [badge, heading, bio, btnSettings];
    },
  },

  // ================= APPLICATION =================
  {
    id: 'sec-dashboard-kpi',
    name: 'Analytics KPI Metrics Bar',
    category: 'application',
    categoryLabel: 'Application',
    description: '3 Key Performance Indicator cards tracking MRR, Active Users, and Performance score.',
    badge: 'Popular',
    elements: () => {
      const kpi1 = makeElement('metric', {
        metricLabel: 'Monthly Recurring Revenue',
        metricValue: '$148,250',
        trendText: '+28.4% vs last quarter',
      });

      const kpi2 = makeElement('metric', {
        metricLabel: 'Active Workspaces',
        metricValue: '4,892',
        trendText: '+14.1% monthly expansion',
      });

      const kpi3 = makeElement('metric', {
        metricLabel: 'Target Availability',
        metricValue: '99.9% target',
        metricTrend: 'Monitored service status',
      });

      return [kpi1, kpi2, kpi3];
    },
  },
  {
    id: 'sec-data-table',
    name: 'Data Table & Records List',
    category: 'application',
    categoryLabel: 'Application',
    description: 'Structured database table displaying rows of project status, members, and updates.',
    elements: () => {
      const heading = makeElement('heading', {
        text: 'Project Deployments',
        level: 'h3',
        subtitle: 'Real-time sync of active customer and internal services.',
      });

      const table = makeElement('table');

      return [heading, table];
    },
  },
];
