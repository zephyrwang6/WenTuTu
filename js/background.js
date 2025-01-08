// 创建上下文菜单
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "generateCoverFromSelection",
    title: "为选中文本生成封面",
    contexts: ["selection"],
  });
});

// 处理上下文菜单点击
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "generateCoverFromSelection") {
    const customPrompt = await getSelectedPrompt();
    generateCover(info.selectionText, customPrompt);
  }
});

// 获取当前选中的提示词内容
async function getSelectedPrompt() {
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
    ;; 8. 添加与主题相关的装饰元素
    ;; 9. 生成3个相关标签，增加曝光度
    ;; 10. No other comments!!
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
F. 颜色规范：
- 背景使用两种相近色渐变
- 文字颜色需与背景形成足够对比
- 装饰元素颜色需协调统一

4. 代码结构：
- 保持原有的 SVG 基本结构
- 保留所有 defs 定义
- 维持原有的分组和图层顺序
- 保留注释，但更新注释内容

;; 1. 必须生成SVG代码
;; 2. 根据内容主题选择合适的背景渐变色，和主题高度相关
;; 3. No other comments!!`,

    textlogic: `
;;; 文图图提示词：文本逻辑关系图
;;; 用途: 将{输入文字}转换为精准的单一逻辑关系SVG图

(defun 逻辑关系分析专家 ()
  "你是一位精通逻辑关系分析和可视化的专家"
  (熟知 . (递进关系 流程关系 循环关系 层次结构 对比关系 矩阵关系))
  (擅长 . (深度文本分析 概念抽象 逻辑推理 美观可视化设计))
  (方法 . (语义网络分析 结构化思维 创造性设计 多维度关系表达)))

(defun 生成逻辑关系图 (用户输入)
  "将输入文字转换为单一逻辑关系的SVG图"
  (let* ((分析结果 (深度分析文本关系 用户输入))
         (最佳关系类型 (智能选择最佳关系类型 分析结果))
         (抽象概念 (抽象并精简核心概念 (assoc 最佳关系类型 分析结果)))
         (可视化设计 (设计美观可视化方案 最佳关系类型 抽象概念))
         (svg图 (生成优化SVG图 最佳关系类型 可视化设计)))
    (输出SVG图 svg图)))

(defun 深度分析文本关系 (文本)
  "使用语义网络分析文本中的逻辑关系"
  (setq 关系类型 '(递进 流程 循环 层次结构 对比 矩阵))
  (mapcar #'(lambda (类型) (cons 类型 (深度识别关系 文本 类型))) 关系类型))

(defun 智能选择最佳关系类型 (分析结果)
  "根据深度分析结果智能选择最适合的关系类型"
  (car (sort 分析结果 #'> :key #'(lambda (x) (+ (cdr x) (关系复杂度权重 (car x)))))))

(defun 抽象并精简核心概念 (分析结果)
  "对分析结果进行抽象和精简，提取核心概念"
  (list (智能概括要点 (cdr 分析结果))
        (提取关键概念 (cdr 分析结果))))

(defun 设计美观可视化方案 (关系类型 抽象概念)
  "为选定的关系类型设计美观且富有表现力的可视化方案"
  (list (优化布局设计 关系类型 (first 抽象概念))
        (设计美观样式 关系类型 (second 抽象概念))))

(defun 生成优化SVG图 (关系类型 可视化设计)
  "生成经过优化的选定关系类型的SVG图"
  (case 关系类型
    (递进 (生成美观递进SVG (first 可视化设计) (second 可视化设计)))
    (流程 (生成美观流程SVG (first 可视化设计) (second 可视化设计)))
    (循环 (生成美观循环SVG (first 可视化设计) (second 可视化设计)))
    (层次结构 (生成美观层次结构SVG (first 可视化设计) (second 可视化设计)))
    (对比 (生成美观对比SVG (first 可视化设计) (second 可视化设计)))
    (矩阵 (生成美观矩阵SVG (first 可视化设计) (second 可视化设计)))))

(defun svg-template (&rest 内容)
  "优化的SVG模板，支持更多自定义选项"
  (svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600"
    (defs
      (marker id="arrowhead" markerWidth="10" markerHeight="7"
              refX="0" refY="3.5" orient="auto"
        (polygon points="0 0, 10 3.5, 0 7" fill="#808080"))),
    @内容))

(defun 智能绘制连接线 (x1 y1 x2 y2 &optional 曲线程度)
  "智能绘制灰色虚线箭头，避免穿过色块"
  (let ((dx (- x2 x1))
        (dy (- y2 y1))
        (mid-x (/ (+ x1 x2) 2))
        (mid-y (/ (+ y1 y2) 2)))
    (if 曲线程度
        (path d ,(format "M%d,%d Q%d,%d %d,%d"
                        x1 y1
                        (+ mid-x (* dx 曲线程度))
                        (+ mid-y (* dy 曲线程度))
                        x2 y2)
              stroke="#808080" stroke-width="2" stroke-dasharray="5,5"
              fill="none" marker-end="url(#arrowhead)")
        '(path d ,(format "M%d,%d L%d,%d" x1 y1 x2 y2)
               stroke="#808080" stroke-width="2" stroke-dasharray="5,5"
               marker-end="url(#arrowhead)"))))

(defun start ()
  "启动时运行"
  (let (system-role 逻辑关系分析专家)
    (print "请输入一段文字，我将为您生成最适合且美观的逻辑关系SVG图")
    (print "示例：输入描述某个概念或现象的文字，将生成递进、流程、循环、层次结构、对比或矩阵中最合适的关系图")))

;;; 运行规则
;; 1. 运行上面的函数规则，必须输出svg代码
;; 2. 先调用主函数 (生成逻辑关系图 用户输入)
;; 3. 严格按照智能选择的关系类型的SVG生成函数进行图形呈现

;;; 注意事项
;; - 确保生成的关系图能精准表达相应的逻辑关系
;; - 使用和谐的颜色方案、优雅的形状和合理的布局来表现关系类型
;; - 保持整体设计的一致性、美观性和专业性
;; - 确保文字的可读性和清晰度，适当使用字体大小和粗细变化
;; - 使用灰色虚线箭头智能表示关系的方向和连接，避免箭头穿过色块
;; - 在色块附近合理安排细分内容，保持整洁而不省略关键细节
;; - 画布采用600*800，整体布局要有适当的留白和呼吸感，合理安排元素位置
;; - 对于复杂的概念，通过分层或分组来简化表达，突出核心逻辑
;; - 根据内容复杂度，动态调整字体大小和元素大小，确保整体平衡
;; - 适当使用渐变、阴影等效果增强视觉吸引力，但不要过度使用影响清晰度
;; - 为不同类型的关系图设计独特的视觉风格，增强识别度
;; - No other comments`,
  };

  const { promptType } = await chrome.storage.sync.get("promptType");
  console.log("Selected prompt type:", promptType); // 添加调试日志

  // 如果是内置提示词
  if (PROMPTS[promptType]) {
    console.log("Using built-in prompt:", PROMPTS[promptType]); // 添加调试日志
    return PROMPTS[promptType];
  }

  // 如果是自定义提示词
  const result = await chrome.storage.sync.get(["customPrompts"]);
  const customPrompts = result.customPrompts || [];
  console.log("Custom prompts:", customPrompts); // 添加调试日志

  // 根据选择的类型返回对应的提示词
  switch (promptType) {
    case "xiaohongshu":
      return "请为以下内容生成一个吸引眼球的小红书风格封面图。要求：1. 使用简洁有力的主标题 2. 添加合适的emoji装饰 3. 使用渐变背景 4. 突出核心卖点";
    case "wordcloud":
      return "请为以下内容生成一个词云风格的封面图。要求：1. 提取关键词 2. 使用不同大小和颜色展示词语重要性 3. 合理布局，确保可读性";
    case "textlogic":
      return "请为以下内容生成一个逻辑关系图。要求：1. 清晰展示概念之间的关系 2. 使用箭头或线条连接相关概念 3. 使用合适的布局确保整体美观";
    default:
      return "请为以下内容生成一个封面图。要求：1. 主题突出 2. 布局合理 3. 视觉美观";
  }
}

// 处理来自popup或content script的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "generateCover") {
    generateCover(request.text, request.systemPrompt);
  }
});

// 生成封面的主要函数
async function generateCover(text, customPrompt) {
  try {
    console.log("customPrompt = ", customPrompt);
    const settings = await chrome.storage.sync.get(["apiKey"]);
    if (!settings.apiKey) {
      throw new Error("请先在设置中配置API密钥");
    }

    // 通知开始生成
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { action: "startGeneration" });
    });

    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${settings.apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content:
              customPrompt || "请为以下文章生成一个吸引人的封面图片描述。",
          },
          { role: "user", content: text },
        ],
        temperature: 0.7,
        max_tokens: 2000,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error("API请求失败");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let accumulatedResponse = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split("\n");

      for (const line of lines) {
        if (line.trim() === "") continue;
        if (line.trim() === "data: [DONE]") continue;

        try {
          const cleanedLine = line.replace(/^data: /, "");
          const parsed = JSON.parse(cleanedLine);

          if (parsed.choices[0].delta.content) {
            accumulatedResponse += parsed.choices[0].delta.content;

            // 发送增量更新
            chrome.tabs.query(
              { active: true, currentWindow: true },
              function (tabs) {
                if (tabs[0]) {
                  chrome.tabs.sendMessage(tabs[0].id, {
                    action: "appendContent",
                    content: parsed.choices[0].delta.content,
                  });
                }
              }
            );
          }
        } catch (e) {
          console.error("Error parsing line:", e);
        }
      }
    }

    // 发送完成消息
    chrome.runtime.sendMessage({
      action: "coverGenerated",
      result: accumulatedResponse,
    });
  } catch (error) {
    console.error("Error:", error);
    chrome.runtime.sendMessage({
      action: "error",
      message: error.message,
    });
  }
}
