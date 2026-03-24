# 画仓

> 轻量级 AI 绘图作品展示网站，纯前端实现，> 支持 GitHub Pages / Cloudflare Pages / 腾讯 EdgeOne 一键部署

## 特性

- **纯前端实现** - 无后端依赖、无数据库，纯 HTML + CSS + JavaScript
- **轻量无编译** - 开箱即用，无需构建工具
- **瀑布流布局** - 原生 CSS 实现，响应式适配
- **深浅色主题** - 默认深色模式，一键切换
- **Cloudflare R2** - 前端直传直读，无需服务器
- **响应式设计** - PC + 移动端全覆盖
- **零配置部署** - 直接上传即可运行

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
└── README.md           # 本文档
```

## 快速开始

### 1. 配置 Cloudflare R2

#### 1.1 创建 R2 Bucket

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **R2 对象存储** 页面
3. 点击 **创建存储桶**
4. 输入存储桶名称（如 `my-gallery`），选择位置提示
5. 点击 **创建存储桶**

#### 1.2 生成 API 密钥

1. 进入 **R2 概述** 页面
2. 点击右上角 **管理 R2 API 令牌**
3. 点击 **创建 API 令牌**
4. 配置如下：
   - **令牌名称**：自定义（如 `gallery-token`）
   - **权限**：对象读和写
   - **指定存储桶**：选择刚创建的存储桶
5. 点击 **创建 API 令牌**
6. **重要**：记录以下信息（只显示一次）：
   - Access Key ID
   - Secret Access Key
   - Endpoint URL（格式：`https://<account-id>.r2.cloudflarestorage.com`）

#### 1.3 配置公开访问（推荐）

1. 进入创建的存储桶
2. 点击 **设置** 标签
3. 找到 **公开访问** 部分
4. 点击 **允许访问**
5. 记录生成的公开 URL（如 `https://pub-xxx.r2.dev`）

#### 1.4 配置 CORS

1. 在存储桶 **设置** 页面
2. 找到 **CORS 策略** 部分
3. 点击 **添加 CORS 策略**
4. 粘贴以下配置：

```json
[
  {
    "AllowedOrigins": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

> 生产环境建议将 `AllowedOrigins` 改为您的域名

### 2. 部署项目

直接将项目文件上传到静态托管平台即可：

#### GitHub Pages

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/your-username/my-gallery.git
git push -u origin main
```

然后在 GitHub 仓库设置中启用 Pages。

#### Cloudflare Pages

1. 连接 Git 仓库
2. 构建命令留空
3. 输出目录为 `/`

#### 腾讯云 EdgeOne

上传项目文件到对象存储，配置静态网站托管。

### 3. 首次配置

部署后首次访问 `upload.html`，系统会自动引导您完成配置：

1. 输入任意密码进入（首次使用）
2. 填写 R2 配置信息
3. 保存配置

配置将存储在浏览器 localStorage 中，无需修改代码文件。

## 使用说明

### 首页

- 瀑布流布局展示所有图片
- 图片懒加载优化
- 点击图片进入详情页
- 右上角主题切换按钮

### 详情页

- 高清原图展示
- 完整 AI 生图参数
- 返回首页按钮

### 上传页

- 密码验证进入
- 图片上传（PNG/JPG/WebP）
- AI 生图参数表单
- 自动更新索引

## R2 存储结构

```
your-bucket/
├── index.json          # 图片索引
├── uploads/            # 图片目录
│   └── *.png
└── params/             # 参数目录
    └── *.json
```

## 安全建议

1. **API 密钥保护** - 配置存储在 localStorage，不会泄露到代码中
2. **密码安全** - 设置复杂的管理员密码
3. **CORS 配置** - 生产环境限制允许的域名
4. **R2 权限** - API 令牌仅授予必要权限

## 许可证

MIT License
