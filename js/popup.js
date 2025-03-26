// Popup script
document.addEventListener('DOMContentLoaded', function() {
  // 获取元素
  const generateFullCoverBtn = document.getElementById('generateFullCover');
  const openSettingsLink = document.getElementById('openSettings');
  const promptTypeSelect = document.getElementById('promptType');
  const customTextArea = document.getElementById('customText');
  const charCountSpan = document.getElementById('charCount');
  const sendCustomTextBtn = document.getElementById('sendCustomText');

  // 提示词映射
  const PROMPTS = {
    default: "",
    xiaohongshu: `
;; 文图图提示词：根据用户输入的内容，生成通用型小红书风格的封面图SVG

(defun 小红书封面生成器 ()
  "你是一位精通设计和内容营销的AI助手，能够创建吸引眼球的小红书封面图"
  (擅长 . 视觉设计)
  (理解 . 准确把握用户内容的核心卖点)
  (分析 . 提炼关键信息并以视觉化方式呈现)
  (技能 . '(内容分析 标题创作 视觉元素设计 布局优化)))

(defun 生成渐变背景 (主题)
  (let ((颜色映射 '(
    (旅行 . ("#87CEEB" . "#4682B4"))
    (美食 . ("#FFB6C1" . "#FF69B4"))
    (科技 . ("#E6E6FA" . "#9370DB"))
    (时尚 . ("#FFDAB9" . "#FF8C00"))
    (默认 . ("#F0F8FF" . "#B0E0E6")))))
    (or (assoc 主题 颜色映射) (cdr (assoc '默认 颜色映射)))))

(defun 小红书封面SVG (用户内容)
  "基于用户输入的内容，生成一个小红书风格的SVG封面图"
  (let* (
    (内容分析 (分析用户内容 用户内容))
    (主题 (判断主题 内容分析))
    (主标题 (创建主标题 内容分析))
    (副标题 (创建副标题 内容分析))
    (核心要点 (提取核心要点 内容分析))
    (视觉元素 (选择视觉元素 内容分析 主题))
    (标签 (生成标签 内容分析)))
    (SVG封面卡片 主题 主标题 副标题 核心要点 视觉元素 标签)))

(defun SVG封面卡片 (主题 主标题 副标题 核心要点 视觉元素 标签)
  "把小红书封面内容输出为美观的SVG卡片"
  \`(svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800"
    ;; 渐变背景
    ,(应用渐变背景 (生成渐变背景 主题))
    ;; 主标题
    (text x="300" y="100" font-family="Arial, sans-serif" font-size="40" fill="#ffffff" text-anchor="middle" font-weight="bold" ,主标题)
    ;; 副标题
    (text x="300" y="150" font-family="Arial, sans-serif" font-size="24" fill="#ffffff" text-anchor="middle" ,副标题)
    ;; 视觉元素
    ,(插入视觉元素 视觉元素)
    ;; 核心要点
    ,(生成核心要点列表 核心要点)
    ;; 装饰元素
    ,(插入装饰元素 主题)
    ;; 标签
    ,(生成标签元素 标签)))

(defun 应用渐变背景 (颜色对)
  \`(defs
    (linearGradient id="bg-gradient" x1="0%" y1="0%" x2="0%" y2="100%"
      (stop offset="0%" style=,(format nil "stop-color:~A;stop-opacity:1" (car 颜色对)))
      (stop offset="100%" style=,(format nil "stop-color:~A;stop-opacity:1" (cdr 颜色对)))))
    (rect width="600" height="800" fill="url(#bg-gradient)"))

(defun 插入视觉元素 (视觉元素)
  \`(g
    (text x="300" y="220" font-family="Arial, sans-serif" font-size="60" fill="#ffffff" text-anchor="middle"
      ,(apply #'string-append 视觉元素))))

(defun 生成核心要点列表 (核心要点)
  \`(g
    ,@(loop for 要点 in 核心要点
            for index from 0
            collect
            \`(g
              (rect x="50" y=,(+ 280 (* index 60)) width="500" height="50" rx="25" ry="25" fill="rgba(255,255,255,0.2)")
              (text x="80" y=,(+ 310 (* index 60)) font-family="Arial, sans-serif" font-size="20" fill="#ffffff"
                ,(format nil "• ~A" 要点))))))

(defun 插入装饰元素 (主题)
  (let ((装饰元素 (选择装饰元素 主题)))
    \`(g ,@(loop for 元素 in 装饰元素
                collect (绘制装饰元素 元素)))))

(defun 生成标签元素 (标签)
  \`(g
    ,@(loop for 标签 in 标签
            for index from 0
            collect
            \`(g
              (rect x=,(+ 50 (* index 200)) y="700" width="150" height="40" rx="20" ry="20" fill="rgba(255,255,255,0.3)")
              (text x=,(+ 125 (* index 200)) y="725" font-family="Arial, sans-serif" font-size="18" fill="#ffffff" text-anchor="middle"
                ,(format nil "#~A" 标签))))))
                
     ;;; Attention: 运行规则!
    ;; 1. 必须生成SVG代码
    ;; 2. 接收用户输入之后，调用主函数 (小红书封面SVG 用户内容)
    ;; 3. 严格按照(SVG封面卡片)函数生成SVG内容
    ;; 4. 确保主标题简洁有力，不超过15个字
    ;; 5. 提取5-8个核心要点，以圆角矩形列表形式呈现
    ;; 6. 选择2-3个与内容相关的emoji作为视觉元素，不易过大
    ;; 7. 根据内容主题选择合适的背景渐变色，和主题高度相关
    ;; 8. 生成3个相关标签，增加曝光度
    ;; 9. No other comments!!
                `,
                
 
    wordcloud: `
;;文图图提示词：词云封面

请根据以下要求，修改SVG模板制作主题词云设计：

1. 提供[输入的内容]提炼高频关键词，参考下面svg模板，生成svg图 

2. 参考模板：
[opacity="0.1"/> <!-- 金币装饰 --> <circle cx="450" cy="300" r="4" fill="#FFD700" opacity="0.7"/> <circle cx="200" cy="500" r="4" fill="#FFD700" opacity="0.7"/> <circle cx="350" cy="450" r="4" fill="#FFD700" opacity="0.7"/> <!-- 购物车轨迹 --> <path d="M150,200 Q170,180 190,200 T230,200" fill="none" stroke="#FFA07A" stroke-width="2" opacity="0.5"/> <path d="M450,600 Q470,580 490,600 T530,600" fill="none" stroke="#FFA07A" stroke-width="2" opacity="0.5"/> <!-- 红包装饰 --> <path d="M50,300 L80,330 L50,360 Z" fill="#FFD700" opacity="0.3"/> <path d="M550,500 L520,530 L550,560 Z" fill="#FFD700" opacity="0.3"/> <g filter="url(#glow)"> <text x="300" y="400" font-size="48" text-anchor="middle" fill="#FFD700" opacity="1">双十一</text> <text x="200" y="300" font-size="32" text-anchor="middle" fill="#FFA07A" opacity="0.9">购物狂欢节</text> <text x="400" y="500" font-size="28" text-anchor="middle" fill="#FFE4B5" opacity="0.85">天猫</text> <text x="150" y="450" font-size="24" text-anchor="middle" fill="#FFDAB9" opacity="0.8">淘宝</text> <text x="450" y="350" font-size="22" text-anchor="middle" fill="#FFE4C4" opacity="0.75">优惠券</text> <text x="250" y="550" font-size="20" text-anchor="middle" fill="#FFEFD5" opacity="0.7">抢购</text> <text x="350" y="250" font-size="18" text-anchor="middle" fill="#FFF8DC" opacity="0.65">秒杀</text> <text x="100" y="600" font-size="16" text-anchor="middle" fill="#FFEBCD" opacity="0.6">购物车</text> <text x="500" y="450" font-size="16" text-anchor="middle" fill="#FFE4B5" opacity="0.55">红包雨</text> <text x="200" y="200" font-size="14" text-anchor="middle" fill="#FFDAB9" opacity="0.5" transform="rotate(-15,200,200)">满减</text> <text x="400" y="650" font-size="14" text-anchor="middle" fill="#FFE4C4" opacity="0.48">直播带货</text> <text x="300" y="150" font-size="12" text-anchor="middle" fill="#FFEFD5" opacity="0.46">狂欢盛典</text> <text x="520" y="550" font-size="18" text-anchor="middle" fill="#FFF8DC" opacity="0.44">年度盛典</text> <text x="80" y="350" font-size="16" text-anchor="middle" fill="#FFEBCD" opacity="0.42" transform="rotate(15,80,350)">预售</text> <text x="250" y="670" font-size="14" text-anchor="middle" fill="#FFE4B5" opacity="0.4">折扣</text> <text x="450" y="180" font-size="14" text-anchor="middle" fill="#FFDAB9" opacity="0.38" transform="rotate(-10,450,180)">购物节</text> <text x="150" y="520" font-size="14" text-anchor="middle" fill="#FFE4C4" opacity="0.36">剁手</text> <text x="350" y="600" font-size="12" text-anchor="middle" fill="#FFEFD5" opacity="0.34">下单</text> <text x="250" y="130" font-size="12" text-anchor="middle" fill="#FFF8DC" opacity="0.32" transform="rotate(10,250,130)">快递</text> <text x="500" y="280" font-size="12" text-anchor="middle" fill="#FFEBCD" opacity="0.3">物流</text> <text x="100" y="450" font-size="18" text-anchor="middle" fill="#FFE4B5" opacity="0.44">拼团</text> <text x="450" y="420" font-size="16" text-anchor="middle" fill="#FFDAB9" opacity="0.42" transform="rotate(15,450,420)">限时特惠</text> <text x="180" y="160" font-size="14" text-anchor="middle" fill="#FFE4C4" opacity="0.4">凑单</text> <text x="380" y="360" font-size="12" text-anchor="middle" fill="#FFEFD5" opacity="0.38">支付宝</text> <text x="300" y="700" font-size="16" text-anchor="middle" fill="#FFF8DC" opacity="0.44">购物清单</text> <text x="420" y="280" font-size="14" text-anchor="middle" fill="#FFEBCD" opacity="0.42">领券中心</text> <text x="180" y="540" font-size="12" text-anchor="middle" fill="#FFE4B5" opacity="0.4">价格保护</text> <text x="480" y="460" font-size="14" text-anchor="middle" fill="#FFDAB9" opacity="0.38">购物津贴</text> <text x="150" y="400" font-size="12" text-anchor="middle" fill="#FFE4C4" opacity="0.36">省钱</text> </g> </svg>]

3. 设计规范：
A. 视觉风格：
- 选择与主题相关的背景渐变色（通过修改 bg-gradient 中的颜色）
- 装饰元素颜色需与背景形成和谐对比
- 保持发光效果（glow filter）
B. 核心布局：
- 维持原有 viewBox="0 0 600 800" 尺寸
- 保留同心圆装饰（3个圆圈结构）
- 保持装饰点和路径的基本位置
C. 文字处理：
- 主题词放置在中心位置 (y=400 附近)
- 主题词字号设为最大 (font-size="48")
- 如主题词过长，可分行显示（通过调整y坐标）
- 确保主题词完整显示，不省略
D. 关键词编排：
- 替换所有文字为用户输入内容中的高频词或相关词
- 保持原有的字号层级（48-12px）
- 保持原有的不透明度渐变（1-0.3）
- 维持原有的旋转角度和位置分布
E. 装饰要素：
- 修改注释标识以匹配新主题
- 根据主题调整装饰元素的形状或样式
- 保持原有的透明度和位置关系
F. 输出规范：
- 必须生成完整有效的SVG代码
- 包含所有必要的SVG元素和属性
- 保持原有的过滤器效果
- 不添加任何非必要的注释
- 确保SVG代码格式规范
`,

    textlogic: `
;; 文图图提示词：文本逻辑关系图
;; 任务：将输入的文本内容转换为简洁清晰的逻辑关系SVG图

;; 特性定义
(defvar *支持的逻辑关系* '(递进关系 流程关系 循环关系 层次结构 对比关系 矩阵关系))
(defvar *精简视觉风格* '(极简 现代 清晰 专业 灰度))
(defvar *图表类型* '(流程图 关系图 树状图 矩阵图 雷达图 时间线))

;; 风格规范
- 配色方案：灰度色调为主，使用#eee、#ddd、#ccc、#999、#666、#333色阶
- 字体规范：无衬线字体，主要概念用粗体，次要概念用细体
- 线条样式：轻量细线，灰色虚线（透明度在0.6-0.8之间）
- 形状风格：简约圆角矩形，最小化边框，突出内容
- 排版原则：重视信息层次，保持视觉平衡，给适当留白
- 箭头样式：细线灰色虚线箭头，视觉轻量
;; - 必须确保准确表达原文本中的逻辑关系
;; - 尽量使用现代简约的视觉语言，避免过多的装饰元素
;; - 保持整体设计的一致性、美观性和专业性
;; - 确保文字的可读性和清晰度，适当使用字体大小和粗细变化
;; - 使用灰色虚线箭头智能表示关系的方向和连接，避免箭头穿过色块
;; - 在色块附近合理安排细分内容，保持整洁而不省略关键细节
;; - 画布采用600*800，整体布局要有适当的留白和呼吸感，合理安排元素位置

;; 处理流程
(defun 解析逻辑关系 (文本)
  (cond
    ((流程关系? 文本) '流程关系)
    ((递进关系? 文本) '递进关系)
    ((循环关系? 文本) '循环关系)
    ((层次结构? 文本) '层次结构)
    ((对比关系? 文本) '对比关系)
    ((矩阵关系? 文本) '矩阵关系)
    (t '流程关系))) ;; 默认为流程关系

(defun 生成SVG图 (文本)
  (let* ((逻辑关系 (解析逻辑关系 文本))
         (核心概念 (提取核心概念 文本))
         (关系连接 (建立关系 核心概念 逻辑关系)))
    (渲染SVG 核心概念 关系连接 逻辑关系)))

;; 输出：完整的SVG代码，不包含任何解释性文字

(defvar *注意事项*
"1. 仅输出SVG代码，不要有任何其他解释或说明
2. 确保理解文本的真实逻辑关系，避免生成无意义的图表
3. 尽量提炼核心概念，但不要丢失重要信息和逻辑
4. 保持图表简洁清晰，信息层次分明
5. 生成的SVG要完整有效，包含所有必要的元素和属性")
`
  };

  // 监听提示词类型选择变化
  promptTypeSelect.addEventListener('change', async function() {
    try {
      // 获取当前选择的提示词
      const selectedPrompt = await getSelectedPrompt();
      
      // 发送提示词信息到background script
      chrome.runtime.sendMessage({
        action: "savePrompt",
        promptText: selectedPrompt.text,
        isCustom: selectedPrompt.isCustom
      });
    } catch (error) {
      console.error('保存当前提示词失败:', error);
    }
  });

  // 监听自定义文本输入和字符计数
  customTextArea.addEventListener('input', function() {
    const textLength = this.value.length;
    charCountSpan.textContent = `${textLength}/1500`;
    
    // 添加字符数预警颜色
    if (textLength > 1350) {
      charCountSpan.style.color = '#ff4444';
    } else if (textLength > 1000) {
      charCountSpan.style.color = '#ff8800';
    } else {
      charCountSpan.style.color = '#666';
    }
  });

  // 处理自定义文本发送
  sendCustomTextBtn.addEventListener('click', async function() {
    try {
      const customText = customTextArea.value.trim();
      
      // 验证输入
      if (!customText) {
        alert('请先输入自定义文本');
        return;
      }
      
      // 首先检查API密钥
      if (!await checkApiKey()) return;
      
      // 获取当前选择的提示词
      const selectedPrompt = await getSelectedPrompt();
      
      // 获取当前标签页
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tabs || tabs.length === 0) {
        throw new Error('无法获取当前标签页');
      }
      const tab = tabs[0];
      
      // 注入content script
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['js/content.js']
      });
      
      // 发送消息到background script生成封面
      chrome.runtime.sendMessage({
        action: "generateCover",
        text: customText,
        type: "custom",
        systemPrompt: selectedPrompt.text,
        isCustomPrompt: selectedPrompt.isCustom,
        pageContent: null // 自定义文本不需要页面内容
      });
      
      // 关闭popup
      window.close();
      
    } catch (error) {
      console.error('Error:', error);
      alert('错误：' + error.message);
    }
  });

  // 获取当前选中的提示词内容
  async function getSelectedPrompt() {
    const promptType = promptTypeSelect.value;
    
    // 如果是内置提示词类型
    if (PROMPTS[promptType]) {
      return {
        text: PROMPTS[promptType],
        isCustom: false
      };
    }
    
    // 否则尝试获取自定义提示词
    try {
      const settings = await chrome.storage.sync.get(['customPrompts']);
      const customPrompts = settings.customPrompts || [];
      
      // 查找对应ID的自定义提示词
      const customPrompt = customPrompts.find(p => p.id === promptType && p.enabled);
      
      if (!customPrompt) {
        throw new Error(`未找到ID为 ${promptType} 的自定义提示词`);
      }
      
      return {
        text: customPrompt.content,
        isCustom: true
      };
    } catch (error) {
      console.error('获取自定义提示词失败:', error);
      alert('获取提示词失败: ' + error.message);
      throw error;
    }
  }

  // 检查是否已配置API密钥
  async function checkApiKey() {
    const settings = await chrome.storage.sync.get(['apiKey']);
    if (!settings.apiKey) {
      alert('请先在设置页面配置 DeepSeek API 密钥');
      chrome.runtime.openOptionsPage();
      return false;
    }
    return true;
  }

  // 处理生成全文封面
  generateFullCoverBtn.addEventListener('click', async function() {
    try {
      // 首先检查API密钥
      if (!await checkApiKey()) return;

      // 获取当前标签页
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tabs || tabs.length === 0) {
        throw new Error('无法获取当前标签页');
      }
      const tab = tabs[0];

      // 注入content script
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['js/content.js']
      });

      // 从页面获取内容
      const response = await chrome.tabs.sendMessage(tab.id, { 
        action: "getPageContent" 
      });

      if (!response || !response.content) {
        throw new Error('无法获取页面内容');
      }

      // 获取当前选择的提示词
      const selectedPrompt = await getSelectedPrompt();

      // 发送消息到background script生成封面
      chrome.runtime.sendMessage({
        action: "generateCover",
        text: response.content,
        type: "full",
        systemPrompt: selectedPrompt.text,
        isCustomPrompt: selectedPrompt.isCustom,
        pageContent: selectedPrompt.isCustom ? response.content : null
      });

      // 关闭popup
      window.close();

    } catch (error) {
      console.error('Error:', error);
      alert('错误：' + error.message);
    }
  });

  // 打开设置页面
  openSettingsLink.addEventListener('click', function() {
    chrome.runtime.openOptionsPage();
  });

  // 处理生成结果
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "coverGenerated") {
      // 获取当前标签页
      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        if (tabs[0]) {
          // 发送结果到content script
          chrome.tabs.sendMessage(tabs[0].id, {
            action: "coverGenerated",
            result: request.result
          });
          window.close();
        }
      });
    } else if (request.action === "error") {
      alert("错误：" + request.message);
    }
  });

  // 初始化
  function initialize() {
    // 加载自定义提示词选项
    chrome.storage.sync.get(['customPrompts'], function(result) {
      const customPrompts = result.customPrompts || [];
      
      // 清除已有的自定义提示词选项（如果重新初始化）
      const existingOptions = promptTypeSelect.querySelectorAll('option[data-custom="true"]');
      existingOptions.forEach(option => option.remove());
      
      // 添加已启用的自定义提示词选项
      customPrompts.forEach(prompt => {
        if (prompt.enabled) {
          const option = document.createElement('option');
          option.value = prompt.id;
          option.textContent = prompt.name;
          option.dataset.custom = "true";
          promptTypeSelect.appendChild(option);
        }
      });
      
      // 初始化时保存当前选择的提示词到background
      getSelectedPrompt().then(selectedPrompt => {
        chrome.runtime.sendMessage({
          action: "savePrompt",
          promptText: selectedPrompt.text,
          isCustom: selectedPrompt.isCustom
        });
      }).catch(error => {
        console.error('初始化提示词保存失败:', error);
      });
    });
  }
  
  // 初始化
  initialize();
});
