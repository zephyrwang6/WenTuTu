let resultDiv = null;
let svgPreviewDiv = null;
let fullContent = '';
let lastSvgContent = null;
let lastConversationId = null;

// 直接注入CSS确保样式生效
function injectCustomStyles() {
  const style = document.createElement('style');
  style.setAttribute('data-wen-tu-tu-styles', 'true');
  style.textContent = `
    .svg-preview {
      position: fixed;
      bottom: 240px;
      right: 20px;
      background: #ffffff;
      padding: 15px;
      border-radius: 12px;
      width: 400px;
      max-height: 70vh;
      z-index: 10001;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
      display: flex;
      flex-direction: column;
    }
    
    /* HTML预览特定样式 */
    .svg-preview.html-preview {
      width: 480px;
      max-width: 80vw;
      padding: 0;
      overflow: hidden;
    }
    
    .svg-preview.html-preview .header {
      padding: 10px 15px;
      background: #f5f5f5;
      border-top-left-radius: 12px;
      border-top-right-radius: 12px;
      border-bottom: 1px solid #e5e5e5;
    }

    .svg-preview .header {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      margin-bottom: 10px;
    }
    
    .svg-preview.html-preview .header {
      margin-bottom: 0;
    }

    .svg-preview .header .actions {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .svg-preview .svg-container {
      overflow: auto;
      max-height: calc(70vh - 60px);
      padding: 5px;
    }
    
    .svg-preview .svg-container.html-container {
      width: 100%;
      padding: 0;
      border-bottom-left-radius: 12px;
      border-bottom-right-radius: 12px;
      overflow: hidden;
    }

    .svg-preview .svg-container::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }

    .svg-preview .svg-container::-webkit-scrollbar-track {
      background: #f5f5f5;
      border-radius: 4px;
    }

    .svg-preview .svg-container::-webkit-scrollbar-thumb {
      background: #ddd;
      border-radius: 4px;
    }

    .svg-preview .svg-container::-webkit-scrollbar-thumb:hover {
      background: #ccc;
    }

    .svg-preview .svg-container svg {
      display: block;
      margin: 0 auto;
    }
    
    .svg-preview .svg-container iframe {
      width: 100%;
      min-height: 300px;
      border: none;
      display: block;
    }
    
    /* 纯文本按钮样式 */
    .ai-cover-result .actions button {
      background: none;
      border: none;
      padding: 6px 8px;
      font-size: 14px;
      cursor: pointer;
      color: #4CAF50;  /* 绿色文字 */
      transition: all 0.2s ease;
      font-weight: 500;
    }
    
    .ai-cover-result .actions button:hover {
      text-decoration: underline;
    }
    
    .ai-cover-result .actions .continue-btn,
    .ai-cover-result .actions .preview-btn,
    .ai-cover-result .actions .copy-btn,
    .ai-cover-result .actions .close-btn {
      color: #4CAF50;  /* 绿色文字 */
    }
    
    .svg-preview .actions button {
      background: none;
      border: none;
      padding: 6px 8px;
      font-size: 14px;
      cursor: pointer;
      color: #4CAF50;  /* 绿色文字 */
      transition: all 0.2s ease;
      font-weight: 500;
    }
    
    .svg-preview .actions button:hover {
      text-decoration: underline;
    }
  `;
  document.head.appendChild(style);
}

// 监听样式更新事件
window.addEventListener('wen-tu-tu-refresh-styles', () => {
  // 移除旧样式并重新注入
  const oldStyles = document.querySelectorAll('style[data-wen-tu-tu-styles]');
  oldStyles.forEach(style => style.remove());
  
  // 重新注入样式
  injectCustomStyles();
  
  // 如果当前有SVG预览窗口，则重新创建
  if (svgPreviewDiv && lastSvgContent) {
    const tempContent = lastSvgContent;
    svgPreviewDiv.remove();
    svgPreviewDiv = null;
    setTimeout(() => {
      showSvgPreview(tempContent);
    }, 50);
  }
});

// 初始化时注入样式
injectCustomStyles();

function downloadSVG(svgElement, filename) {
  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(svgElement);
  const blob = new Blob([svgString], {type: 'image/svg+xml'});
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || 'cover.svg';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function scrollToBottom(element) {
  element.scrollTop = element.scrollHeight;
}

// 提取完整的SVG或HTML内容，支持多次对话拼接
function extractCompleteCode(content) {
  // 检查是否是HTML内容
  const isHtml = content.includes('<!DOCTYPE html>') || 
                (content.includes('<html') && content.includes('</html>')) ||
                (content.match(/<body[^>]*>[\s\S]*?<\/body>/i) !== null);

  // 首先检查是否包含markdown代码块
  const svgMarkdownRegex = /```svg\s*([\s\S]*?)\s*```/i;
  const svgMarkdownMatch = content.match(svgMarkdownRegex);
  
  const htmlMarkdownRegex = /```html\s*([\s\S]*?)\s*```/i;
  const htmlMarkdownMatch = content.match(htmlMarkdownRegex);
  
  if (htmlMarkdownMatch && htmlMarkdownMatch[1]) {
    console.log('从Markdown代码块中提取HTML');
    return { content: htmlMarkdownMatch[1].trim(), type: 'html' };
  }
  
  if (svgMarkdownMatch && svgMarkdownMatch[1]) {
    console.log('从Markdown代码块中提取SVG');
    return { content: svgMarkdownMatch[1].trim(), type: 'svg' };
  }
  
  // 检查是否是HTML文档
  if (isHtml) {
    console.log('检测到HTML内容');
    return { content, type: 'html' };
  }
  
  // 检查内容是否包含SVG
  const contentLines = content.split('\n');
  let svgStartIndex = -1;
  let svgEndIndex = -1;
  
  // 找到SVG开始和结束的行
  for (let i = 0; i < contentLines.length; i++) {
    if (contentLines[i].includes('<svg') && svgStartIndex === -1) {
      svgStartIndex = i;
    }
    if (contentLines[i].includes('</svg>') && svgStartIndex !== -1) {
      svgEndIndex = i;
      break;
    }
  }
  
  // 如果找到完整的SVG标签范围，提取这部分内容
  if (svgStartIndex !== -1 && svgEndIndex !== -1) {
    console.log('从文本中提取完整SVG，行范围:', svgStartIndex, '至', svgEndIndex);
    const svgLines = contentLines.slice(svgStartIndex, svgEndIndex + 1);
    return { content: svgLines.join('\n'), type: 'svg' };
  }
  
  // 尝试提取完整的SVG标签
  const svgRegex = /<svg[\s\S]*?<\/svg>/gi;
  let svgMatches = content.match(svgRegex);
  
  if (svgMatches && svgMatches.length > 0) {
    console.log('通过正则提取完整SVG标签');
    return { content: svgMatches[0], type: 'svg' };
  }
  
  // 如果没有找到完整SVG标签，尝试提取不完整的内容
  const svgOpenTag = content.match(/<svg[^>]*>/i);
  if (svgOpenTag) {
    console.log('只找到SVG开始标签，尝试提取可能不完整的SVG');
    // 从SVG开始标签开始，提取后续所有内容
    const svgContent = content.substring(content.indexOf(svgOpenTag[0]));
    return { content: svgContent, type: 'svg' };
  }
  
  return { content: '', type: 'unknown' };
}

// 查找未闭合的XML/HTML标签
function findUnbalancedTags(content) {
  const tagRegex = /<\/?([a-z][a-z0-9]*)[^>]*>/gi;
  const selfClosingRegex = /<([a-z][a-z0-9]*)[^>]*\/>/gi;
  
  // 找出所有自闭合标签
  const selfClosingTags = [];
  let selfClosingMatch;
  while ((selfClosingMatch = selfClosingRegex.exec(content)) !== null) {
    selfClosingTags.push({
      tagName: selfClosingMatch[1].toLowerCase(),
      position: selfClosingMatch.index,
      isSelfClosing: true
    });
  }
  
  // 跟踪所有标签
  const tagStack = [];
  const unbalancedTags = [];
  let match;
  
  // 重置正则表达式
  tagRegex.lastIndex = 0;
  
  while ((match = tagRegex.exec(content)) !== null) {
    const isClosing = match[0].indexOf('</') === 0;
    const tagName = match[1].toLowerCase();
    
    // 检查是否是自闭合标签
    let isSelfClosing = false;
    for (const selfTag of selfClosingTags) {
      if (selfTag.position === match.index) {
        isSelfClosing = true;
        break;
      }
    }
    
    if (isSelfClosing) {
      // 忽略自闭合标签
      continue;
    }
    
    if (!isClosing) {
      // 开始标签
      tagStack.push({
        tagName,
        position: match.index,
        hasClosing: false,
        isSelfClosing: false
      });
    } else {
      // 闭合标签
      let foundMatchingTag = false;
      
      // 查找匹配的开始标签
      for (let i = tagStack.length - 1; i >= 0; i--) {
        if (tagStack[i].tagName === tagName && !tagStack[i].hasClosing) {
          tagStack[i].hasClosing = true;
          foundMatchingTag = true;
          break;
        }
      }
      
      if (!foundMatchingTag) {
        // 没有找到匹配的开始标签，这是一个未平衡的闭合标签
        unbalancedTags.push({
          tagName,
          position: match.index,
          isClosing: true,
          hasOpening: false,
          isSelfClosing: false
        });
      }
    }
  }
  
  // 将所有未闭合的开始标签添加到结果中
  for (const tag of tagStack) {
    if (!tag.hasClosing) {
      unbalancedTags.push(tag);
    }
  }
  
  return unbalancedTags;
}

function showSvgPreview(svgContent) {
  try {
    // 保存SVG内容用于刷新
    lastSvgContent = svgContent;
    console.log('显示SVG预览，内容长度:', svgContent.length);
    console.log('SVG内容预览:', svgContent.substring(0, 100) + '...');
  
    if (svgPreviewDiv) {
      svgPreviewDiv.remove();
    }
  
    svgPreviewDiv = document.createElement('div');
    svgPreviewDiv.className = 'svg-preview';
    svgPreviewDiv.innerHTML = `
      <div class="header">
        <div class="actions">
          <button class="fullscreen-btn" title="全屏查看">全屏</button>
          <button class="download-btn" title="下载SVG文件">下载</button>
          <button class="close-btn" title="关闭预览">关闭</button>
        </div>
      </div>
      <div class="svg-container"></div>
    `;
  
    // 添加下载按钮事件
    const downloadBtn = svgPreviewDiv.querySelector('.download-btn');
    downloadBtn.onclick = () => {
      // 创建一个Blob对象并下载SVG内容
      const blob = new Blob([svgContent], {type: 'image/svg+xml'});
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = 'cover.svg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    };
  
    // 添加全屏按钮事件
    const fullscreenBtn = svgPreviewDiv.querySelector('.fullscreen-btn');
    fullscreenBtn.onclick = () => {
      // 创建新的窗口
      const newWindow = window.open('', '_blank');
      
      // 直接写入原始SVG内容，不添加额外HTML/CSS
      newWindow.document.open();
      newWindow.document.write(svgContent);
      newWindow.document.close();
    };
  
    // 添加关闭按钮事件
    svgPreviewDiv.querySelector('.close-btn').onclick = () => {
      svgPreviewDiv.remove();
      svgPreviewDiv = null;
      // 显示预览按钮
      const previewBtn = document.querySelector('.ai-cover-result .preview-btn');
      if (previewBtn) {
        previewBtn.style.display = 'inline-block';
      }
    };
  
    // 添加拖动功能
    makeDraggable(svgPreviewDiv);
  
    // 添加到DOM树
    document.body.appendChild(svgPreviewDiv);
  
    // 直接显示原始SVG内容，不尝试修复
    const svgContainer = svgPreviewDiv.querySelector('.svg-container');
    svgContainer.innerHTML = svgContent;
  
  } catch (error) {
    console.error('Error in showSvgPreview:', error);
    
    if (svgPreviewDiv) {
      const svgContainer = svgPreviewDiv.querySelector('.svg-container');
      svgContainer.innerHTML = '<div style="color: red;">显示SVG时发生错误。</div>';
    }
  }
}

// 更新SVG视口以适应容器
function updateSvgViewport(svgElement, container) {
  // 获取原始viewBox
  let viewBox = svgElement.getAttribute('viewBox');
  if (!viewBox) {
    // 如果没有viewBox，设置一个默认值
    const width = parseInt(svgElement.getAttribute('width')) || 600;
    const height = parseInt(svgElement.getAttribute('height')) || 800;
    viewBox = `0 0 ${width} ${height}`;
    svgElement.setAttribute('viewBox', viewBox);
  }
  
  // 确保SVG正确填充容器，同时保持宽高比
  const containerWidth = container.clientWidth;
  const containerHeight = container.clientHeight;
  
  if (containerWidth > 0 && containerHeight > 0) {
    // 计算最佳尺寸，同时保持原始宽高比
    const [, , vbWidth, vbHeight] = viewBox.split(' ').map(Number);
    const aspectRatio = vbWidth / vbHeight;
    
    // 根据容器宽高比调整SVG显示
    if (containerWidth / containerHeight > aspectRatio) {
      // 容器更宽，应以高度为基准
      svgElement.style.height = '100%';
      svgElement.style.width = 'auto';
    } else {
      // 容器更高，应以宽度为基准
      svgElement.style.width = '100%';
      svgElement.style.height = 'auto';
    }
  }
}

// 显示HTML预览
function showHtmlPreview(htmlContent) {
  try {
    // 保存内容用于刷新
    lastSvgContent = htmlContent; // 重用SVG的变量存储HTML内容
    console.log('显示HTML预览，内容长度:', htmlContent.length);
    console.log('HTML内容预览:', htmlContent.substring(0, 100) + '...');
  
    if (svgPreviewDiv) {
      svgPreviewDiv.remove();
    }
  
    svgPreviewDiv = document.createElement('div');
    svgPreviewDiv.className = 'svg-preview html-preview';
    svgPreviewDiv.innerHTML = `
      <div class="header">
        <div class="actions">
          <button class="fullscreen-btn" title="全屏查看">全屏</button>
          <button class="download-btn" title="下载HTML文件">下载</button>
          <button class="close-btn" title="关闭预览">关闭</button>
        </div>
      </div>
      <div class="svg-container html-container"></div>
    `;
  
    // 添加下载按钮事件
    const downloadBtn = svgPreviewDiv.querySelector('.download-btn');
    downloadBtn.onclick = () => {
      // 创建一个Blob对象并下载HTML内容
      const blob = new Blob([htmlContent], {type: 'text/html'});
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = 'preview.html';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    };
  
    // 添加全屏按钮事件
    const fullscreenBtn = svgPreviewDiv.querySelector('.fullscreen-btn');
    fullscreenBtn.onclick = () => {
      // 创建新的窗口
      const newWindow = window.open('', '_blank');
      
      // 直接写入原始HTML内容，不添加任何额外包装
      newWindow.document.open();
      newWindow.document.write(htmlContent);
      newWindow.document.close();
    };
  
    // 添加关闭按钮事件
    svgPreviewDiv.querySelector('.close-btn').onclick = () => {
      svgPreviewDiv.remove();
      svgPreviewDiv = null;
      // 显示预览按钮
      const previewBtn = document.querySelector('.ai-cover-result .preview-btn');
      if (previewBtn) {
        previewBtn.style.display = 'inline-block';
      }
    };
  
    // 添加拖动功能
    makeDraggable(svgPreviewDiv);
  
    // 添加到DOM树
    document.body.appendChild(svgPreviewDiv);
  
    // 获取预览容器并添加HTML内容
    const htmlContainer = svgPreviewDiv.querySelector('.html-container');
    
    // 创建iframe以安全地呈现HTML
    const iframe = document.createElement('iframe');
    iframe.setAttribute('sandbox', 'allow-same-origin allow-scripts allow-popups allow-forms allow-modals allow-presentation');
    iframe.style.width = '100%';
    iframe.style.height = '500px'; // 初始高度，后续会自动调整
    iframe.style.border = 'none';
    iframe.style.overflow = 'auto';
    htmlContainer.appendChild(iframe);
    
    // 强制添加HTML头部元素以确保正确渲染
    const enhancedHtmlContent = ensureHtmlStructure(htmlContent);
    
    // 向iframe写入HTML内容
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    iframeDoc.open();
    iframeDoc.write(enhancedHtmlContent);
    iframeDoc.close();
    
    // 设置iframe的resize observer，动态调整高度
    if (window.ResizeObserver) {
      const resizeObserver = new ResizeObserver(() => {
        adjustIframeHeight(iframe);
      });
      
      // 观察iframe的内容变化
      try {
        resizeObserver.observe(iframeDoc.body);
      } catch (e) {
        console.log('无法直接观察iframe body，使用定时器调整高度');
        // 如果无法直接观察，使用定时器定期检查高度
        const heightCheckInterval = setInterval(() => {
          if (svgPreviewDiv) {
            adjustIframeHeight(iframe);
          } else {
            clearInterval(heightCheckInterval);
          }
        }, 500);
      }
      
      // 当预览窗口关闭时，取消观察
      svgPreviewDiv.addEventListener('remove', () => {
        resizeObserver.disconnect();
      }, { once: true });
    }
    
    // 调整iframe高度以适应内容
    iframe.onload = () => {
      adjustIframeHeight(iframe);
      
      // 处理iframe内部链接点击，防止导航离开iframe
      try {
        const iframeLinks = iframe.contentDocument.querySelectorAll('a');
        iframeLinks.forEach(link => {
          link.addEventListener('click', (e) => {
            // 如果是外部链接，在新窗口打开
            if (link.getAttribute('href') && link.getAttribute('href').startsWith('http')) {
              e.preventDefault();
              window.open(link.href, '_blank');
            }
          });
        });
      } catch (e) {
        console.log('无法处理iframe内部链接', e);
      }
    };
  
  } catch (error) {
    console.error('Error in showHtmlPreview:', error);
    
    if (svgPreviewDiv) {
      const svgContainer = svgPreviewDiv.querySelector('.svg-container');
      svgContainer.innerHTML = '<div style="color: red;">显示HTML时发生错误。</div>';
    }
  }
}

// 调整iframe高度以适应内容
function adjustIframeHeight(iframe) {
  try {
    // 获取iframe文档的实际高度
    const doc = iframe.contentDocument || iframe.contentWindow.document;
    const html = doc.documentElement;
    const body = doc.body;
    
    const height = Math.max(
      body.scrollHeight,
      body.offsetHeight,
      html.clientHeight,
      html.scrollHeight,
      html.offsetHeight
    );
    
    // 设置iframe的高度，确保能显示所有内容
    if (height > 0) {
      iframe.style.height = `${height}px`;
      
      // 如果内容较多，限制最大高度并添加滚动
      const maxHeight = Math.min(700, window.innerHeight * 0.7);
      if (height > maxHeight) {
        iframe.style.height = `${maxHeight}px`;
        iframe.style.overflowY = 'auto';
      }
    }
  } catch (e) {
    console.error('调整iframe高度失败', e);
  }
}

// 确保HTML具有正确的结构
function ensureHtmlStructure(html) {
  // 检查是否有doctype和html标签
  const hasDoctype = html.includes('<!DOCTYPE') || html.includes('<!doctype');
  const hasHtmlTag = html.includes('<html') && html.includes('</html>');
  const hasHead = html.includes('<head') && html.includes('</head>');
  const hasBody = html.includes('<body') && html.includes('</body>');
  
  // 检查是否包含Tailwind CSS的引用
  const hasTailwind = html.includes('tailwindcss') || html.includes('tailwind.css') || html.includes('tailwind.min.css');
  
  if (hasDoctype && hasHtmlTag && hasHead && hasBody) {
    // HTML结构完整，检查是否需要添加Tailwind
    if (!hasTailwind && html.includes('class=') && containsTailwindClasses(html)) {
      // 在头部添加Tailwind CSS
      return html.replace('</head>', 
        '  <script src="https://cdn.tailwindcss.com"></script>\n</head>');
    }
    // 完整结构且不需要添加Tailwind，直接返回
    return html;
  }
  
  // 如果HTML不完整，需要构建完整结构
  if (!hasHtmlTag) {
    // 提取可能的内容部分
    let content = html;
    
    // 检查是否需要添加Tailwind
    const needsTailwind = !hasTailwind && (content.includes('class=') && containsTailwindClasses(content));
    
    // 构建完整的HTML
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>HTML预览</title>
  ${needsTailwind ? '<script src="https://cdn.tailwindcss.com"></script>' : ''}
  <style>
    body {
      margin: 8px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      font-size: 16px;
      line-height: 1.5;
      color: #333;
    }
    img { max-width: 100%; height: auto; }
    pre { overflow: auto; background: #f5f5f5; padding: 8px; border-radius: 4px; }
    code { font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace; }
    table { border-collapse: collapse; width: 100%; }
    table, th, td { border: 1px solid #ddd; }
    th, td { padding: 8px; text-align: left; }
  </style>
</head>
<body>
  ${content}
</body>
</html>`;
  } else if (!hasDoctype) {
    // 添加DOCTYPE
    return `<!DOCTYPE html>\n${html}`;
  }
  
  // 部分结构缺失时尝试修复
  return html;
}

// 检查HTML内容是否包含Tailwind CSS类
function containsTailwindClasses(html) {
  // Tailwind常用类名的特征
  const tailwindPatterns = [
    /\btext-\w+\b/, // text-sm, text-lg, text-blue-500等
    /\bbg-\w+\b/, // bg-white, bg-blue-500等
    /\bp-\d+\b/, // p-4, p-8等
    /\bm-\d+\b/, // m-2, m-8等
    /\bflex\b/, // flex
    /\bgrid\b/, // grid
    /\bhidden\b/, // hidden
    /\brounded-\w+\b/, // rounded-md, rounded-full等
    /\bshadow-\w+\b/ // shadow-sm, shadow-xl等
  ];
  
  // 如果至少匹配两个Tailwind模式，认为是使用了Tailwind
  let matchCount = 0;
  for (const pattern of tailwindPatterns) {
    if (pattern.test(html)) {
      matchCount++;
      if (matchCount >= 2) {
        return true;
      }
    }
  }
  
  return false;
}

// 显示预览，自动检测内容类型
function showPreview(code) {
  if (typeof code === 'object') {
    // 新版格式，包含类型信息
    if (code.type === 'html') {
      showHtmlPreview(code.content);
    } else if (code.type === 'svg') {
      showSvgPreview(code.content);
    } else {
      console.log('未知内容类型:', code.type);
    }
  } else if (typeof code === 'string') {
    // 兼容旧版调用，默认为SVG
    showSvgPreview(code);
  } else {
    console.log('无法预览，无效内容');
  }
}

// 实现窗口拖动功能
function makeDraggable(element) {
  let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  
  // 获取拖动触发区域（整个窗口的header部分）
  const header = element.querySelector('.header');
  
  if (header) {
    // 如果存在header，则使用header作为拖动触发区域
    header.onmousedown = dragMouseDown;
  } else {
    // 否则直接使用整个元素
    element.onmousedown = dragMouseDown;
  }

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    
    // 记录鼠标位置
    pos3 = e.clientX;
    pos4 = e.clientY;
    
    // 添加鼠标移动和松开事件监听
    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    
    // 计算新位置
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    
    // 设置元素的新位置
    const newTop = (element.offsetTop - pos2);
    const newLeft = (element.offsetLeft - pos1);
    
    // 确保窗口不会被拖出可视区域
    const maxTop = window.innerHeight - element.offsetHeight;
    const maxLeft = window.innerWidth - element.offsetWidth;
    
    element.style.top = Math.min(Math.max(0, newTop), maxTop) + "px";
    element.style.left = Math.min(Math.max(0, newLeft), maxLeft) + "px";
    
    // 拖动时移除bottom和right定位，改为使用top和left
    element.style.bottom = "auto";
    element.style.right = "auto";
  }

  function closeDragElement() {
    // 停止移动时移除事件监听
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

// 查找未闭合的XML/HTML标签
function findUnbalancedTags(content) {
  const tagRegex = /<\/?([a-z][a-z0-9]*)[^>]*>/gi;
  const selfClosingRegex = /<([a-z][a-z0-9]*)[^>]*\/>/gi;
  
  // 找出所有自闭合标签
  const selfClosingTags = [];
  let selfClosingMatch;
  while ((selfClosingMatch = selfClosingRegex.exec(content)) !== null) {
    selfClosingTags.push({
      tagName: selfClosingMatch[1].toLowerCase(),
      position: selfClosingMatch.index,
      isSelfClosing: true
    });
  }
  
  // 跟踪所有标签
  const tagStack = [];
  const unbalancedTags = [];
  let match;
  
  // 重置正则表达式
  tagRegex.lastIndex = 0;
  
  while ((match = tagRegex.exec(content)) !== null) {
    const isClosing = match[0].indexOf('</') === 0;
    const tagName = match[1].toLowerCase();
    
    // 检查是否是自闭合标签
    let isSelfClosing = false;
    for (const selfTag of selfClosingTags) {
      if (selfTag.position === match.index) {
        isSelfClosing = true;
        break;
      }
    }
    
    if (isSelfClosing) {
      // 忽略自闭合标签
      continue;
    }
    
    if (!isClosing) {
      // 开始标签
      tagStack.push({
        tagName,
        position: match.index,
        hasClosing: false,
        isSelfClosing: false
      });
    } else {
      // 闭合标签
      let foundMatchingTag = false;
      
      // 查找匹配的开始标签
      for (let i = tagStack.length - 1; i >= 0; i--) {
        if (tagStack[i].tagName === tagName && !tagStack[i].hasClosing) {
          tagStack[i].hasClosing = true;
          foundMatchingTag = true;
          break;
        }
      }
      
      if (!foundMatchingTag) {
        // 没有找到匹配的开始标签，这是一个未平衡的闭合标签
        unbalancedTags.push({
          tagName,
          position: match.index,
          isClosing: true,
          hasOpening: false,
          isSelfClosing: false
        });
      }
    }
  }
  
  // 将所有未闭合的开始标签添加到结果中
  for (const tag of tagStack) {
    if (!tag.hasClosing) {
      unbalancedTags.push(tag);
    }
  }
  
  return unbalancedTags;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getPageContent") {
    sendResponse({ content: document.body.innerText });
    return true;
  }

  if (request.action === "startGeneration") {
    if (resultDiv) resultDiv.remove();
    if (svgPreviewDiv) svgPreviewDiv.remove();
    fullContent = '';
    
    resultDiv = document.createElement('div');
    resultDiv.className = 'ai-cover-result';
    resultDiv.innerHTML = `
      <div class="header">
        <h3>SVG生成</h3>
        <div class="actions">
          <button class="preview-btn" style="display: none;">预览</button>
          <button class="continue-btn" style="display: none;">继续</button>
          <button class="copy-btn">复制</button>
          <button class="close-btn">关闭</button>
        </div>
      </div>
      <div class="content-wrapper">
        <div class="content"></div>
      </div>
      <div class="typing-indicator">
        <span></span><span></span><span></span>
      </div>
    `;

    resultDiv.querySelector('.close-btn').onclick = () => resultDiv.remove();
    resultDiv.querySelector('.copy-btn').onclick = () => {
      navigator.clipboard.writeText(fullContent).then(() => {
        alert('已复制到剪贴板');
      }).catch(err => {
        console.error('复制失败:', err);
      });
    };

    // 添加预览按钮点击事件
    const previewBtn = resultDiv.querySelector('.preview-btn');
    previewBtn.onclick = () => {
      const completeCode = extractCompleteCode(fullContent);
      if (completeCode.content) {
        showPreview(completeCode);
      }
    };
    
    // 添加继续按钮点击事件
    const continueBtn = resultDiv.querySelector('.continue-btn');
    continueBtn.onclick = () => {
      // 显示加载指示器
      if (!resultDiv.querySelector('.typing-indicator')) {
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'typing-indicator';
        typingIndicator.innerHTML = '<span></span><span></span><span></span>';
        resultDiv.appendChild(typingIndicator);
      } else {
        resultDiv.querySelector('.typing-indicator').style.display = 'block';
      }
      
      // 发送继续生成请求
      chrome.runtime.sendMessage({
        action: "continueCoverGeneration",
        conversationId: lastConversationId
      });
      
      // 隐藏继续按钮和预览按钮
      continueBtn.style.display = 'none';
      previewBtn.style.display = 'none';
    };

    document.body.appendChild(resultDiv);
  }

  else if (request.action === "appendContent" && resultDiv) {
    const content = resultDiv.querySelector('.content');
    const contentWrapper = resultDiv.querySelector('.content-wrapper');
    fullContent += request.content;
    content.textContent = fullContent;
    
    requestAnimationFrame(() => {
      contentWrapper.scrollTop = contentWrapper.scrollHeight;
    });

    // 在生成过程中不显示预览按钮，只存储SVG内容
    const completeCode = extractCompleteCode(fullContent);
    if (completeCode.content) {
      lastSvgContent = completeCode.content;
      console.log(`找到完整代码 (${completeCode.type}):`, lastSvgContent.substring(0, 100)); // 添加类型信息
    }
    
    // 保存对话ID
    if (request.conversationId) {
      lastConversationId = request.conversationId;
      console.log('Saved conversation ID:', lastConversationId);
    }
  }

  else if (request.action === "completeGeneration" && resultDiv) {
    // 隐藏加载指示器
    const typingIndicator = resultDiv.querySelector('.typing-indicator');
    if (typingIndicator) {
      typingIndicator.style.display = 'none';
    }
    
    resultDiv.querySelector('h3').textContent = 'SVG生成';
    setTimeout(() => scrollToBottom(resultDiv), 100);
    
    // 检查是否应该显示继续按钮
    if (shouldShowContinueButton(fullContent) && lastConversationId) {
      const continueBtn = resultDiv.querySelector('.continue-btn');
      if (continueBtn) {
        continueBtn.style.display = 'inline-block';
      }
    }
    
    // 生成完成后显示预览按钮并自动显示预览
    const previewBtn = resultDiv.querySelector('.preview-btn');
    if (previewBtn) {
      previewBtn.style.display = 'inline-block';
    }
    
    const completeCode = extractCompleteCode(fullContent);
    if (completeCode.content) {
      lastSvgContent = completeCode.content;
      showPreview(completeCode);
    }
  }

  else if (request.action === "error" || request.action === "showError") {
    if (resultDiv) resultDiv.remove();
    if (svgPreviewDiv) svgPreviewDiv.remove();
    
    // 创建错误提示框
    const errorDiv = document.createElement('div');
    errorDiv.className = 'ai-cover-error';
    errorDiv.innerHTML = `
      <div class="error-content">
        <h3>错误提示</h3>
        <p>${request.message || '生成封面时出错'}</p>
        <button class="close-btn">关闭</button>
      </div>
    `;
    
    // 添加样式
    const style = document.createElement('style');
    style.textContent = `
      .ai-cover-error {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        max-width: 400px;
        width: 90%;
      }
      .ai-cover-error .error-content {
        padding: 20px;
      }
      .ai-cover-error h3 {
        margin-top: 0;
        color: #e74c3c;
      }
      .ai-cover-error p {
        margin: 10px 0 20px;
      }
      .ai-cover-error .close-btn {
        background-color: #e74c3c;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        float: right;
      }
      .ai-cover-error .close-btn:hover {
        background-color: #c0392b;
      }
    `;
    document.head.appendChild(style);
    
    // 添加关闭按钮事件
    errorDiv.querySelector('.close-btn').onclick = () => {
      errorDiv.remove();
    };
    
    document.body.appendChild(errorDiv);
    
    // 5秒后自动关闭
    setTimeout(() => {
      if (document.body.contains(errorDiv)) {
        errorDiv.remove();
      }
    }, 5000);
  }

  else if (request.action === "displaySVG") {
    // 显示SVG内容
    if (request.svg) {
      lastSvgContent = request.svg;
      
      // 如果没有结果div，创建一个
      if (!resultDiv) {
        resultDiv = document.createElement('div');
        resultDiv.className = 'ai-cover-result';
        resultDiv.innerHTML = `
          <div class="header">
            <h3>SVG生成</h3>
            <div class="actions">
              <button class="preview-btn">预览</button>
              <button class="continue-btn" style="display: none;">继续</button>
              <button class="copy-btn">复制</button>
              <button class="close-btn">关闭</button>
            </div>
          </div>
          <div class="content-wrapper">
            <div class="content"></div>
          </div>
        `;

        resultDiv.querySelector('.close-btn').onclick = () => resultDiv.remove();
        resultDiv.querySelector('.copy-btn').onclick = () => {
          navigator.clipboard.writeText(request.svg).then(() => {
            alert('已复制到剪贴板');
          }).catch(err => {
            console.error('复制失败:', err);
          });
        };

        // 添加预览按钮点击事件
        const previewBtn = resultDiv.querySelector('.preview-btn');
        previewBtn.onclick = () => {
          if (lastSvgContent) {
            showSvgPreview(lastSvgContent);
          }
        };
        
        // 添加继续按钮点击事件
        const continueBtn = resultDiv.querySelector('.continue-btn');
        continueBtn.onclick = () => {
          // 显示加载指示器
          const typingIndicator = document.createElement('div');
          typingIndicator.className = 'typing-indicator';
          typingIndicator.innerHTML = '<span></span><span></span><span></span>';
          resultDiv.appendChild(typingIndicator);
          
          // 发送继续生成请求
          chrome.runtime.sendMessage({
            action: "continueCoverGeneration",
            conversationId: lastConversationId
          });
          
          // 隐藏继续按钮
          continueBtn.style.display = 'none';
        };

        document.body.appendChild(resultDiv);
      }
      
      // 更新内容
      const content = resultDiv.querySelector('.content');
      content.textContent = request.svg;
      fullContent = request.svg;
      
      // 显示预览
      showSvgPreview(request.svg);
      
      // 检查是否应该显示继续按钮
      if (shouldShowContinueButton(fullContent) && lastConversationId) {
        const continueBtn = resultDiv.querySelector('.continue-btn');
        if (continueBtn) {
          continueBtn.style.display = 'inline-block';
        }
      }
    }
  }
});

// 检查响应是否需要显示继续按钮
function shouldShowContinueButton(content) {
  // 如果内容结尾不包含svg或html标签，则认为可能需要继续生成
  const endWithSvgOrHtml = /<\/(svg|html)>\s*$/i.test(content.trim());
  return !endWithSvgOrHtml;
}
