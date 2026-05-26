const customSelectRegistry = new WeakMap();
let customSelectDocumentListenerAttached = false;

function renderCustomSelectOptions(select, trigger, optionsContainer) {
  optionsContainer.innerHTML = '';

  const addOption = (option) => {
    const optionEl = document.createElement('div');
    optionEl.className = 'custom-select-option';
    optionEl.textContent = option.text;
    optionEl.dataset.value = option.value;

    if (option.selected) {
      optionEl.classList.add('selected');
    }

    optionEl.addEventListener('click', (e) => {
      e.stopPropagation();
      select.value = option.value;
      optionsContainer.classList.add('hidden');
      trigger.classList.remove('open');
      select.dispatchEvent(new Event('change'));
    });

    optionsContainer.appendChild(optionEl);
  };

  Array.from(select.children).forEach(child => {
    if (child.tagName === 'OPTGROUP') {
      const groupEl = document.createElement('div');
      groupEl.className = 'custom-select-group';
      groupEl.textContent = child.label;
      optionsContainer.appendChild(groupEl);
      Array.from(child.children).forEach(addOption);
    } else if (child.tagName === 'OPTION') {
      addOption(child);
    }
  });
}

function updateCustomSelectDisplay(select) {
  const state = customSelectRegistry.get(select);
  if (!state) return;

  const { trigger, optionsContainer } = state;
  trigger.textContent = select.options[select.selectedIndex]?.text || '';
  optionsContainer.querySelectorAll('.custom-select-option').forEach(el => {
    el.classList.toggle('selected', el.dataset.value === select.value);
  });
}

function refreshCustomSelect(select) {
  const state = customSelectRegistry.get(select);
  if (!state) return;

  renderCustomSelectOptions(select, state.trigger, state.optionsContainer);
  updateCustomSelectDisplay(select);
}

function initCustomSelects() {
  document.querySelectorAll('select.select-input').forEach(select => {
    // Check if already initialized
    if (select.nextElementSibling && select.nextElementSibling.classList.contains('custom-select-wrapper')) {
      refreshCustomSelect(select);
      return;
    }

    select.style.display = 'none';
    
    const wrapper = document.createElement('div');
    wrapper.className = 'custom-select-wrapper';
    select.parentNode.insertBefore(wrapper, select.nextSibling);
    
    const trigger = document.createElement('div');
    trigger.className = 'custom-select-trigger select-input';
    trigger.textContent = select.options[select.selectedIndex]?.text || '';
    wrapper.appendChild(trigger);
    
    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'custom-select-options hidden';

    wrapper.appendChild(optionsContainer);
    customSelectRegistry.set(select, { trigger, optionsContainer });
    refreshCustomSelect(select);
    
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = !optionsContainer.classList.contains('hidden');
      
      // Close all others
      document.querySelectorAll('.custom-select-options').forEach(el => {
        el.classList.add('hidden');
        if (el.previousElementSibling) {
          el.previousElementSibling.classList.remove('open');
        }
      });
      
      if (!isOpen) {
        optionsContainer.classList.remove('hidden');
        trigger.classList.add('open');
      }
    });

    // Handle updates to the original select (e.g. loading settings)
    select.addEventListener('change', () => {
      updateCustomSelectDisplay(select);
    });
  });

  if (!customSelectDocumentListenerAttached) {
    document.addEventListener('click', () => {
      document.querySelectorAll('.custom-select-options').forEach(el => {
        el.classList.add('hidden');
        if (el.previousElementSibling) {
          el.previousElementSibling.classList.remove('open');
        }
      });
    });
    customSelectDocumentListenerAttached = true;
  }
}

window.refreshCustomSelect = refreshCustomSelect;
window.refreshCustomSelects = initCustomSelects;

// Auto-init on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  // Delay slightly to let other scripts populate selects or set initial values
  setTimeout(initCustomSelects, 100);
});
