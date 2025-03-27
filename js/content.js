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

    .svg-preview .header {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      margin-bottom: 10px;
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
  // 首先检查是否包含markdown代码块
  const markdownRegex = /```svg\s*([\s\S]*?)\s*```/i;
  const markdownMatch = content.match(markdownRegex);
  
  if (markdownMatch && markdownMatch[1]) {
    console.log('从Markdown代码块中提取SVG');
    const svgCode = markdownMatch[1].trim();
    
    // 检查是否有被截断的标签
    const fixedSvgCode = fixBrokenTags(svgCode);
    return fixedSvgCode;
  }
  
  // 检查内容是否包含说明文本
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
    const svgCode = svgLines.join('\n');
    
    // 检查是否有被截断的标签
    const fixedSvgCode = fixBrokenTags(svgCode);
    return fixedSvgCode;
  }
  
  // 尝试提取完整的SVG标签
  const svgRegex = /<svg[\s\S]*?<\/svg>/gi;
  let svgMatches = content.match(svgRegex);
  
  if (svgMatches && svgMatches.length > 0) {
    console.log('通过正则提取完整SVG标签');
    // 如果有多个SVG标签，取最后一个，通常是最完整的
    const svgCode = svgMatches[svgMatches.length - 1];
    
    // 检查是否有被截断的标签
    const fixedSvgCode = fixBrokenTags(svgCode);
    return fixedSvgCode;
  }
  
  // 尝试提取并合并可能被分割的SVG代码
  if (content.includes('<svg') && content.includes('</svg>')) {
    console.log('尝试组合分段的SVG代码');
    const svgStartIndex = content.indexOf('<svg');
    const svgEndIndex = content.lastIndexOf('</svg>') + 6;
    
    // 提取SVG代码
    if (svgStartIndex !== -1 && svgEndIndex !== -1) {
      const svgCode = content.substring(svgStartIndex, svgEndIndex);
      
      // 修复可能的问题
      const fixedSvgCode = fixBrokenTags(svgCode);
      return fixedSvgCode;
    }
  }
  
  // 如果未能提取到完整SVG，尝试拼接不完整的SVG代码
  // 寻找SVG开始和结束标签
  const svgStartMatch = /<svg[^>]*>/i.exec(content);
  const svgEndMatch = /<\/svg>/i.exec(content);
  
  if (svgStartMatch && svgEndMatch) {
    console.log('从不完整内容中拼接SVG');
    // 找到完整的开始和结束标签，提取中间内容
    const startIndex = svgStartMatch.index;
    const endIndex = svgEndMatch.index + 6; // '</svg>'.length = 6
    const svgCode = content.substring(startIndex, endIndex);
    
    // 修复可能的问题
    const fixedSvgCode = fixBrokenTags(svgCode);
    return fixedSvgCode;
  } else if (svgStartMatch) {
    console.log('只找到SVG开始标签，添加结束标签');
    // 只有开始标签，尝试猜测SVG结构并闭合
    const svgContent = content.substring(svgStartMatch.index);
    // 添加结束标签
    const svgCode = svgContent + "</svg>";
    
    // 修复可能的问题
    const fixedSvgCode = fixBrokenTags(svgCode);
    return fixedSvgCode;
  }
  
  // 尝试修复和提取不完整的SVG/XML结构
  if (content.includes('<svg')) {
    console.log('尝试修复不完整的SVG结构');
    // 提取从<svg开始的所有内容
    const svgStartIndex = content.indexOf('<svg');
    let extractedContent = content.substring(svgStartIndex);
    
    // 如果没有结束标签，添加一个
    if (!extractedContent.includes('</svg>')) {
      extractedContent += '</svg>';
    }
    
    // 修复可能的问题
    const fixedSvgCode = fixBrokenTags(extractedContent);
    return fixedSvgCode;
  }
  
  // 最后的尝试：如果内容中包含SVG相关标签但格式不完整
  if (content.includes('<rect') || content.includes('<circle') || 
      content.includes('<path') || content.includes('<text')) {
    console.log('检测到SVG元素但没有完整标签，构建完整SVG');
    // 构建一个基本的SVG容器
    const svgCode = `<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">${content}</svg>`;
    
    // 修复可能的问题
    const fixedSvgCode = fixBrokenTags(svgCode);
    return fixedSvgCode;
  }
  
  // 找不到任何SVG相关内容，返回原内容
  console.log('无法提取SVG内容，返回原始内容');
  return content;
}

// 修复被截断的标签
function fixBrokenTags(svgCode) {
  console.log('检查并修复SVG标签问题...');
  
  // 修复截断的路径问题（像用户示例中的那种情况）
  let fixedCode = svgCode;
  
  // 修复被分成多行的 path 路径属性
  const pathRegex = /<path\s+d\s*=\s*"([^"]*?)"\s+stroke/g;
  let match;
  
  while ((match = pathRegex.exec(svgCode)) !== null) {
    const pathD = match[1];
    
    // 检查路径是否被截断
    if (!pathD.endsWith('Z') && !pathD.endsWith('z') && 
        !pathD.match(/[MLHVCSQTAZmlhvcsqtaz]\s*[-\d.,\s]+$/)) {
      console.log('检测到可能被截断的路径:', pathD);
      
      // 查找下一行是否包含路径的继续部分
      const nextLineRegex = new RegExp(`stroke\\s*=\\s*"([^"]*?)"`, 'g');
      const nextLineMatch = nextLineRegex.exec(svgCode.substring(match.index + match[0].length));
      
      if (nextLineMatch) {
        // 创建完整的路径属性
        const originalPath = `<path d="${pathD}" stroke`;
        const newPath = `<path d="${pathD}" stroke="${nextLineMatch[1]}"`;
        
        fixedCode = fixedCode.replace(originalPath, newPath);
        console.log('修复路径:', newPath);
      }
    }
  }
  
  // 处理特定的路径分割问题
  const brokenPathRegex = /<path d="([^"]*)"\s+(\w+)\s*(\r?\n)([^<>]*)"/g;
  fixedCode = fixedCode.replace(brokenPathRegex, (match, d, attr, newline, value) => {
    console.log(`修复分割的路径属性: ${attr}`);
    return `<path d="${d}" ${attr}="${value}"`;
  });
  
  // 专门处理用户示例中的特定问题模式
  const specificIssuePattern = /<path d="([^"]*)"\s+stroke\s*\r?\n([^<>"]*)"/g;
  fixedCode = fixedCode.replace(specificIssuePattern, (match, d, value) => {
    console.log('修复特定路径问题模式');
    return `<path d="${d}" stroke="${value}"`;
  });
  
  // 修复带属性但截断的标签
  const brokenAttrRegex = /<([a-z]+)[^>]+\n/g;
  fixedCode = fixedCode.replace(brokenAttrRegex, (match, tagName) => {
    console.log('修复带属性但截断的标签:', match);
    if (match.endsWith(' ')) {
      return match;
    }
    return match + ' ';
  });
  
  // 修复被截断的 stroke 属性
  if (fixedCode.includes('stroke') && !fixedCode.match(/stroke="[^"]*"/)) {
    const strokeLineRegex = /stroke\r?\n([^=]*?)"/g;
    fixedCode = fixedCode.replace(strokeLineRegex, (match, attr) => {
      console.log('修复被截断的stroke属性');
      return `stroke="${attr}"`;
    });
  }
  
  // 如果检测到用户示例中的特定模式
  if (fixedCode.includes('stroke\n') || fixedCode.includes('stroke\r\n')) {
    console.log('检测到换行后的stroke属性，尝试修复');
    fixedCode = fixedCode.replace(/stroke\r?\n/g, 'stroke="');
    // 尝试在这种情况下找到下一个引号位置
    const quotePos = fixedCode.indexOf('"', fixedCode.indexOf('stroke="') + 'stroke="'.length);
    if (quotePos !== -1) {
      fixedCode = fixedCode.substring(0, quotePos + 1) + 
                  fixedCode.substring(quotePos + 1).replace(/"\s+/, '" ');
    }
  }
  
  // 检查是否包含 "stroke" 后跟一些值但没有引号的情况
  const brokenStrokeRegex = /stroke([^="][^<>]*?)(\s|>)/g;
  fixedCode = fixedCode.replace(brokenStrokeRegex, (match, strokeValue, ending) => {
    if (!strokeValue.startsWith('=')) {
      console.log('修复未引用的stroke值:', match);
      return `stroke="${strokeValue.trim()}"${ending}`;
    }
    return match;
  });
  
  // 修复特定的问题模式
  const specificPatterns = [
    {
      search: /<path d="([^"]*)" stroke/g,
      check: (match) => !match.includes('stroke="'),
      replace: (match, d) => `<path d="${d}" stroke="`
    },
    {
      search: /"#([a-zA-Z0-9]+);/g,
      replace: (match) => match.replace(';', '"')
    },
    {
      search: /"#([a-zA-Z0-9]+)'/g,
      replace: (match) => match.replace('\'', '"')
    }
  ];
  
  for (const pattern of specificPatterns) {
    if (pattern.check) {
      let match;
      while ((match = pattern.search.exec(fixedCode)) !== null) {
        if (pattern.check(match[0])) {
          const beforeFix = fixedCode;
          fixedCode = fixedCode.replace(match[0], pattern.replace(match[0], match[1]));
          if (beforeFix !== fixedCode) {
            console.log('应用特定模式修复成功');
          }
        }
      }
    } else {
      fixedCode = fixedCode.replace(pattern.search, pattern.replace);
    }
  }
  
  // 修复用户特定的问题模式
  if (fixedCode.includes('<path d="M 400 200 L 400 240" stroke')) {
    console.log('检测到特定的问题模式，应用特定修复');
    fixedCode = fixedCode.replace(
      '<path d="M 400 200 L 400 240" stroke',
      '<path d="M 400 200 L 400 240" stroke="'
    );
  }
  
  // 修复SVG中缺失的xmlns属性
  if (fixedCode.includes('<svg') && !fixedCode.includes('xmlns="http://www.w3.org/2000/svg"')) {
    fixedCode = fixedCode.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
  }
  
  // 修复错位的tag
  const tagMismatchFixRegex = /<(\w+)[^>]*>([^<]*)<\/(?!\1)(\w+)>/g;
  fixedCode = fixedCode.replace(tagMismatchFixRegex, (match, openTag, content, closeTag) => {
    console.log(`修复标签不匹配: <${openTag}> 与 </${closeTag}>`);
    return `<${openTag}>${content}</${openTag}>`;
  });
  
  // 确保所有标签都正确闭合
  const openTagsStack = [];
  const tagRegex = /<\/?([a-z][a-z0-9]*)[^>]*>/gi;
  let tagMatch;
  
  while ((tagMatch = tagRegex.exec(fixedCode)) !== null) {
    const isClosingTag = tagMatch[0].startsWith('</');
    const tagName = tagMatch[1].toLowerCase();
    
    if (!isClosingTag && !tagMatch[0].endsWith('/>')) {
      openTagsStack.push({
        name: tagName,
        position: tagMatch.index + tagMatch[0].length
      });
    } else if (isClosingTag) {
      if (openTagsStack.length > 0 && openTagsStack[openTagsStack.length - 1].name === tagName) {
        openTagsStack.pop();
      }
    }
  }
  
  // 添加缺失的闭合标签
  if (openTagsStack.length > 0) {
    console.log('添加缺失的闭合标签:', openTagsStack.map(t => t.name).join(', '));
    let codeWithClosingTags = fixedCode;
    
    // 从栈顶到栈底添加闭合标签（先进后出）
    for (let i = openTagsStack.length - 1; i >= 0; i--) {
      const tag = openTagsStack[i];
      codeWithClosingTags += `</${tag.name}>`;
    }
    
    fixedCode = codeWithClosingTags;
  }
  
  // 确保有效的SVG
  if (!fixedCode.includes('</svg>')) {
    fixedCode += '</svg>';
  }
  
  return fixedCode;
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
      const svg = svgPreviewDiv.querySelector('svg');
      if (svg) {
        downloadSVG(svg, 'cover.svg');
      }
    };
  
    // 添加全屏按钮事件
    const fullscreenBtn = svgPreviewDiv.querySelector('.fullscreen-btn');
    fullscreenBtn.onclick = () => {
      const svg = svgPreviewDiv.querySelector('svg');
      if (svg) {
        // 创建新的窗口
        const newWindow = window.open('', '_blank');
        
        // 生成完整的HTML内容
        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(svg);
        
        // 创建HTML文档，包含自适应SVG的CSS
        const htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>SVG全屏预览</title>
            <style>
              body {
                margin: 0;
                padding: 0;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                background-color: #f5f5f5;
                overflow: auto;
              }
              .svg-container {
                max-width: 95vw;
                max-height: 95vh;
                margin: 20px;
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
                background: white;
                padding: 20px;
                border-radius: 8px;
                display: flex;
                justify-content: center;
                align-items: center;
              }
              svg {
                max-width: 100%;
                max-height: 100%;
                height: auto;
                width: auto;
              }
            </style>
          </head>
          <body>
            <div class="svg-container">
              ${svgString}
            </div>
          </body>
          </html>
        `;
        
        // 写入HTML内容
        newWindow.document.open();
        newWindow.document.write(htmlContent);
        newWindow.document.close();
      }
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
  
    // 解析SVG内容
    const svgContainer = svgPreviewDiv.querySelector('.svg-container');
    const parser = new DOMParser();
    console.log('开始解析SVG...');
    const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
    
    // 检查解析错误
    if (svgDoc.querySelector('parsererror')) {
      console.error('SVG解析错误:', svgDoc.querySelector('parsererror').textContent);
      console.log('尝试修复SVG内容...');
      
      // 尝试修复SVG内容
      const fixedSvgContent = fixSvgContent(svgContent);
      console.log('修复后SVG内容长度:', fixedSvgContent.length);
      console.log('修复后SVG内容预览:', fixedSvgContent.substring(0, 100) + '...');
      
      const fixedSvgDoc = parser.parseFromString(fixedSvgContent, 'image/svg+xml');
      
      if (fixedSvgDoc.querySelector('parsererror')) {
        console.error('修复失败，错误:', fixedSvgDoc.querySelector('parsererror').textContent);
        svgContainer.innerHTML = '<div style="color: red;">SVG 解析错误，无法修复。可能是SVG代码不完整或包含错误。</div>';
        return;
      }
      
      console.log('SVG修复成功，开始渲染...');
      const svgElement = fixedSvgDoc.documentElement;
      console.log('SVG元素:', svgElement.tagName);
      
      svgElement.setAttribute('width', '100%');
      svgElement.setAttribute('height', '100%');
      svgElement.setAttribute('preserveAspectRatio', 'xMidYMid meet');
      
      svgContainer.innerHTML = '';
      svgContainer.appendChild(svgElement);
      
      // 监听容器大小变化
      const resizeObserver = new ResizeObserver(() => {
        // SVG已设置为自适应，这里只需确保其他元素正确定位即可
        updateSvgViewport(svgElement, svgContainer);
      });
      
      // 观察容器大小变化
      resizeObserver.observe(svgContainer);
      resizeObserver.observe(svgPreviewDiv);
      
      // 当预览窗口关闭时，取消观察
      svgPreviewDiv.addEventListener('remove', () => {
        resizeObserver.disconnect();
      }, { once: true });
      
      // 初始化SVG视口
      updateSvgViewport(svgElement, svgContainer);
    } else {
      console.log('SVG解析成功，开始渲染...');
      const svgElement = svgDoc.documentElement;
      console.log('SVG元素:', svgElement.tagName);
      
      svgElement.setAttribute('width', '100%');
      svgElement.setAttribute('height', '100%');
      svgElement.setAttribute('preserveAspectRatio', 'xMidYMid meet');
      
      svgContainer.innerHTML = '';
      svgContainer.appendChild(svgElement);
      
      // 监听容器大小变化
      const resizeObserver = new ResizeObserver(() => {
        // SVG已设置为自适应，这里只需确保其他元素正确定位即可
        updateSvgViewport(svgElement, svgContainer);
      });
      
      // 观察容器大小变化
      resizeObserver.observe(svgContainer);
      resizeObserver.observe(svgPreviewDiv);
      
      // 当预览窗口关闭时，取消观察
      svgPreviewDiv.addEventListener('remove', () => {
        resizeObserver.disconnect();
      }, { once: true });
      
      // 初始化SVG视口
      updateSvgViewport(svgElement, svgContainer);
    }
  } catch (error) {
    console.error('Error in showSvgPreview:', error);
    
    if (svgPreviewDiv) {
      const svgContainer = svgPreviewDiv.querySelector('.svg-container');
      svgContainer.innerHTML = `<div style="color: red;">SVG 预览错误: ${error.message}</div>`;
    }
  }
}

// 尝试修复SVG内容
function fixSvgContent(svgContent) {
  console.log('运行fixSvgContent进行额外修复...');
  
  // 应用现有修复
  let fixedContent = svgContent;
  
  // 0. 特别处理SVG滤镜元素不匹配问题
  console.log('检查并修复SVG滤镜元素标签不匹配问题...');
  
  // 修复feMerge和filter标签不匹配问题
  const filterTagCheck = (content) => {
    // 计数所有开始和结束标签
    const filterOpenTags = (content.match(/<filter/g) || []).length;
    const filterCloseTags = (content.match(/<\/filter>/g) || []).length;
    const femergeOpenTags = (content.match(/<feMerge/g) || []).length;
    const femergeCloseTags = (content.match(/<\/feMerge>/g) || []).length;
    
    console.log(`filter标签计数: 开始=${filterOpenTags}, 结束=${filterCloseTags}`);
    console.log(`feMerge标签计数: 开始=${femergeOpenTags}, 结束=${femergeCloseTags}`);
    
    let fixedContent = content;
    
    // 如果feMerge和filter标签不匹配
    if (filterOpenTags > filterCloseTags) {
      console.log('发现filter标签未闭合，添加缺失的</filter>标签');
      const filterRegex = /<filter[^>]*>[\s\S]*?(?:<\/filter>|$)/g;
      let match;
      while ((match = filterRegex.exec(content)) !== null) {
        // 检查这个filter块是否有闭合标签
        if (!match[0].includes('</filter>')) {
          const openTag = match[0];
          const fixedTag = openTag + '</filter>';
          fixedContent = fixedContent.replace(openTag, fixedTag);
        }
      }
    }
    
    if (femergeOpenTags > femergeCloseTags) {
      console.log('发现feMerge标签未闭合，添加缺失的</feMerge>标签');
      const femergeRegex = /<feMerge[^>]*>[\s\S]*?(?:<\/feMerge>|$)/g;
      let match;
      while ((match = femergeRegex.exec(content)) !== null) {
        // 检查这个feMerge块是否有闭合标签
        if (!match[0].includes('</feMerge>')) {
          const openTag = match[0];
          const fixedTag = openTag + '</feMerge>';
          fixedContent = fixedContent.replace(openTag, fixedTag);
        }
      }
    }
    
    // 检查filter标签中是否有未闭合的feMerge标签
    const filterBlocks = content.match(/<filter[^>]*>[\s\S]*?<\/filter>/g) || [];
    for (const block of filterBlocks) {
      const feMergeOpenCount = (block.match(/<feMerge/g) || []).length;
      const feMergeCloseCount = (block.match(/<\/feMerge>/g) || []).length;
      
      if (feMergeOpenCount > feMergeCloseCount) {
        console.log('在filter块中发现未闭合的feMerge标签');
        let fixedBlock = block;
        for (let i = 0; i < feMergeOpenCount - feMergeCloseCount; i++) {
          // 在filter闭合标签前添加feMerge闭合标签
          fixedBlock = fixedBlock.replace('</filter>', '</feMerge></filter>');
        }
        fixedContent = fixedContent.replace(block, fixedBlock);
      }
    }
    
    return fixedContent;
  };
  
  // 修复其他常见的SVG滤镜元素不匹配问题
  const svgFilterElements = [
    'feBlend', 'feColorMatrix', 'feComponentTransfer', 'feComposite',
    'feConvolveMatrix', 'feDiffuseLighting', 'feDisplacementMap', 'feDropShadow',
    'feFlood', 'feFuncA', 'feFuncB', 'feFuncG', 'feFuncR', 'feGaussianBlur',
    'feImage', 'feMergeNode', 'feMorphology', 'feOffset', 'feSpecularLighting',
    'feTile', 'feTurbulence'
  ];
  
  // 检查并修复所有滤镜元素
  for (const element of svgFilterElements) {
    const openTags = (fixedContent.match(new RegExp(`<${element}[^>]*>`, 'g')) || []).length;
    const closeTags = (fixedContent.match(new RegExp(`<\\/${element}>`, 'g')) || []).length;
    
    if (openTags > closeTags) {
      console.log(`发现${element}标签未闭合，添加缺失的闭合标签`);
      const elemRegex = new RegExp(`<${element}[^>]*>([\\s\\S]*?)(?:<\\/${element}>|$)`, 'g');
      let match;
      while ((match = elemRegex.exec(fixedContent)) !== null) {
        // 检查这个元素块是否有闭合标签
        if (!match[0].includes(`</${element}>`)) {
          const openTag = match[0];
          const fixedTag = openTag + `</${element}>`;
          fixedContent = fixedContent.replace(openTag, fixedTag);
        }
      }
    }
  }
  
  // 特别处理feMerge和filter标签不匹配的问题 
  if (fixedContent.includes('<filter') && fixedContent.includes('<feMerge')) {
    fixedContent = filterTagCheck(fixedContent);
    
    // 另一种方案：修复因格式错误导致的filter和feMerge标签不匹配
    if (fixedContent.includes('</feMerge></filter>') === false && 
        fixedContent.includes('<feMerge') && 
        fixedContent.includes('</filter>')) {
      console.log('尝试修复filter和feMerge标签嵌套问题');
      
      // 查找最后一个feMerge开始标签和第一个filter结束标签之间是否缺少feMerge结束标签
      const lastFeMergePos = fixedContent.lastIndexOf('<feMerge');
      const firstFilterClosePos = fixedContent.indexOf('</filter>', lastFeMergePos);
      
      if (lastFeMergePos !== -1 && firstFilterClosePos !== -1) {
        // 检查在这个范围内是否有feMerge的结束标签
        const hasFeMergeClose = fixedContent.substring(lastFeMergePos, firstFilterClosePos).includes('</feMerge>');
        
        if (!hasFeMergeClose) {
          // 在filter结束标签前添加feMerge结束标签
          fixedContent = fixedContent.substring(0, firstFilterClosePos) + 
                         '</feMerge>' + 
                         fixedContent.substring(firstFilterClosePos);
          console.log('添加了缺失的</feMerge>标签');
        }
      }
    }
  }
  
  // 1. 修复未闭合的标签
  const unbalancedTags = findUnbalancedTags(fixedContent);
  for (const tag of unbalancedTags) {
    if (!tag.hasClosing && !tag.isSelfClosing) {
      console.log(`添加缺失的闭合标签: </${tag.tagName}>`);
      fixedContent += `</${tag.tagName}>`;
    }
  }
  
  // 2. 修复缺失的SVG结束标签
  if (fixedContent.indexOf('<svg') !== -1 && fixedContent.indexOf('</svg>') === -1) {
    console.log('添加缺失的</svg>标签');
    fixedContent += '</svg>';
  }
  
  // 3. 修复可能的截断问题
  const truncatedTextFixRegex = /(<text[^>]*>)([^<]*)/g;
  fixedContent = fixedContent.replace(truncatedTextFixRegex, (match, p1, p2) => {
    if (!match.includes('</text>')) {
      console.log('修复未闭合的text标签');
      return `${p1}${p2}</text>`;
    }
    return match;
  });
  
  // 4. 修复属性构造错误
  const attrConstructErrorRegex = /(\w+)=([^"\s>][^>\s]*)/g;
  fixedContent = fixedContent.replace(attrConstructErrorRegex, (match, attr, value) => {
    if (value.startsWith('"') && !value.endsWith('"')) {
      console.log(`修复未正确引用的属性: ${attr}`);
      // 查找下一个引号
      const nextQuote = fixedContent.indexOf('"', fixedContent.indexOf(match) + match.length);
      if (nextQuote !== -1) {
        const fullValue = fixedContent.substring(
          fixedContent.indexOf(match) + attr.length + 1, 
          nextQuote + 1
        );
        return `${attr}=${fullValue}`;
      }
    }
    
    if (!value.startsWith('"') && !value.endsWith('"')) {
      console.log(`为属性添加引号: ${attr}="${value}"`);
      return `${attr}="${value}"`;
    }
    
    return match;
  });
  
  // 5. 修复路径相关问题
  const strokeFixRegex = /stroke\s+([^="][^\s>]*)/g;
  fixedContent = fixedContent.replace(strokeFixRegex, (match, value) => {
    console.log(`修复stroke属性: stroke="${value}"`);
    return `stroke="${value}"`;
  });
  
  const markerEndFixRegex = /marker-end\s+([^="][^\s>]*)/g;
  fixedContent = fixedContent.replace(markerEndFixRegex, (match, value) => {
    console.log(`修复marker-end属性: marker-end="${value}"`);
    return `marker-end="${value}"`;
  });
  
  // 6. 修复"stroke"后面直接是换行而不是等号的情况
  if (fixedContent.includes('stroke\n') || fixedContent.includes('stroke\r\n')) {
    console.log('检测到stroke换行问题，尝试修复');
    
    // 正则表达式匹配 stroke 后面接换行，然后是各种不包含 = 的内容，直到引号
    const strokeLineBreakRegex = /stroke\r?\n([^=]*?)"/g;
    fixedContent = fixedContent.replace(strokeLineBreakRegex, (match, content) => {
      return `stroke="${content}"`;
    });
    
    // 如果没有引号，可能需要进一步处理
    if (fixedContent.includes('stroke\n') || fixedContent.includes('stroke\r\n')) {
      const brokenStrokeRegex = /stroke\r?\n([^<>]*?)(\s|$)/g;
      fixedContent = fixedContent.replace(brokenStrokeRegex, (match, content, ending) => {
        return `stroke="${content.trim()}"${ending}`;
      });
    }
  }
  
  // 7. 尝试特别处理错位属性的情况
  if (fixedContent.includes('marker-end="url(#arrowhead)" />')) {
    console.log('检测到特殊的marker-end模式，确保路径有正确的结束标签');
    fixedContent = fixedContent.replace(
      /stroke\r?\n([^"]*)"([^>]*?)marker-end="url\(#arrowhead\)" \/>/g,
      'stroke="$1"$2marker-end="url(#arrowhead)" />'
    );
  }
  
  // 8. 强力清理：将所有 stroke 后面跟的非属性内容用引号包围
  const forceStrokeFixRegex = /stroke([^=<>"]*)([^\s"<=][^\s<=>]*)/g;
  fixedContent = fixedContent.replace(forceStrokeFixRegex, (match, spacing, value) => {
    // 如果spacing不包含等号，则进行修复
    if (!spacing.includes('=')) {
      console.log('强制修复stroke属性值:', value);
      return `stroke="${value}"`;
    }
    return match;
  });
  
  // 9. 格式化所有路径元素，确保它们的语法正确
  const pathElements = fixedContent.match(/<path[^>]*>/g) || [];
  for (const pathElement of pathElements) {
    // 如果路径元素中有明显的问题，尝试修复
    if ((pathElement.includes('stroke') && !pathElement.includes('stroke=')) ||
        (pathElement.includes('fill') && !pathElement.includes('fill=')) ||
        (pathElement.includes('marker-end') && !pathElement.includes('marker-end='))) {
      
      console.log('修复问题路径元素:', pathElement);
      
      let fixedPath = pathElement;
      
      // 修复stroke属性
      if (fixedPath.includes('stroke') && !fixedPath.includes('stroke=')) {
        const strokeMatch = fixedPath.match(/stroke\s+([^<>\s"]*)/);
        if (strokeMatch) {
          fixedPath = fixedPath.replace(
            strokeMatch[0], 
            `stroke="${strokeMatch[1]}"`
          );
        }
      }
      
      // 修复fill属性
      if (fixedPath.includes('fill') && !fixedPath.includes('fill=')) {
        const fillMatch = fixedPath.match(/fill\s+([^<>\s"]*)/);
        if (fillMatch) {
          fixedPath = fixedPath.replace(
            fillMatch[0], 
            `fill="${fillMatch[1]}"`
          );
        }
      }
      
      // 修复marker-end属性
      if (fixedPath.includes('marker-end') && !fixedPath.includes('marker-end=')) {
        const markerMatch = fixedPath.match(/marker-end\s+([^<>\s"]*)/);
        if (markerMatch) {
          fixedPath = fixedPath.replace(
            markerMatch[0], 
            `marker-end="${markerMatch[1]}"`
          );
        }
      }
      
      fixedContent = fixedContent.replace(pathElement, fixedPath);
    }
  }
  
  // 重要：处理特定错误：修复包含换行的stroke属性
  if (fixedContent.includes('<path d="M 400 200 L 400 240" stroke')) {
    console.log('检测到特定问题模式，应用专门修复');
    
    // 尝试找到完整的路径字符串
    const brokenPathIndex = fixedContent.indexOf('<path d="M 400 200 L 400 240" stroke');
    if (brokenPathIndex !== -1) {
      // 找到该行后的内容
      const afterPath = fixedContent.substring(brokenPathIndex);
      // 将整个路径替换为修复后的版本
      const fixedPath = afterPath
        .replace('<path d="M 400 200 L 400 240" stroke', '<path d="M 400 200 L 400 240" stroke="')
        .replace(/\n([^"<>]*)/, '"$1"');
        
      // 截取到下一个标签前的内容
      const nextTagIndex = fixedPath.indexOf('<', 1);
      const pathToFix = fixedPath.substring(0, nextTagIndex);
      
      // 替换原始内容
      fixedContent = fixedContent.substring(0, brokenPathIndex) + 
                      pathToFix + 
                      fixedContent.substring(brokenPathIndex + pathToFix.length);
    }
  }
  
  // 最后的安全措施：对整个SVG进行语法检查
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(fixedContent, 'image/svg+xml');
    
    // 如果仍有解析错误，尝试重新生成简化的SVG
    if (doc.querySelector('parsererror')) {
      console.log('修复后仍有解析错误，尝试提取可用内容并重新生成SVG');
      
      // 再次尝试修复滤镜问题
      console.log('最后尝试：彻底重构SVG滤镜元素...');
      
      // 简单修复：移除所有滤镜效果，保留基本图形
      let strippedContent = fixedContent;
      
      // 移除所有filter标签及其内容
      strippedContent = strippedContent.replace(/<filter[^>]*>[\s\S]*?<\/filter>/g, '');
      
      // 移除对filter的引用
      strippedContent = strippedContent.replace(/filter="[^"]*"/g, '');
      strippedContent = strippedContent.replace(/filter:url\([^)]*\);?/g, '');
      
      // 检查移除滤镜后是否解析正确
      const strippedDoc = parser.parseFromString(strippedContent, 'image/svg+xml');
      if (!strippedDoc.querySelector('parsererror')) {
        console.log('移除滤镜后SVG可以正确解析');
        return strippedContent;
      }
      
      // 提取所有SVG元素
      const elements = [];
      const elementRegex = /<(rect|circle|path|text|polygon|polyline|line|ellipse)[^>]*>/g;
      let elementMatch;
      
      while ((elementMatch = elementRegex.exec(fixedContent)) !== null) {
        // 找到元素的结束位置
        const tagName = elementMatch[1];
        const startPos = elementMatch.index;
        
        // 如果是自闭合标签
        if (elementMatch[0].endsWith('/>')) {
          elements.push(elementMatch[0]);
          continue;
        }
        
        // 找到对应的闭合标签
        const closeTagRegex = new RegExp(`</${tagName}>`, 'g');
        closeTagRegex.lastIndex = startPos + elementMatch[0].length;
        const closeMatch = closeTagRegex.exec(fixedContent);
        
        if (closeMatch) {
          elements.push(fixedContent.substring(startPos, closeMatch.index + closeMatch[0].length));
        } else {
          // 如果没有找到闭合标签，只添加开始标签并自行闭合
          elements.push(elementMatch[0].replace('>', '/>'));
        }
      }
      
      // 提取defs部分，但排除问题滤镜
      let defsContent = '';
      const defsMatch = fixedContent.match(/<defs>[\s\S]*?<\/defs>/);
      if (defsMatch) {
        // 从defs中移除所有filter标签及其内容
        let cleanDefs = defsMatch[0].replace(/<filter[^>]*>[\s\S]*?<\/filter>/g, '');
        // 如果defs里还有内容
        if (cleanDefs.replace(/<\/?defs>/g, '').trim()) {
          defsContent = cleanDefs;
        }
      }
      
      // 重新组装最小化的SVG
      const minimalSvg = `<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
        ${defsContent}
        ${elements.join('\n')}
      </svg>`;
      
      console.log('创建了最小化SVG:', minimalSvg.substring(0, 100) + '...');
      return minimalSvg;
    }
    
    // 如果修复成功，返回修复后的内容
    return fixedContent;
  } catch (e) {
    console.error('最终SVG语法检查失败:', e);
    return fixedContent;
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

// 检查响应是否需要显示继续按钮
function shouldShowContinueButton(content) {
  // 如果内容结尾不包含svg或html标签，则认为可能需要继续生成
  const endWithSvgOrHtml = /<\/(svg|html)>\s*$/i.test(content.trim());
  return !endWithSvgOrHtml;
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
      if (completeCode) {
        showSvgPreview(completeCode);
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
    if (completeCode) {
      lastSvgContent = completeCode;
      console.log('Found complete code:', lastSvgContent); // 添加调试日志
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
    if (completeCode) {
      lastSvgContent = completeCode;
      showSvgPreview(completeCode);
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
