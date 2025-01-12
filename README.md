

# Privacy Notice

Last Updated: January 12, 2025

## Overview
We are committed to protecting your privacy and handling your data with transparency and care. This privacy notice explains how we collect, use, and safeguard your information when you use our Text-to-Image conversion service.

## Information We Collect

### User-Provided Content
- Text content you submit for image conversion
- Selected webpage content
- Custom prompts and templates
- API configuration settings

### Technical Information
- Browser type and version
- Operating system
- Device information
- Usage statistics and interaction data

## How We Use Your Information

### Core Service Functionality
- Converting text to SVG images
- Processing webpage content
- Generating customized visual outputs
- Template management and customization

### Service Improvement
- Enhancing conversion accuracy
- Improving template designs
- Optimizing user experience
- Analyzing usage patterns for feature development

## Data Protection

### Security Measures
- Industry-standard encryption for data transmission
- Secure storage of user content
- Regular security audits and updates
- Access controls and authentication protocols

### Data Retention
- User-generated content is temporarily stored only for processing purposes
- Converted images are automatically deleted after 24 hours
- Custom templates are retained until user account deletion

## Your Rights
- Access your stored information
- Request data deletion
- Opt-out of analytics
- Export your custom templates and settings

## Third-Party Services
We do not share your content with third parties except when:
- Required by law
- Necessary for service operation (e.g., cloud storage providers)
- Explicitly authorized by you

## Children's Privacy
Our service is not intended for users under 13 years of age. We do not knowingly collect information from children.

## Changes to Privacy Notice
We may update this privacy notice periodically. Users will be notified of significant changes through our platform.

## Contact Us
For privacy-related inquiries or concerns, please contact our Privacy Team at:
wzfh520@gmail.com

By using our service, you agree to the terms outlined in this privacy notice.


# WenTuTu Chrome Extension

A powerful Chrome extension for converting text to beautiful SVG images instantly.

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right corner
3. Click "Load unpacked" and select this directory

## Project Structure

```
📦 wentutu-extension/
├── manifest.json        # Extension configuration
├── popup/
│   ├── popup.html      # Main popup interface
│   ├── popup.js        # Popup functionality
│   └── popup.css       # Popup styles
├── content/
│   ├── content.js      # Content script
│   └── content.css     # Content styles
├── background/
│   └── background.js   # Background service
├── templates/          # Built-in templates
│   ├── xiaohongshu.js # Social media cover template
│   ├── mindmap.js     # Mind map template
│   └── wordcloud.js   # Word cloud template
├── utils/
│   ├── api.js         # API utilities
│   └── converter.js   # Conversion utilities
└── images/            # Icon resources
```

## Core Features

### Quick Generate Mode
- Click extension icon and input text in popup
- Choose from built-in template styles
- Generate SVG images with one click

### Full Page Mode
- Right-click on any webpage and select "Convert Entire Page"
- Automatically extract and convert page content
- Generate comprehensive visual output

### Selection Mode
- Select text on any webpage
- Right-click and choose "Convert Selection"
- Transform selected text into beautiful images

## Development Guide

### Local Development
1. Clone the repository
2. Modify files as needed
3. Visit `chrome://extensions/` to reload the extension

### Template Development
1. Create new template in `templates` directory
2. Follow template development specifications
3. Register new template in `popup.js`

### API Configuration
1. Open extension options page
2. Configure API key and endpoints
3. Save settings

## Built-in Templates

- Social Media Cover Layout
  - Title and tag layout
  - Customizable background
  - Optimized for social sharing
- Mind Map/Logic Diagram
  - Hierarchical structure
  - Auto-layout algorithms
  - Multiple color schemes
- Word Cloud Generator
  - Dynamic text sizing
  - Custom shape containers
  - Color theme options

## Advanced Features

### API Customization
- Custom endpoint configuration
- Authentication management
- Rate limiting controls

## License

MIT License


   
