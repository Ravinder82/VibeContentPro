function initCustomSelects() {
  document.querySelectorAll('select.select-input').forEach(select => {
    // Check if already initialized
    if (select.nextElementSibling && select.nextElementSibling.classList.contains('custom-select-wrapper')) {
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
    
    Array.from(select.options).forEach(option => {
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
        trigger.textContent = option.text;
        
        optionsContainer.querySelectorAll('.custom-select-option').forEach(el => el.classList.remove('selected'));
        optionEl.classList.add('selected');
        
        optionsContainer.classList.add('hidden');
        trigger.classList.remove('open');
        
        select.dispatchEvent(new Event('change'));
      });
      optionsContainer.appendChild(optionEl);
    });
    
    wrapper.appendChild(optionsContainer);
    
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
      trigger.textContent = select.options[select.selectedIndex]?.text || '';
      optionsContainer.querySelectorAll('.custom-select-option').forEach(el => {
        if (el.dataset.value === select.value) {
          el.classList.add('selected');
        } else {
          el.classList.remove('selected');
        }
      });
    });
  });
  
  document.addEventListener('click', () => {
    document.querySelectorAll('.custom-select-options').forEach(el => {
      el.classList.add('hidden');
      if (el.previousElementSibling) {
        el.previousElementSibling.classList.remove('open');
      }
    });
  });
}

// Auto-init on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  // Delay slightly to let other scripts populate selects or set initial values
  setTimeout(initCustomSelects, 100);
});
