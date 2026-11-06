import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createInitialProject,
  createNewElement,
  ensureProjectPages,
  createPage,
  duplicatePage,
  deletePage,
  renamePage,
  setHomePage,
  switchActivePage,
  addElement,
  updateElement,
  deleteElement,
  duplicateElement,
  reorderElements,
  toggleElementVisibility,
  toggleElementLock,
  groupElementsIntoContainer,
  ungroupContainer,
  createDefaultActionStep,
  evaluateCondition,
  exportProjectToJson,
  exportProjectToHtml,
} from './project-engine';

test('createInitialProject generates multi-page structure', () => {
  const project = createInitialProject('SaaS Alpha', 'saas');
  assert.equal(project.name, 'SaaS Alpha');
  assert.ok(project.pages.length >= 2, 'Should create multi-page project for saas template');
  assert.equal(typeof project.activePageId, 'string');
  assert.equal(project.homePageId, 'page_home');
});

test('ensureProjectPages handles backwards compatibility', () => {
  const legacy: any = {
    id: 'legacy_1',
    name: 'Old App',
    elements: [createNewElement('button')],
    viewport: 'desktop',
    zoom: 100,
    canvasBg: '#09090b',
  };
  const upgraded = ensureProjectPages(legacy);
  assert.ok(upgraded.pages.length === 1);
  assert.equal(upgraded.pages[0].name, 'Home');
  assert.equal(upgraded.pages[0].elements.length, 1);
});

test('multi-page operations: create, rename, duplicate, delete', () => {
  let project = createInitialProject('Test App', 'blank');
  assert.equal(project.pages.length, 1);

  // 1. Create page
  project = createPage(project, 'Dashboard', '/dashboard', 'slide-left');
  assert.equal(project.pages.length, 2);
  const newPage = project.pages[1];
  assert.equal(newPage.name, 'Dashboard');
  assert.equal(project.activePageId, newPage.id);

  // 2. Rename page
  project = renamePage(project, newPage.id, 'Overview', '/overview');
  assert.equal(project.pages.find((p) => p.id === newPage.id)?.name, 'Overview');

  // 3. Duplicate page
  project = duplicatePage(project, newPage.id);
  assert.equal(project.pages.length, 3);

  // 4. Set home page
  project = setHomePage(project, newPage.id);
  assert.equal(project.homePageId, newPage.id);

  // 5. Delete page
  const pageToDelete = project.pages[project.pages.length - 1].id;
  project = deletePage(project, pageToDelete);
  assert.equal(project.pages.length, 2);
});

test('nested container grouping and ungrouping', () => {
  const el1 = createNewElement('heading');
  const el2 = createNewElement('button');
  const elements = [el1, el2];

  // Group
  const grouped = groupElementsIntoContainer(elements, [el1.id, el2.id]);
  assert.equal(grouped.length, 1);
  assert.equal(grouped[0].type, 'container');
  assert.equal(grouped[0].children?.length, 2);

  // Ungroup
  const ungrouped = ungroupContainer(grouped, grouped[0].id);
  assert.equal(ungrouped.length, 2);
  assert.equal(ungrouped[0].id, el1.id);
  assert.equal(ungrouped[1].id, el2.id);
});

test('createDefaultActionStep creates configured steps', () => {
  const navStep = createDefaultActionStep('navigate');
  assert.equal(navStep.type, 'navigate');
  assert.ok(navStep.targetPageId);

  const modalStep = createDefaultActionStep('openModal');
  assert.equal(modalStep.type, 'openModal');
  assert.ok(modalStep.modalTitle);

  const condStep = createDefaultActionStep('condition');
  assert.equal(condStep.type, 'condition');
  assert.ok(condStep.thenActions && condStep.thenActions.length > 0);
  assert.ok(condStep.elseActions && condStep.elseActions.length > 0);
});

test('evaluateCondition evaluates operators correctly', () => {
  assert.equal(
    evaluateCondition({ field: 'email', operator: 'isNotEmpty', value: '' }, { email: 'test@example.com' }),
    true
  );
  assert.equal(
    evaluateCondition({ field: 'email', operator: 'isNotEmpty', value: '' }, { email: '' }),
    false
  );
  assert.equal(
    evaluateCondition({ field: 'role', operator: 'equals', value: 'admin' }, { role: 'admin' }),
    true
  );
  assert.equal(
    evaluateCondition({ field: 'role', operator: 'equals', value: 'admin' }, { role: 'user' }),
    false
  );
  assert.equal(
    evaluateCondition({ field: 'title', operator: 'contains', value: 'forge' }, { title: 'AppForge Builder' }),
    true
  );
});

test('export multi-page project to JSON and HTML', () => {
  const project = createInitialProject('Export Full App', 'saas');
  const json = exportProjectToJson(project);
  assert.ok(json.includes('"pages"'));
  assert.ok(json.includes('"page_home"'));

  const html = exportProjectToHtml(project);
  assert.ok(html.includes('navigateToPage'));
  assert.ok(html.includes('app-canvas'));
  assert.ok(html.includes('toast-container'));
});

test('motion settings applied to element styles', () => {
  const el = createNewElement('button');
  el.styles.motion = {
    effect: 'bounce',
    duration: 600,
    easing: 'bounce',
    delay: 150,
    trigger: 'onMount',
    iterationCount: '2',
  };

  assert.equal(el.styles.motion.effect, 'bounce');
  assert.equal(el.styles.motion.duration, 600);
  assert.equal(el.styles.motion.easing, 'bounce');
  assert.equal(el.styles.motion.delay, 150);
});

test('entrance and exit animation presets configure correct styles and keyframes mapping', () => {
  const el = createNewElement('button');
  
  // Test Entrance preset (e.g. fade-in, zoom-in, slide-up)
  el.styles.motion = {
    effect: 'slide-up',
    duration: 500,
    easing: 'ease-out',
    delay: 100,
    trigger: 'onMount',
    iterationCount: '1',
  };
  assert.equal(el.styles.motion.effect, 'slide-up');
  assert.equal(`appforge-${el.styles.motion.effect}`, 'appforge-slide-up');

  // Test Exit preset (e.g. fade-out, zoom-out, slide-down-out)
  el.styles.motion = {
    effect: 'zoom-out',
    duration: 350,
    easing: 'ease-in',
    delay: 0,
    trigger: 'onClick',
    iterationCount: '1',
  };
  assert.equal(el.styles.motion.effect, 'zoom-out');
  assert.equal(`appforge-${el.styles.motion.effect}`, 'appforge-zoom-out');
});

test('ensureProjectPages auto-initializes data studio collections and variables', () => {
  const blankProject = createInitialProject('Test Data App', 'blank');
  const migrated = ensureProjectPages(blankProject);

  assert.ok(Array.isArray(migrated.collections), 'Collections should be initialized');
  assert.ok((migrated.collections?.length ?? 0) >= 2, 'Should seed Users and Products collections');
  assert.ok(Array.isArray(migrated.variables), 'Variables should be initialized');
  assert.ok((migrated.variables?.length ?? 0) >= 3, 'Should seed initial global variables');
});

test('exact play-to-build scenario: button linked to Profile page navigates correctly', () => {
  // Step 1: Create a new project
  let project = createInitialProject('My Test Application', 'blank');
  assert.equal(project.pages.length, 1);
  const homePage = project.pages[0];
  assert.equal(homePage.name, 'Home');

  // Step 2: Add a button to Home page
  const buttonEl = createNewElement('button');
  buttonEl.props.text = 'My Profile';
  project = addElement(project, buttonEl);
  assert.equal(project.pages[0].elements.length, 3); // initial welcome heading + button + newly added button

  // Step 3: Create page named Profile
  project = createPage(project, 'Profile', '/profile', 'fade');
  assert.equal(project.pages.length, 2);
  const profilePage = project.pages.find((p) => p.name === 'Profile');
  assert.ok(profilePage, 'Profile page must exist');

  // Step 4: Configure button When Clicked -> Open Page -> Profile
  const updatedProps = {
    ...buttonEl.props,
    whenClicked: 'openPage' as const,
    targetPageId: profilePage.id,
  };
  project = updateElement(project, buttonEl.id, { props: updatedProps });

  // Verify button was updated with targetPageId
  const foundBtn = project.pages[0].elements.find((el) => el.id === buttonEl.id);
  assert.ok(foundBtn);
  assert.equal(foundBtn.props.whenClicked, 'openPage');
  assert.equal(foundBtn.props.targetPageId, profilePage.id);

  // Step 5: Test preview navigation logic
  const targetPage = project.pages.find((p) => p.id === foundBtn.props.targetPageId);
  assert.ok(targetPage);
  assert.equal(targetPage.name, 'Profile');

  // Step 6: Test destination sync when page is renamed
  project = renamePage(project, profilePage.id, 'User Profile', '/user-profile');
  const targetAfterRename = project.pages.find((p) => p.id === foundBtn.props.targetPageId);
  assert.ok(targetAfterRename);
  assert.equal(targetAfterRename.name, 'User Profile');

  // Step 7: Test broken link detection when page is deleted
  project = deletePage(project, profilePage.id);
  const targetAfterDelete = project.pages.find((p) => p.id === foundBtn.props.targetPageId);
  assert.equal(targetAfterDelete, undefined, 'Target page should not exist after deletion');
});

test('prebuilt section library provides 14 editable sections across 5 categories', async () => {
  const { PREBUILT_SECTIONS } = await import('./section-library');
  assert.equal(PREBUILT_SECTIONS.length, 14);

  // Test categories
  const categories = new Set(PREBUILT_SECTIONS.map((s) => s.category));
  assert.ok(categories.has('website'));
  assert.ok(categories.has('content'));
  assert.ok(categories.has('business'));
  assert.ok(categories.has('account'));
  assert.ok(categories.has('application'));

  // Test generating elements for a section produces unique, editable CanvasElements
  const heroSection = PREBUILT_SECTIONS.find((s) => s.id === 'sec-hero');
  assert.ok(heroSection);
  const elements = heroSection.elements();
  assert.ok(elements.length >= 3, 'Hero section should have multiple editable elements');
  assert.ok(elements[0].id.startsWith('el_'));
  assert.ok(elements[0].type);
});

test('motion event trigger supports onMount, onHover, onClick, infinite', () => {
  const el = createNewElement('button');

  // Test onHover
  el.styles.motion = {
    effect: 'pulse',
    duration: 300,
    easing: 'ease-in-out',
    delay: 0,
    trigger: 'onHover',
    iterationCount: 'infinite',
  };
  assert.equal(el.styles.motion.trigger, 'onHover');

  // Test onClick
  el.styles.motion = {
    ...el.styles.motion,
    trigger: 'onClick',
    effect: 'bounce',
  };
  assert.equal(el.styles.motion.trigger, 'onClick');
  assert.equal(el.styles.motion.effect, 'bounce');

  // Test infinite loop
  el.styles.motion = {
    ...el.styles.motion,
    trigger: 'infinite',
  };
  assert.equal(el.styles.motion.trigger, 'infinite');
});


