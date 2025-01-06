// Popup script
document.addEventListener('DOMContentLoaded', function() {
  // 获取按钮元素
  const generateFullCoverBtn = document.getElementById('generateFullCover');
  const openSettingsLink = document.getElementById('openSettings');

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

      // 发送消息到background script生成封面
      chrome.runtime.sendMessage({
        action: "generateCover",
        text: response.content,
        type: "full"
      });

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
});
