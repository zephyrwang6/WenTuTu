// 创建上下文菜单
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "generateCoverFromSelection",
    title: "为选中文本生成封面",
    contexts: ["selection"]
  });
});

// 处理上下文菜单点击
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "generateCoverFromSelection") {
    generateCover(info.selectionText);
  }
});

// 处理来自popup或content script的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "generateCover") {
    generateCover(request.text);
  }
});

// 生成封面的主要函数
async function generateCover(text) {
  try {
    const settings = await chrome.storage.sync.get(['apiKey', 'fullArticlePrompt']);
    if (!settings.apiKey) {
      throw new Error('请先在设置中配置API密钥');
    }

    // 通知开始生成
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {action: "startGeneration"});
    });

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settings.apiKey}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: settings.fullArticlePrompt || "请为以下文章生成一个吸引人的封面图片描述。" },
          { role: "user", content: text }
        ],
        stream: true
      })
    });

    if (!response.ok) throw new Error('API请求失败');

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const {done, value} = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (!line.trim() || line.includes('[DONE]')) continue;
        try {
          const json = JSON.parse(line.replace(/^data: /, ''));
          if (json.choices[0].delta.content) {
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
              chrome.tabs.sendMessage(tabs[0].id, {
                action: "appendContent",
                content: json.choices[0].delta.content
              });
            });
          }
        } catch (e) {}
      }
    }

    // 通知生成完成
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {action: "completeGeneration"});
    });

  } catch (error) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: "error",
        message: error.message
      });
    });
  }
}
