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
