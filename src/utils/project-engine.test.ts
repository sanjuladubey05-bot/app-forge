import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createInitialProject,
  createNewElement,
  addElement,
  updateElement,
  deleteElement,
  duplicateElement,
  reorderElements,
  toggleElementVisibility,
  toggleElementLock,
  exportProjectToJson,
  exportProjectToHtml,
} from './project-engine';

test('createInitialProject generates valid project structure', () => {
  const project = createInitialProject('Test Alpha', 'blank');
  assert.equal(project.name, 'Test Alpha');
  assert.equal(project.elements.length > 0, true);
  assert.equal(project.viewport, 'desktop');
  assert.equal(typeof project.id, 'string');
});

test('createNewElement creates typed canvas element with defaults', () => {
  const btn = createNewElement('button');
  assert.equal(btn.type, 'button');
  assert.equal(btn.props.buttonVariant, 'primary');
  assert.equal(btn.styles.backgroundColor, '#3b82f6');
  assert.equal(typeof btn.id, 'string');
});

test('addElement adds a component to the project', () => {
  const project = createInitialProject('My App');
  const countBefore = project.elements.length;
  const newHeading = createNewElement('heading');
  const updated = addElement(project, newHeading);

  assert.equal(updated.elements.length, countBefore + 1);
  assert.equal(updated.elements[updated.elements.length - 1].id, newHeading.id);
});

test('updateElement mutates component props and styles correctly', () => {
  const project = createInitialProject('My App');
  const elId = project.elements[0].id;
  
  const updated = updateElement(project, elId, {
    props: { text: 'Updated Custom Title' },
    styles: { backgroundColor: '#10b981' },
  });

  const modified = updated.elements.find((el) => el.id === elId);
  assert.ok(modified);
  assert.equal(modified.props.text, 'Updated Custom Title');
  assert.equal(modified.styles.backgroundColor, '#10b981');
});

test('deleteElement removes target element', () => {
  const project = createInitialProject('My App');
  const elToDelete = project.elements[0].id;
  const updated = deleteElement(project, elToDelete);

  assert.equal(updated.elements.some((el) => el.id === elToDelete), false);
});

test('duplicateElement clones element right after original', () => {
  const project = createInitialProject('My App');
  const original = project.elements[0];
  const updated = duplicateElement(project, original.id);

  assert.equal(updated.elements.length, project.elements.length + 1);
  const copy = updated.elements[1];
  assert.notEqual(copy.id, original.id);
  assert.equal(copy.props.text, original.props.text);
});

test('reorderElements swaps positions in array', () => {
  const project = createInitialProject('My App');
  const firstId = project.elements[0].id;
  const secondId = project.elements[1].id;

  const reordered = reorderElements(project, 0, 1);
  assert.equal(reordered.elements[0].id, secondId);
  assert.equal(reordered.elements[1].id, firstId);
});

test('toggleElementVisibility and lock work idempotently', () => {
  const project = createInitialProject('My App');
  const elId = project.elements[0].id;

  const toggledVis = toggleElementVisibility(project, elId);
  assert.equal(toggledVis.elements[0].hidden, true);

  const toggledLock = toggleElementLock(project, elId);
  assert.equal(toggledLock.elements[0].locked, true);
});

test('exportProjectToJson and exportProjectToHtml output valid strings', () => {
  const project = createInitialProject('Export Test', 'saas');
  const json = exportProjectToJson(project);
  assert.ok(json.includes('"name": "Export Test"'));

  const html = exportProjectToHtml(project);
  assert.ok(html.includes('<!DOCTYPE html>'));
  assert.ok(html.includes('Built with AppForge'));
});
