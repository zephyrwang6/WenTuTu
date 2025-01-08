// 保存设置
document.addEventListener('DOMContentLoaded', function() {
  const MAX_CUSTOM_PROMPTS = 5;
  const customPromptsContainer = document.getElementById('customPrompts');
  const promptTemplate = document.getElementById('promptTemplate');
  const addPromptButton = document.getElementById('addPrompt');
  const resetPromptsButton = document.getElementById('resetPrompts');
  const saveButton = document.getElementById('save');
  const languageSelect = document.getElementById('languageSelect');
  const toastElement = document.getElementById('toast');

  let customPrompts = [];
  let currentLang = 'en';

  // 国际化数据
  const i18n = {
    en: {
      customPrompts: {
        maxPrompts: 'Maximum number of custom prompts reached',
        deleteConfirm: 'Are you sure you want to delete this custom prompt?',
        resetConfirm: 'Are you sure you want to reset all custom prompts?',
        validation: {
          apiKeyRequired: 'API Key is required',
          nameContentRequired: 'Name and content are required for enabled prompts'
        }
      },
      saveSuccess: 'Settings saved successfully'
    },
    zh: {
      customPrompts: {
        maxPrompts: '自定义提示词数量已达上限',
        deleteConfirm: '确定要删除这个自定义提示词吗？',
        resetConfirm: '确定要重置所有自定义提示词吗？',
        validation: {
          apiKeyRequired: 'API Key 是必填项',
          nameContentRequired: '启用的自定义提示词必须填写名称和内容'
        }
      },
      saveSuccess: '设置已保存'
    }
  };

  // 初始化语言
  function initLanguage() {
    chrome.storage.sync.get(['language'], function(result) {
      currentLang = result.language || 'en';
      languageSelect.value = currentLang;
      updateLanguage();
    });
  }

  // 更新页面语言
  function updateLanguage() {
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      // 直接使用全局的 i18n 对象
      if (window.i18n && window.i18n[currentLang] && window.i18n[currentLang][key]) {
        element.textContent = window.i18n[currentLang][key];
      }
    });
  }

  // 获取嵌套对象的值
  function getNestedValue(obj, path) {
    return path.split('.').reduce((prev, curr) => prev && prev[curr], obj);
  }

  // 显示Toast消息
  function showToast(message, duration = 3000) {
    toastElement.textContent = message;
    toastElement.classList.add('show');
    setTimeout(() => {
      toastElement.classList.remove('show');
    }, duration);
  }

  // 加载已保存的设置
  function loadSettings() {
    chrome.storage.sync.get(['apiKey', 'customPrompts'], function(items) {
      document.getElementById('apiKey').value = items.apiKey || '';
      
      // 加载自定义提示词
      customPrompts = items.customPrompts || [];
      renderCustomPrompts();
    });
  }

  // 渲染自定义提示词
  function renderCustomPrompts() {
    customPromptsContainer.innerHTML = '';
    customPrompts.forEach((prompt, index) => {
      const promptElement = createPromptElement(prompt, index);
      customPromptsContainer.appendChild(promptElement);
    });
    
    // 根据数量控制添加按钮状态
    addPromptButton.disabled = customPrompts.length >= MAX_CUSTOM_PROMPTS;
    updateLanguage();
  }

  // 创建提示词元素
  function createPromptElement(prompt, index) {
    const template = promptTemplate.content.cloneNode(true);
    const promptDiv = template.querySelector('.custom-prompt');
    
    // 设置ID
    const id = prompt.id || generateId();
    promptDiv.dataset.id = id;
    
    // 替换模板中的ID
    template.querySelectorAll('[id$="{{id}}"]').forEach(el => {
      el.id = el.id.replace('{{id}}', id);
    });
    
    // 设置值
    const enabledCheckbox = template.querySelector('.prompt-enabled');
    const nameInput = template.querySelector('.prompt-name');
    const contentTextarea = template.querySelector('.prompt-content');
    
    enabledCheckbox.checked = prompt.enabled !== false;
    nameInput.value = prompt.name || '';
    contentTextarea.value = prompt.content || '';
    
    // 添加事件监听器
    template.querySelector('.delete-prompt').addEventListener('click', () => {
      deletePrompt(index);
    });
    
    enabledCheckbox.addEventListener('change', () => {
      updatePrompt(index, { enabled: enabledCheckbox.checked });
    });
    
    nameInput.addEventListener('input', () => {
      updatePrompt(index, { name: nameInput.value });
    });
    
    contentTextarea.addEventListener('input', () => {
      updatePrompt(index, { content: contentTextarea.value });
    });
    
    return template;
  }

  // 生成唯一ID
  function generateId() {
    return 'prompt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // 添加新提示词
  function addPrompt() {
    if (customPrompts.length >= MAX_CUSTOM_PROMPTS) {
      showToast(i18n[currentLang].customPrompts.maxPrompts);
      return;
    }
    
    const newPrompt = {
      id: generateId(),
      name: '',
      content: '',
      enabled: true
    };
    
    customPrompts.push(newPrompt);
    renderCustomPrompts();
    savePrompts();
  }

  // 删除提示词
  function deletePrompt(index) {
    if (confirm(i18n[currentLang].customPrompts.deleteConfirm)) {
      customPrompts.splice(index, 1);
      renderCustomPrompts();
      savePrompts();
    }
  }

  // 更新提示词
  function updatePrompt(index, updates) {
    customPrompts[index] = { ...customPrompts[index], ...updates };
    savePrompts();
  }

  // 重置所有提示词
  function resetPrompts() {
    if (confirm(i18n[currentLang].customPrompts.resetConfirm)) {
      customPrompts = [];
      renderCustomPrompts();
      savePrompts();
    }
  }

  // 保存提示词到storage
  function savePrompts() {
    chrome.storage.sync.set({ customPrompts }, function() {
      showToast(i18n[currentLang].saveSuccess);
    });
  }

  // 保存所有设置
  function saveSettings() {
    const apiKey = document.getElementById('apiKey').value;

    // 验证必填项
    if (!apiKey) {
      showToast(i18n[currentLang].customPrompts.validation.apiKeyRequired, 'error');
      return;
    }

    // 验证自定义提示词
    const invalidPrompts = customPrompts.filter(p => p.enabled && (!p.name || !p.content));
    if (invalidPrompts.length > 0) {
      showToast(i18n[currentLang].customPrompts.validation.nameContentRequired, 'error');
      return;
    }

    chrome.storage.sync.set({
      apiKey,
      customPrompts
    }, function() {
      showToast(i18n[currentLang].saveSuccess);
    });
  }

  // 添加事件监听器
  addPromptButton.addEventListener('click', addPrompt);
  resetPromptsButton.addEventListener('click', resetPrompts);
  saveButton.addEventListener('click', saveSettings);
  
  // 语言切换事件监听
  languageSelect.addEventListener('change', function(e) {
    currentLang = e.target.value;
    chrome.storage.sync.set({ language: currentLang }, function() {
      updateLanguage();
    });
  });

  // 初始化
  initLanguage();
  loadSettings();
});
