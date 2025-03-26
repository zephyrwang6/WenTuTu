let resultDiv = null;
let svgPreviewDiv = null;
let fullContent = '';
let lastSvgContent = null;

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

function showSvgPreview(svgContent) {
  // 保存SVG内容用于刷新
  lastSvgContent = svgContent;

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
        <button class="close-btn" title="关闭预览">&times;</button>
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
  const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
  
  // 检查解析错误
  if (svgDoc.querySelector('parsererror')) {
    console.error('SVG parsing error');
    svgContainer.innerHTML = '<div style="color: red;">SVG 解析错误</div>';
    return;
  }

  const svgElement = svgDoc.documentElement;
  
  // 设置SVG属性使其能够自适应容器
  svgElement.setAttribute('width', '100%');
  svgElement.setAttribute('height', '100%');
  svgElement.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  
  // 清空并添加SVG
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
