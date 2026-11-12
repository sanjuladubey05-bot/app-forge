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

test('circular Quick Add shortcuts map to valid ComponentTypes and add elements correctly', async () => {
  const { QUICK_ADD_OPTIONS } = await import('../components/QuickAddRadialMenu');
  assert.equal(QUICK_ADD_OPTIONS.length, 8);

  const expectedTypes = ['button', 'heading', 'text', 'card', 'input', 'image', 'container', 'badge'];
  const actualTypes = QUICK_ADD_OPTIONS.map((opt) => opt.type);
  assert.deepEqual(actualTypes, expectedTypes);

  let project = createInitialProject('Quick Add Test', 'blank');
  const initialCount = project.pages[0].elements.length;

  // Add each quick add component type to project
  for (const opt of QUICK_ADD_OPTIONS) {
    const el = createNewElement(opt.type);
    assert.equal(el.type, opt.type);
    assert.ok(el.id.startsWith('el_'));
    project = addElement(project, el);
  }

  assert.equal(project.pages[0].elements.length, initialCount + 8);
  const addedTypes = project.pages[0].elements.slice(initialCount).map((el) => el.type);
  assert.deepEqual(addedTypes, expectedTypes);
});

test('global keyboard shortcut manager: normalization, conflict detection, and matching', async () => {
  const { 
    STANDARD_SHORTCUTS, 
    getDefaultShortcuts, 
    getActiveShortcuts, 
    eventToKeyCombo, 
    matchesShortcut, 
    findShortcutConflict 
  } = await import('./shortcut-manager');

  // 1. Verify standard shortcuts
  assert.equal(STANDARD_SHORTCUTS.length, 12);
  const deleteAction = STANDARD_SHORTCUTS.find((s) => s.id === 'deleteElement');
  const previewAction = STANDARD_SHORTCUTS.find((s) => s.id === 'previewApp');
  assert.ok(deleteAction);
  assert.equal(deleteAction?.defaultKey, 'Delete');
  assert.ok(previewAction);
  assert.equal(previewAction?.defaultKey, 'Ctrl+P');

  // 2. Default mapping
  const defaults = getDefaultShortcuts();
  assert.equal(defaults.deleteElement, 'Delete');
  assert.equal(defaults.previewApp, 'Ctrl+P');
  assert.equal(defaults.saveProject, 'Ctrl+S');

  // 3. Project custom overrides
  let project = createInitialProject('Shortcuts Test', 'blank');
  project.customShortcuts = {
    deleteElement: 'Backspace',
    previewApp: 'Ctrl+Shift+P',
  };
  const active = getActiveShortcuts(project);
  assert.equal(active.deleteElement, 'Backspace');
  assert.equal(active.previewApp, 'Ctrl+Shift+P');
  // untouched defaults should remain
  assert.equal(active.saveProject, 'Ctrl+S');

  // 4. eventToKeyCombo normalization
  const mockDeleteEvent = { key: 'Delete', ctrlKey: false, altKey: false, shiftKey: false, metaKey: false } as KeyboardEvent;
  assert.equal(eventToKeyCombo(mockDeleteEvent), 'Delete');

  const mockCtrlPEvent = { key: 'p', ctrlKey: true, altKey: false, shiftKey: false, metaKey: false } as KeyboardEvent;
  assert.equal(eventToKeyCombo(mockCtrlPEvent), 'Ctrl+P');

  const mockAlt1Event = { key: '1', ctrlKey: false, altKey: true, shiftKey: false, metaKey: false } as KeyboardEvent;
  assert.equal(eventToKeyCombo(mockAlt1Event), 'Alt+1');

  // 5. matchesShortcut
  assert.equal(matchesShortcut(mockCtrlPEvent, 'Ctrl+P'), true);
  assert.equal(matchesShortcut(mockCtrlPEvent, 'Ctrl+S'), false);
  assert.equal(matchesShortcut(mockDeleteEvent, 'Delete'), true);

  // 6. Conflict detection
  const conflict = findShortcutConflict('previewApp', 'Ctrl+S', defaults);
  assert.ok(conflict);
  assert.equal(conflict?.conflictingActionId, 'saveProject');
  assert.equal(conflict?.conflictingName, 'Save Project');

  const noConflict = findShortcutConflict('previewApp', 'Ctrl+Alt+P', defaults);
  assert.equal(noConflict, null);
});

test('UI elements tag filter and search matching', () => {
  const elements = [
    { title: 'Flex Container', desc: 'Auto-layout wrapper', tags: ['container', 'flex', 'layout', 'box', 'stack'] },
    { title: 'Action Button', desc: 'Interactive button with action pipeline', tags: ['button', 'cta', 'click', 'action'] },
    { title: 'Text Input', desc: 'Single-line field with label', tags: ['input', 'form', 'text', 'field'] },
    { title: 'Metric KPI Card', desc: 'Counter with trend percentage', tags: ['metric', 'kpi', 'stat', 'analytics'] },
  ];

  // Helper matching function mirroring LeftSidebar
  const filterByQuery = (q: string) => {
    const term = q.trim().toLowerCase();
    return elements.filter((item) =>
      item.title.toLowerCase().includes(term) ||
      item.desc.toLowerCase().includes(term) ||
      item.tags.some((t) => t.toLowerCase().includes(term))
    );
  };

  // Search by exact name
  assert.equal(filterByQuery('Button').length, 1);
  assert.equal(filterByQuery('Button')[0].title, 'Action Button');

  // Search by tag 'cta'
  assert.equal(filterByQuery('cta').length, 1);
  assert.equal(filterByQuery('cta')[0].title, 'Action Button');

  // Search by tag 'stat'
  assert.equal(filterByQuery('stat').length, 1);
  assert.equal(filterByQuery('stat')[0].title, 'Metric KPI Card');

  // Search by tag 'flex'
  assert.equal(filterByQuery('flex').length, 1);
  assert.equal(filterByQuery('flex')[0].title, 'Flex Container');

  // Non-matching term
  assert.equal(filterByQuery('nonexistent_random_xyz').length, 0);
});

test('getAlignedElementStyles and alignElements precision layout controls', async () => {
  const { getAlignedElementStyles, alignElements } = await import('./project-engine');

  // 1. Center Horizontally
  const centerH = getAlignedElementStyles({}, 'center-h');
  assert.equal(centerH.textAlign, 'center');
  assert.equal(centerH.alignSelf, 'center');
  assert.equal(centerH.marginLeft, 'auto');
  assert.equal(centerH.marginRight, 'auto');

  // 2. Center Vertically
  const centerV = getAlignedElementStyles({}, 'center-v');
  assert.equal(centerV.alignSelf, 'center');
  assert.equal(centerV.marginTop, 'auto');
  assert.equal(centerV.marginBottom, 'auto');

  // 3. Center Both
  const centerBoth = getAlignedElementStyles({}, 'center-both');
  assert.equal(centerBoth.textAlign, 'center');
  assert.equal(centerBoth.alignSelf, 'center');
  assert.equal(centerBoth.marginLeft, 'auto');
  assert.equal(centerBoth.marginRight, 'auto');
  assert.equal(centerBoth.marginTop, 'auto');
  assert.equal(centerBoth.marginBottom, 'auto');

  // 4. Anchoring (Left, Right, Top, Bottom, Full)
  const anchorLeft = getAlignedElementStyles({}, 'anchor-left');
  assert.equal(anchorLeft.textAlign, 'left');
  assert.equal(anchorLeft.alignSelf, 'start');
  assert.equal(anchorLeft.marginLeft, '0px');
  assert.equal(anchorLeft.marginRight, 'auto');

  const anchorRight = getAlignedElementStyles({}, 'anchor-right');
  assert.equal(anchorRight.textAlign, 'right');
  assert.equal(anchorRight.alignSelf, 'end');
  assert.equal(anchorRight.marginLeft, 'auto');
  assert.equal(anchorRight.marginRight, '0px');

  const fullWidth = getAlignedElementStyles({}, 'full-width');
  assert.equal(fullWidth.width, 'full');
  assert.equal(fullWidth.alignSelf, 'stretch');
  assert.equal(fullWidth.marginLeft, '0px');
  assert.equal(fullWidth.marginRight, '0px');

  // 5. Batch alignElements
  const btn = createNewElement('button');
  const heading = createNewElement('heading');
  const aligned = alignElements([btn, heading], 'center-h');
  assert.equal(aligned.length, 2);
  assert.equal(aligned[0].styles.alignSelf, 'center');
  assert.equal(aligned[1].styles.alignSelf, 'center');
});

test('3-layer Forge Schema: bidirectional serialization and AI Studio Structured Outputs', async () => {
  const { 
    projectToForgeJson, 
    forgeJsonToProject, 
    canvasElementToForgeNode, 
    forgeNodeToCanvasElement,
    FORGE_JSON_SCHEMA_DEFINITION,
    generateForgeNodesFromPrompt
  } = await import('./forge-schema');

  // 1. Verify official JSON schema properties
  assert.equal(FORGE_JSON_SCHEMA_DEFINITION.title, 'ForgeProject');
  assert.ok(FORGE_JSON_SCHEMA_DEFINITION.definitions.ForgeNode);
  assert.deepEqual(FORGE_JSON_SCHEMA_DEFINITION.required, [
    'schemaVersion', 'projectId', 'appName', 'platform', 'theme', 'pages'
  ]);

  // 2. Create rich project and serialize to 3-layer Forge JSON
  let project = createInitialProject('Forge SaaS Alpha', 'saas');
  const forgeJson = projectToForgeJson(project);

  // Layer 1: Project Root
  assert.equal(forgeJson.schemaVersion, '1.0');
  assert.equal(forgeJson.appName, 'Forge SaaS Alpha');
  assert.ok(forgeJson.theme);
  assert.equal(forgeJson.theme.fontFamily, 'Inter');
  assert.ok(Array.isArray(forgeJson.pages));
  assert.ok(forgeJson.pages.length >= 2);

  // Layer 2: Page Object
  const homePage = forgeJson.pages[0];
  assert.equal(homePage.id, 'page_home');
  assert.equal(homePage.route, '/');
  assert.ok(homePage.root);
  assert.equal(homePage.root.type, 'Container');

  // Layer 3: Recursive Nodes
  assert.ok(Array.isArray(homePage.root.children));
  assert.ok(homePage.root.children.length > 0);
  const firstChild = homePage.root.children[0];
  assert.ok(firstChild.id);
  assert.ok(firstChild.type);
  assert.ok(firstChild.props);
  assert.ok(firstChild.styles);

  // 3. Bidirectional deserialization: Forge JSON -> Project
  const reconstituted = forgeJsonToProject(forgeJson);
  assert.equal(reconstituted.id, project.id);
  assert.equal(reconstituted.name, project.name);
  assert.equal(reconstituted.pages.length, project.pages.length);
  assert.ok(reconstituted.pages[0].elements.length > 0);

  // 4. Node to CanvasElement bidirectional conversion
  const testNode = {
    id: 'test_node_1',
    type: 'Button',
    props: { text: 'Book Demo', buttonVariant: 'primary' },
    styles: { alignSelf: 'center', backgroundColor: '#2563eb' },
    events: {
      onClick: { action: 'NAVIGATE' as const, target: 'page_profile' },
    },
  };
  const canvasEl = forgeNodeToCanvasElement(testNode);
  assert.equal(canvasEl.id, 'test_node_1');
  assert.equal(canvasEl.type, 'button');
  assert.equal(canvasEl.props.text, 'Book Demo');
  assert.equal(canvasEl.props.whenClicked, 'openPage');
  assert.equal(canvasEl.props.targetPageId, 'page_profile');

  const backToNode = canvasElementToForgeNode(canvasEl);
  assert.equal(backToNode.id, 'test_node_1');
  assert.equal(backToNode.type, 'Button');
  assert.equal(backToNode.props.text, 'Book Demo');
  assert.equal(backToNode.events?.onClick.action, 'NAVIGATE');
  assert.equal(backToNode.events?.onClick.target, 'page_profile');

  // 5. Prompt-to-UI Node generation presets
  const pricingNodes = generateForgeNodesFromPrompt('pricing plans with toggle');
  assert.ok(pricingNodes.length >= 2, 'Pricing prompt should generate heading and container');
  assert.equal(pricingNodes[1].children?.length, 3, 'Pricing container should contain 3 tier cards');

  const dashboardNodes = generateForgeNodesFromPrompt('analytics dashboard kpi');
  assert.ok(dashboardNodes.length >= 3, 'Analytics prompt should generate stats and chart elements');
});

