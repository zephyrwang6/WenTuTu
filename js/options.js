// 保存设置
document.addEventListener('DOMContentLoaded', function() {
  const MAX_CUSTOM_PROMPTS = 5;
  const customPromptsContainer = document.getElementById('customPrompts');
  const promptTemplate = document.getElementById('promptTemplate');
  const addPromptButton = document.getElementById('addPrompt');
  const resetPromptsButton = document.getElementById('resetPrompts');
  const saveButton = document.getElementById('save');
  const testApiKeyButton = document.getElementById('testApiKey');
  const saveApiKeyButton = document.getElementById('saveApiKey');
  const apiTestSuccess = document.getElementById('apiTestSuccess');
  const apiTestError = document.getElementById('apiTestError');
  const toastElement = document.getElementById('toast');

  let customPrompts = [];
  
  // 默认内置提示词
  const defaultPrompts = [
    {
      id: 'default_prompt_1',
      name: '黑白逻辑图(3:4)',
      content: `## 用途
将文本转换为精准的单一逻辑关系SVG图

## 作者
空格的键盘

## 角色定义
你是一位精通逻辑关系分析和可视化的专家，具备以下能力：
- **熟知**：递进关系、流程关系、循环关系、层次结构、对比关系、矩阵关系
- **擅长**：深度文本分析、概念抽象、逻辑推理、简约可视化设计
- **方法**：语义网络分析、结构化思维、极简设计、清晰关系表达

## 处理流程
1. 深度分析文本中的各种逻辑关系
2. 智能选择最适合的关系类型
3. 抽象并精简核心概念
4. 设计简约的可视化方案
5. 生成优美的SVG图,大小为600*800

## 关系类型
- **递进关系**：表示概念或事件的渐进发展
- **流程关系**：表示步骤或阶段的顺序连接
- **循环关系**：表示概念或事件的循环往复
- **层次结构**：表示概念的包含、从属关系
- **对比关系**：表示概念间的对照、比较
- **矩阵关系**：表示多维度交叉的复杂关系

## SVG模板规范
- 画布尺寸：
- 箭头标记：简洁的黑色(#333333)细线箭头，线宽为1
- 颜色方案：黑白灰三色系
- 阴影效果：无阴影，保持平面感
- 线框和箭头多使用浅灰色，字体用重灰色

## 设计规范
- **布局**：极简布局，充分利用留白，保持呼吸感
- **颜色**：仅使用黑白灰色调，类似Notion的简约风格
- **文字**：无衬线字体，重要概念使用加粗，次要信息使用浅灰色
- **边框**：细线边框(1px)或无边框，保持轻盈感
- **连接**：直线或简单曲线连接，避免复杂路径
- **层次**：通过简单的缩进或分组表达层次关系
- **一致性**：保持所有元素风格统一，形状简单规整
- **适应性**：根据内容复杂度调整元素大小和位置
- **关系表达**：使用最少的视觉元素表达逻辑关系

## 运行规则
1. 分析输入文本，确定最适合的逻辑关系类型
2. 生成对应关系类型的SVG图
3. 必须输出完整的SVG代码
4. 不添加任何其他解释或评论`,
      enabled: true
    },
    {
      id: 'default_prompt_2',
      name: '渐变色配图(4:3)',
      content: `## 用途
将文本转换为精准的单一逻辑关系SVG图

## 角色定义
你是一位精通逻辑关系分析和可视化的专家，具备以下能力：
- **熟知**：递进关系、流程关系、循环关系、层次结构、对比关系、矩阵关系
- **擅长**：深度文本分析、概念抽象、逻辑推理、美观可视化设计
- **方法**：语义网络分析、结构化思维、创造性设计、多维度关系表达

## 处理流程
1. 深度分析文本中的各种逻辑关系
2. 智能选择最适合的关系类型
3. 抽象并精简核心概念
4. 设计美观的可视化方案
5. 生成优化的SVG图

## 关系类型
- **递进关系**：表示概念或事件的渐进发展
- **流程关系**：表示步骤或阶段的顺序连接
- **循环关系**：表示概念或事件的循环往复
- **层次结构**：表示概念的包含、从属关系
- **对比关系**：表示概念间的对照、比较
- **矩阵关系**：表示多维度交叉的复杂关系

## SVG模板规范
- 画布尺寸：800×600
- 箭头标记：小巧的浅灰色(#aaaaaa)虚线箭头，线宽为1，虚线间隔3,3
- 渐变色：使用蓝色系渐变(#f9f7f7→#dbe2ef, #dbe2ef→#c9d6ea)
- 阴影效果：轻微阴影(dx=2, dy=2, stdDeviation=2)

## 设计规范
- **布局**：确保元素布局合理，有足够留白和呼吸感
- **颜色**：使用和谐的渐变色增强可读性，主体使用蓝色系(#112d4e,#3f72af,#dbe2ef)
- **文字**：确保文字大小适中，重要概念加粗，次要信息字体较小
- **阴影**：适当使用阴影提升立体感
- **连接**：智能规划连接线路径，避免穿过其他元素，使用适当曲线
- **层次**：对复杂概念进行分层或分组表达，突出核心逻辑
- **一致性**：保持整体设计风格一致，各元素比例协调
- **适应性**：根据内容复杂度动态调整元素大小和位置
- **关系表达**：不同关系类型采用独特视觉语言，增强识别度

## 运行规则
1. 分析输入文本，确定最适合的逻辑关系类型
2. 生成对应关系类型的SVG图
3. 必须输出完整的SVG代码
4. 不添加任何其他解释或评论`,
      enabled: true
    }
  ];

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
      // 加载自定义提示词，如果没有则使用默认提示词
      if (items.customPrompts && items.customPrompts.length > 0) {
        customPrompts = items.customPrompts;
      } else {
        // 使用默认内置提示词
        customPrompts = [...defaultPrompts];
        // 保存默认提示词到存储
        savePrompts(false);
      }
      
      // 加载API密钥
      const apiKey = items.apiKey;
      if (apiKey) {
        document.getElementById('apiKey').value = apiKey;
      }
      
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
      showToast('自定义提示词数量已达上限');
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
    if (confirm('确定要删除这个自定义提示词吗？')) {
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
    if (confirm('确定要重置所有自定义提示词吗？')) {
      // 重置为默认内置提示词
      customPrompts = [...defaultPrompts];
      renderCustomPrompts();
      savePrompts();
    }
  }

  // 保存提示词到storage
  function savePrompts(showNotification = true) {
    chrome.storage.sync.set({ customPrompts }, function() {
      if (showNotification) {
        showToast('设置已保存');
      }
    });
  }

  // 测试API连接
  async function testApiConnection() {
    const apiKey = document.getElementById('apiKey').value.trim();
    
    if (!apiKey) {
      showToast('请先输入API密钥');
      return;
    }
    
    // 显示正在测试状态
    testApiKeyButton.disabled = true;
    testApiKeyButton.textContent = '正在测试...';
    apiTestSuccess.style.display = 'none';
    apiTestError.style.display = 'none';
    
    try {
      // 发送一个简单的请求到DeepSeek API
      const response = await fetch('https://api.deepseek.com/v1/models', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      // 检查响应
      if (response.ok) {
        // API密钥有效
        apiTestSuccess.style.display = 'block';
        apiTestError.style.display = 'none';
      } else {
        // API密钥无效
        const errorData = await response.json();
        apiTestError.textContent = `连接失败: ${errorData.error?.message || response.statusText}`;
        apiTestError.style.display = 'block';
        apiTestSuccess.style.display = 'none';
      }
    } catch (error) {
      // 网络错误或其他错误
      apiTestError.textContent = `连接失败: ${error.message}`;
      apiTestError.style.display = 'block';
      apiTestSuccess.style.display = 'none';
    } finally {
      // 恢复按钮状态
      testApiKeyButton.disabled = false;
      testApiKeyButton.textContent = '测试连接';
    }
  }

  // 保存所有设置
  function saveSettings() {
    // 获取API密钥
    const apiKey = document.getElementById('apiKey').value.trim();
    
    // 确保API密钥不为空
    if (!apiKey) {
      showToast('请输入有效的API密钥');
      return;
    }
    
    // 保存到Chrome存储
    chrome.storage.sync.set(
      { 
        apiKey: apiKey,
        customPrompts: customPrompts 
      },
      function() {
        showToast('设置已保存');
        
        // 确认设置已保存，通知background和其他页面
        chrome.runtime.sendMessage({
          action: "settingsUpdated",
          settings: { apiKey: apiKey }
        });
      }
    );
  }

  // 保存API密钥
  function saveApiKey() {
    const apiKey = document.getElementById('apiKey').value.trim();
    
    // 确保API密钥不为空
    if (!apiKey) {
      showToast('请输入有效的API密钥');
      return;
    }
    
    // 保存到Chrome存储
    chrome.storage.sync.set(
      { apiKey: apiKey },
      function() {
        showToast('API密钥已保存');
        
        // 确认设置已保存，通知background和其他页面
        chrome.runtime.sendMessage({
          action: "settingsUpdated",
          settings: { apiKey: apiKey }
        });
      }
    );
  }

  // 添加事件监听器
  addPromptButton.addEventListener('click', addPrompt);
  resetPromptsButton.addEventListener('click', resetPrompts);
  saveButton.addEventListener('click', saveSettings);
  testApiKeyButton.addEventListener('click', testApiConnection);
  saveApiKeyButton.addEventListener('click', saveApiKey);
  
  // 初始化
  loadSettings();
});
