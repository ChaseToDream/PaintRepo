# 画仓

> 轻量级 AI 绘图作品展示网站，纯前端实现，支持 GitHub Pages / Cloudflare Pages / 腾讯 EdgeOne 一键部署

## 特性

- **纯前端实现** - 无后端依赖、无数据库，纯 HTML + CSS + JavaScript
- **轻量无编译** - 开箱即用，无需构建工具
- **瀑布流布局** - 原生 CSS 实现，响应式适配
- **深浅色主题** - 默认深色模式，一键切换
- **Cloudflare R2** - 前端直传直读，无需服务器
- **响应式设计** - PC + 移动端全覆盖

## 快速开始

### 1. 配置 Cloudflare R2

详细配置教程请参阅 [CONFIG.md](CONFIG.md)：

- 创建 R2 Bucket
- 生成 API 密钥
- 配置公开访问
- 配置 CORS 策略

### 2. 部署项目

选择部署平台：

| 平台             | 部署方式 | 文档章节                                                   |
| ---------------- | -------- | ---------------------------------------------------------- |
| GitHub Pages     | Git 推送 | [DEPLOY.md - GitHub Pages](DEPLOY.md#github-pages)         |
| Cloudflare Pages | Git 连接 | [DEPLOY.md - Cloudflare Pages](DEPLOY.md#cloudflare-pages) |
| 腾讯云 EdgeOne   | 文件上传 | [DEPLOY.md - 腾讯云 EdgeOne](DEPLOY.md#腾讯云-edgeone)     |

### 3. 开始使用

部署完成后：

- **首页** (`index.html`) - 瀑布流展示 AI 绘图作品
- **详情页** (`detail.html?name=xxx`) - 查看高清原图和完整参数
- **上传页** (`upload.html`) - 管理员上传新作品

详细使用说明请参阅 [USAGE.md](USAGE.md)。

## 项目结构

```
画仓/
├── index.html          # 首页（瀑布流展示）
├── detail.html         # 详情页（图片 + 参数）
├── upload.html         # 上传页（管理员专用）
├── css/
│   └── style.css       # 自定义样式
├── js/
│   ├── config.js       # 配置文件
│   ├── r2.js           # R2 存储对接模块
│   └── main.js         # 核心逻辑
├── DEPLOY.md           # 部署指南
├── CONFIG.md           # 配置教程
├── USAGE.md            # 使用说明
└── README.md           # 本文档
```

## 文档导航

| 文档                   | 内容                       |
| ---------------------- | -------------------------- |
| [README.md](README.md) | 项目概述、快速开始         |
| [CONFIG.md](CONFIG.md) | Cloudflare R2 完整配置教程 |
| [DEPLOY.md](DEPLOY.md) | 三大平台部署详细指南       |
| [USAGE.md](USAGE.md)   | 功能使用说明、常见问题     |

## 技术栈

- HTML5 + CSS3 + JavaScript（原生实现）
- Tailwind CSS（CDN 引入）
- Cloudflare R2 S3 兼容 API

## 许可证

[GPL-3.0 License](LICENSE)
