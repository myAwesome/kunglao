'use strict';

const ACTIONS_ID = 'eng-help-selection-actions';
const MAX_WIDTH_OFFSET = 16;
const VERTICAL_OFFSET = 10;

let actionsNode;
let knowBtn;
let ignoreBtn;
let selectedText = '';
let updateScheduled = false;

function initActions() {
  if (actionsNode) {
    return;
  }

  actionsNode = document.createElement('div');
  actionsNode.id = ACTIONS_ID;
  actionsNode.className = 'eng-help-selection-actions';

  knowBtn = document.createElement('button');
  knowBtn.className = 'eng-help-selection-btn eng-help-selection-btn--know';
  knowBtn.type = 'button';
  knowBtn.textContent = 'Know';

  ignoreBtn = document.createElement('button');
  ignoreBtn.className = 'eng-help-selection-btn eng-help-selection-btn--ignore';
  ignoreBtn.type = 'button';
  ignoreBtn.textContent = 'Ignore';

  actionsNode.appendChild(knowBtn);
  actionsNode.appendChild(ignoreBtn);
  document.documentElement.appendChild(actionsNode);

  knowBtn.addEventListener('mousedown', e => e.preventDefault());
  ignoreBtn.addEventListener('mousedown', e => e.preventDefault());

  knowBtn.addEventListener('click', () => sendSelectionAction('know'));
  ignoreBtn.addEventListener('click', () => sendSelectionAction('ignore'));
}

function sendSelectionAction(action) {
  if (!selectedText.trim()) {
    hideActions();
    return;
  }

  chrome.runtime.sendMessage({
    type: 'selection-action',
    action,
    selectionText: selectedText
  });

  hideActions();
  selectedText = '';
}

function hideActions() {
  if (!actionsNode) {
    return;
  }
  actionsNode.style.display = 'none';
}

function showActions(selection) {
  if (!actionsNode) {
    return;
  }

  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  const text = selection.toString().trim();

  if (!text || (rect.width === 0 && rect.height === 0)) {
    hideActions();
    return;
  }

  selectedText = text;
  actionsNode.style.display = 'flex';

  const menuRect = actionsNode.getBoundingClientRect();
  const scrollX = window.scrollX || window.pageXOffset;
  const scrollY = window.scrollY || window.pageYOffset;
  const left = Math.max(
    scrollX + 8,
    Math.min(
      scrollX + window.innerWidth - menuRect.width - MAX_WIDTH_OFFSET,
      scrollX + rect.left + (rect.width - menuRect.width) / 2
    )
  );
  const top = Math.max(
    scrollY + 8,
    scrollY + rect.top - menuRect.height - VERTICAL_OFFSET
  );

  actionsNode.style.left = `${left}px`;
  actionsNode.style.top = `${top}px`;
}

function onSelectionChange() {
  if (updateScheduled) {
    return;
  }

  updateScheduled = true;
  window.requestAnimationFrame(() => {
    updateScheduled = false;
    syncSelectionActions();
  });
}

function syncSelectionActions() {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
    hideActions();
    return;
  }

  showActions(selection);
}

initActions();
document.addEventListener('selectionchange', onSelectionChange);
document.addEventListener('mouseup', onSelectionChange);
document.addEventListener('keyup', onSelectionChange);
document.addEventListener('scroll', hideActions, true);
document.addEventListener('mousedown', event => {
  if (!actionsNode || actionsNode.contains(event.target)) {
    return;
  }
  hideActions();
});
