// 保存设置
document.addEventListener('DOMContentLoaded', function() {
  // 设置默认的提示词
  const defaultSettings = {
    fullArticlePrompt: "请为以下文章生成一个吸引人的封面图片描述。需要考虑文章的主题、情感和关键信息。",
    selectedTextPrompt: "请根据以下选中的文本片段生成一个相关的封面图片描述。需要突出核心观点和情感。"
  };

  // 加载已保存的设置
  chrome.storage.sync.get(['apiKey', 'fullArticlePrompt', 'selectedTextPrompt'], function(items) {
    document.getElementById('apiKey').value = items.apiKey || '';
    document.getElementById('fullArticlePrompt').value = items.fullArticlePrompt || defaultSettings.fullArticlePrompt;
    document.getElementById('selectedTextPrompt').value = items.selectedTextPrompt || defaultSettings.selectedTextPrompt;
  });

  // 保存设置
  document.getElementById('save').addEventListener('click', function() {
    const apiKey = document.getElementById('apiKey').value;
    const fullArticlePrompt = document.getElementById('fullArticlePrompt').value;
    const selectedTextPrompt = document.getElementById('selectedTextPrompt').value;

    chrome.storage.sync.set({
      apiKey: apiKey,
      fullArticlePrompt: fullArticlePrompt,
      selectedTextPrompt: selectedTextPrompt
    }, function() {
      const status = document.getElementById('status');
      status.textContent = '设置已保存';
      setTimeout(function() {
        status.textContent = '';
      }, 2000);
    });
  });
});
