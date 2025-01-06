let resultDiv = null;
let svgPreviewDiv = null;
let fullContent = '';

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
          <button class="close-btn">&times;</button>
        </div>
      </div>
      <div class="content"></div>
      <div class="typing-indicator">
        <span></span><span></span><span></span>
      </div>
    `;

    resultDiv.querySelector('.close-btn').onclick = () => resultDiv.remove();
    document.body.appendChild(resultDiv);
  }

  else if (request.action === "appendContent" && resultDiv) {
    const content = resultDiv.querySelector('.content');
    fullContent += request.content;
    content.textContent = fullContent;
    scrollToBottom(content);

    const svgRegex = /<svg[^>]*>[\s\S]*?<\/svg>/gi;
    const svgMatches = fullContent.match(svgRegex);

    if (svgMatches) {
      console.log('Found SVG:', svgMatches[0]);

      if (!svgPreviewDiv) {
        svgPreviewDiv = document.createElement('div');
        svgPreviewDiv.className = 'svg-preview';
        svgPreviewDiv.innerHTML = `
          <div class="header">
            <h3>SVG预览</h3>
            <div class="actions">
              <button class="download-btn">下载SVG</button>
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

        svgPreviewDiv.querySelector('.close-btn').onclick = () => svgPreviewDiv.remove();
        document.body.appendChild(svgPreviewDiv);
      }

      const svgContainer = svgPreviewDiv.querySelector('.svg-container');
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(svgMatches[0], 'image/svg+xml');
      if (svgDoc.querySelector('parsererror')) {
        console.error('SVG parsing error');
        return;
      }

      const svgElement = svgDoc.documentElement;
      svgElement.setAttribute('width', '100%');
      svgElement.setAttribute('height', '100%');
      svgElement.setAttribute('preserveAspectRatio', 'xMidYMid meet');

      svgContainer.innerHTML = '';
      svgContainer.appendChild(svgElement);

      if (!resultDiv.querySelector('.svg-code')) {
        const codeDiv = document.createElement('div');
        codeDiv.className = 'svg-code';
        codeDiv.innerHTML = `
          <div class="code-header">
            <span>SVG代码</span>
            <button class="copy-btn">复制代码</button>
          </div>
          <pre><code>${svgMatches[0].replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>
        `;

        const copyBtn = codeDiv.querySelector('.copy-btn');
        copyBtn.onclick = () => {
          navigator.clipboard.writeText(svgMatches[0])
            .then(() => {
              copyBtn.textContent = '已复制';
              setTimeout(() => {
                copyBtn.textContent = '复制代码';
              }, 2000);
            })
            .catch(err => console.error('复制失败:', err));
        };

        resultDiv.appendChild(codeDiv);
        setTimeout(() => scrollToBottom(resultDiv), 100);
      }
    }
  }

  else if (request.action === "completeGeneration" && resultDiv) {
    resultDiv.querySelector('.typing-indicator').remove();
    resultDiv.querySelector('h3').textContent = 'SVG生成';
    setTimeout(() => scrollToBottom(resultDiv), 100);
  }

  else if (request.action === "error") {
    if (resultDiv) resultDiv.remove();
    if (svgPreviewDiv) svgPreviewDiv.remove();
    alert(request.message);
  }
});
