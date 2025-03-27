# WenTuTu Chrome Extension

A powerful Chrome extension for converting text to beautiful SVG/HTML images instantly.

# 文图图 Chrome 扩展

一款强大的 Chrome 扩展，可以即时将文本转换为精美的 SVG/HTML 图像。

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right corner
3. Click "Load unpacked" and select this directory

## 安装方法

1. 打开 Chrome 并导航至 `chrome://extensions/`
2. 在右上角启用"开发者模式"
3. 点击"加载已解压的扩展程序"并选择此目录

## Project Structure

```
📦 wentutu-extension/
├── manifest.json        # Extension configuration
├── popup.html           # Main popup interface
├── popup.js             # Popup functionality
├── options.html         # Options page
├── options.js           # Options functionality
├── js/
│   ├── content.js       # Content script
│   └── background.js    # Background service
└── images/              # Icon resources
```

## 项目结构

```
📦 wentutu-extension/
├── manifest.json        # 扩展配置
├── popup.html           # 主弹出界面
├── popup.js             # 弹出窗口功能
├── options.html         # 选项页面
├── options.js           # 选项功能
├── js/
│   ├── content.js       # 内容脚本
│   └── background.js    # 后台服务
└── images/              # 图标资源
```

## Core Features

### Quick Generate Mode
- Click extension icon and input text in popup
- Choose from built-in template styles
- Generate SVG/HTML images with one click

### Selection Mode
- Select text on any webpage
- Right-click and choose "Convert Selection"
- Transform selected text into beautiful images

### Preview Functionality
- Preview generated SVG/HTML directly in the browser
- Full-screen view option for detailed inspection
- Download images for offline use

## 核心功能

### 快速生成模式
- 点击扩展图标并在弹出窗口中输入文本
- 从内置模板样式中选择
- 一键生成 SVG/HTML 图像

### 选择模式
- 在任何网页上选择文本
- 右键单击并选择"转换选中内容"
- 将选定文本转换为精美图像

### 预览功能
- 直接在浏览器中预览生成的 SVG/HTML
- 提供全屏视图选项，便于详细检查
- 下载图像供离线使用

## Built-in Templates

### Logic Diagram Templates
- **Black & White Logic Diagram (3:4)**
  - Hierarchical structure
  - Clean minimalist design
  - Optimized for clarity

- **Gradient Color Diagram (4:3)**
  - Auto-layout algorithms
  - Multiple color schemes
  - Enhanced visual appeal

### Relationship Types
- Progressive relationships
- Process flows
- Cyclic patterns
- Hierarchical structures
- Comparison matrices
- Matrix layouts

## 内置模板

### 逻辑图表模板
- **黑白逻辑图(3:4)**
  - 层次结构
  - 简洁的极简设计
  - 为清晰度优化

- **渐变色配图(4:3)**
  - 自动布局算法
  - 多种配色方案
  - 增强视觉吸引力

### 关系类型
- 递进关系
- 流程关系
- 循环关系
- 层次结构
- 对比关系
- 矩阵关系

## Advanced Features

### Custom Prompts
- Create and save your own prompt templates
- Edit existing templates to suit your needs
- Share templates with other users

### HTML Support
- Generate and preview HTML content
- Compatible with Tailwind CSS for styling
- Responsive design preview

## 高级功能

### 自定义提示词
- 创建并保存您自己的提示词模板
- 编辑现有模板以满足您的需求
- 与其他用户共享模板

### HTML 支持
- 生成和预览 HTML 内容
- 兼容 Tailwind CSS 样式
- 响应式设计预览

## Privacy Notice

Last Updated: 03/27 2025

### Overview
We are committed to protecting your privacy and handling your data with transparency and care. This privacy notice explains how we collect, use, and safeguard your information when you use our Text-to-Image conversion service.

### Information We Collect

#### User-Provided Content
- Text content you submit for image conversion
- Selected webpage content
- Custom prompts and templates
- API configuration settings

#### Technical Information
- Browser type and version
- Operating system
- Device information
- Usage statistics and interaction data

### How We Use Your Information

#### Core Service Functionality
- Converting text to SVG/HTML images
- Processing webpage content
- Generating customized visual outputs
- Template management and customization

#### Service Improvement
- Enhancing conversion accuracy
- Improving template designs
- Optimizing user experience
- Analyzing usage patterns for feature development

### Data Protection

#### Security Measures
- Industry-standard encryption for data transmission
- Secure storage of user content
- Regular security audits and updates
- Access controls and authentication protocols

#### Data Retention
- User-generated content is temporarily stored only for processing purposes
- Converted images are automatically deleted after 24 hours
- Custom templates are retained until user account deletion

### Your Rights
- Access your stored information
- Request data deletion
- Opt-out of analytics
- Export your custom templates and settings

### Third-Party Services
We do not share your content with third parties except when:
- Required by law
- Necessary for service operation (e.g., cloud storage providers)
- Explicitly authorized by you

### Children's Privacy
Our service is not intended for users under 13 years of age. We do not knowingly collect information from children.

### Changes to Privacy Notice
We may update this privacy notice periodically. Users will be notified of significant changes through our platform.

### Contact Us
For privacy-related inquiries or concerns, please contact our Privacy Team at:
wzfh520@gmail.com

By using our service, you agree to the terms outlined in this privacy notice.

## 隐私声明

最后更新：2025年03月27日

### 概述
我们致力于保护您的隐私并以透明和谨慎的方式处理您的数据。本隐私声明解释了当您使用我们的文本到图像转换服务时，我们如何收集、使用和保护您的信息。

### 我们收集的信息

#### 用户提供的内容
- 您提交用于图像转换的文本内容
- 选定的网页内容
- 自定义提示词和模板
- API 配置设置

#### 技术信息
- 浏览器类型和版本
- 操作系统
- 设备信息
- 使用统计和交互数据

### 我们如何使用您的信息

#### 核心服务功能
- 将文本转换为 SVG/HTML 图像
- 处理网页内容
- 生成自定义视觉输出
- 模板管理和自定义

#### 服务改进
- 提高转换准确性
- 改进模板设计
- 优化用户体验
- 分析使用模式以开发功能

### 数据保护

#### 安全措施
- 行业标准的数据传输加密
- 用户内容的安全存储
- 定期安全审计和更新
- 访问控制和身份验证协议

#### 数据保留
- 用户生成的内容仅为处理目的临时存储
- 转换后的图像在24小时后自动删除
- 自定义模板保留到用户账户删除为止

### 您的权利
- 访问您存储的信息
- 请求数据删除
- 选择退出分析
- 导出您的自定义模板和设置

### 第三方服务
除以下情况外，我们不会与第三方共享您的内容：
- 法律要求
- 服务运营所必需（例如，云存储提供商）
- 您明确授权

### 儿童隐私
我们的服务不适用于13岁以下的用户。我们不会故意收集儿童的信息。

### 隐私声明的变更
我们可能会定期更新此隐私声明。用户将通过我们的平台收到重大变更的通知。

### 联系我们
有关隐私相关的询问或疑虑，请联系我们的隐私团队：
wzfh520@gmail.com

使用我们的服务，即表示您同意本隐私声明中概述的条款。

## License

MIT License

## 许可证

MIT 许可证
