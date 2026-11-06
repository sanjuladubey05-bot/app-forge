/**
 * Prebuilt Section Library for AppForge Play-to-Build Experience
 * 
 * Each section is composed of real, 100% editable CanvasElements.
 * Users can customize text, colors, layouts, buttons, and interactions.
 */

import { CanvasElement, ComponentType } from '../types/editor';
import { createNewElement } from './project-engine';

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
        metricLabel: 'Starter Tier - Free',
        metricValue: '$0 /mo',
        trendText: 'Unlimited personal prototypes',
      });

      const cardPro = makeElement('metric', {
        metricLabel: 'Pro Tier - Full Access',
        metricValue: '$29 /mo',
        trendText: '+ Unlimited multi-page apps and custom export',
      });

      const btnPlan = makeElement('button', {
        buttonText: 'Choose Pro Plan',
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

      const submitBtn = makeElement('button', {
        buttonText: 'Send Inquiry',
        buttonVariant: 'primary',
        buttonSize: 'md',
        whenClicked: 'toast',
        toastMessage: 'Your message has been sent successfully!',
      });

      return [heading, nameInput, emailInput, msgInput, submitBtn];
    },
  },
  {
    id: 'sec-footer',
    name: 'Website Footer',
    category: 'website',
    categoryLabel: 'Website',
    description: 'Clean bottom footer with copyright notice and navigation links.',
    elements: () => {
      const divider = makeElement('divider');
      const footerText = makeElement('text', {
        text: '© 2026 AppForge Studio. All rights reserved. Built with No-Code visual architecture.',
      });
      footerText.styles.fontSize = 'xs';
      footerText.styles.textColor = '#71717a';

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
        inputLabel: 'Email Address',
        placeholder: 'you@example.com',
      });

      const btnSubscribe = makeElement('button', {
        buttonText: 'Subscribe Now',
        buttonVariant: 'primary',
        buttonSize: 'md',
        whenClicked: 'toast',
        toastMessage: 'Subscribed to Weekly Developer Digest!',
      });

      return [card, emailInput, btnSubscribe];
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
        title: 'AppForge Professional Edition',
        content: 'Annual Subscription • Billed at $290/year (Save 17% vs monthly). Includes unlimited multi-page projects and instant code export.',
        bgColor: '#18181b',
      });

      const emailField = makeElement('input', {
        inputLabel: 'Billing Email Address',
        placeholder: 'billing@company.com',
      });

      const btnPay = makeElement('button', {
        buttonText: 'Pay $290 (Prototype Test)',
        buttonVariant: 'primary',
        buttonSize: 'lg',
        whenClicked: 'toast',
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
    description: 'Commerce product card with image placeholder, pricing, and Add to Cart button.',
    elements: () => {
      const img = makeElement('image', {
        imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
        altText: 'Premium Wireless Headphones',
      });

      const heading = makeElement('heading', {
        text: 'Studio Precision Headphones',
        level: 'h2',
        subtitle: 'Active noise cancellation with 40-hour ultra battery life.',
      });

      const priceMetric = makeElement('metric', {
        metricLabel: 'In Stock • Free 2-Day Shipping',
        metricValue: '$249.00',
        trendText: 'Rated 4.9/5 by 1,280 verified buyers',
      });

      const btnCart = makeElement('button', {
        buttonText: 'Add to Shopping Cart',
        buttonVariant: 'primary',
        buttonSize: 'md',
        whenClicked: 'toast',
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
        metricLabel: 'System SLA Uptime',
        metricValue: '99.98%',
        trendText: 'Optimal node health',
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
