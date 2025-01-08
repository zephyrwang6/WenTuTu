// 国际化配置
window.i18n = {
  en: {
    title: 'WenTuTu Settings',
    apiSection: {
      title: 'DeepSeek API Configuration',
      keyLabel: 'API Key:',
      keyPlaceholder: 'Enter your DeepSeek API key',
      helpText: 'Get your API key from'
    },
    customPrompts: {
      title: 'Custom Prompts',
      helpText: 'You can create up to 5 custom prompts. Each prompt will be available in the popup menu.',
      addButton: 'Add Custom Prompt',
      resetButton: 'Reset All',
      enable: 'Enable',
      nameLabel: 'Prompt Name:',
      namePlaceholder: 'Enter a name for this prompt',
      contentLabel: 'Prompt Content:',
      contentPlaceholder: 'Enter your custom prompt here',
      deleteConfirm: 'Are you sure you want to delete this custom prompt?',
      resetConfirm: 'Are you sure you want to reset all custom prompts? This will delete all created prompts.',
      maxPrompts: 'Maximum number of custom prompts reached',
      validation: {
        apiKeyRequired: 'Please enter API Key',
        nameContentRequired: 'Enabled custom prompts must have both name and content'
      }
    },
    save: 'Save Settings',
    saveSuccess: 'Settings saved successfully',
    language: 'Language'
  },
  zh: {
    title: '文图图 设置',
    apiSection: {
      title: 'DeepSeek API 配置',
      keyLabel: 'API 密钥：',
      keyPlaceholder: '请输入您的 DeepSeek API 密钥',
      helpText: '从这里获取 API 密钥'
    },
    customPrompts: {
      title: '自定义提示词',
      helpText: '您最多可以创建5个自定义提示词。每个提示词都会出现在弹出菜单中。',
      addButton: '添加自定义提示词',
      resetButton: '重置所有',
      enable: '启用',
      nameLabel: '提示词名称：',
      namePlaceholder: '请输入提示词名称',
      contentLabel: '提示词内容：',
      contentPlaceholder: '请输入提示词内容',
      deleteConfirm: '确定要删除这个自定义提示词吗？',
      resetConfirm: '确定要重置所有自定义提示词吗？这将删除所有已创建的提示词。',
      maxPrompts: '已达到最大自定义提示词数量',
      validation: {
        apiKeyRequired: '请输入 API 密钥',
        nameContentRequired: '启用的自定义提示词必须填写名称和内容'
      }
    },
    save: '保存设置',
    saveSuccess: '设置已保存',
    language: '语言'
  }
};
