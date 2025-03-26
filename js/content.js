let resultDiv = null;
let svgPreviewDiv = null;
let fullContent = '';
let lastSvgContent = null;

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

function showSvgPreview(svgContent) {
  if (svgPreviewDiv) {
    svgPreviewDiv.remove();
  }

  svgPreviewDiv = document.createElement('div');
  svgPreviewDiv.className = 'svg-preview';
  svgPreviewDiv.innerHTML = `
    <div class="header">
      <div class="actions">
        <button class="download-btn">下载</button>
        <button class="close-btn">&times;</button>
      </div>
    </div>
    <div class="svg-container"></div>
  `;

  const downloadBtn = svgPreviewDiv.querySelector('.download-btn');
  downloadBtn.onclick = () => {
    const svg = svgPreviewDiv.querySelector('svg');
    if (svg) {
      downloadSVG(svg, 'cover.svg');
    }
  };

  svgPreviewDiv.querySelector('.close-btn').onclick = () => {
    svgPreviewDiv.remove();
    svgPreviewDiv = null;
    // 显示预览按钮
    const previewBtn = document.querySelector('.ai-cover-result .preview-btn');
    if (previewBtn) {
      previewBtn.style.display = 'inline-block';
    }
  };

  document.body.appendChild(svgPreviewDiv);

  const svgContainer = svgPreviewDiv.querySelector('.svg-container');
  const parser = new DOMParser();
  const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
  if (svgDoc.querySelector('parsererror')) {
    console.error('SVG parsing error');
    return;
  }

  const svgElement = svgDoc.documentElement;
  
  // 获取原始尺寸
  const viewBox = svgElement.getAttribute('viewBox');
  const [, , vbWidth, vbHeight] = viewBox ? viewBox.split(' ').map(Number) : [0, 0, 360, 360];
  
  // 设置固定宽度，高度自适应保持比例
  const containerWidth = 360;
  const containerHeight = (containerWidth * vbHeight) / vbWidth;
  
  // 设置SVG尺寸
  svgElement.setAttribute('width', containerWidth);
  svgElement.setAttribute('height', containerHeight);
  svgElement.style.display = 'block';
  
  svgContainer.innerHTML = '';
  svgContainer.appendChild(svgElement);
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
          <button class="copy-btn">复制</button>
          <button class="close-btn">&times;</button>
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
      if (lastSvgContent) {
        showSvgPreview(lastSvgContent);
      }
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

    // 使用更宽松的正则表达式来匹配SVG内容
    const svgRegex = /<svg[\s\S]*?<\/svg>/gi;
    const svgMatches = fullContent.match(svgRegex);

    if (svgMatches && svgMatches[svgMatches.length - 1]) {
      lastSvgContent = svgMatches[svgMatches.length - 1];
      console.log('Found SVG content:', lastSvgContent); // 添加调试日志
      showSvgPreview(lastSvgContent);
      // 显示预览按钮
      const previewBtn = resultDiv.querySelector('.preview-btn');
      if (previewBtn) {
        previewBtn.style.display = 'inline-block';
      }
    }
  }

  else if (request.action === "completeGeneration" && resultDiv) {
    resultDiv.querySelector('.typing-indicator').remove();
    resultDiv.querySelector('h3').textContent = 'SVG生成';
    setTimeout(() => scrollToBottom(resultDiv), 100);
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
              <button class="copy-btn">复制</button>
              <button class="close-btn">&times;</button>
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

        document.body.appendChild(resultDiv);
      }
      
      // 更新内容
      const content = resultDiv.querySelector('.content');
      content.textContent = request.svg;
      fullContent = request.svg;
      
      // 显示预览
      showSvgPreview(request.svg);
    }
  }
});
