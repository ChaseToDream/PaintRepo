# 🎨 画仓

> 轻量级 AI 绘图作品展示网站，纯前端实现，支持一键部署到各类静态托管平台

## ✨ 特性

- 🚀 **纯前端实现** - 无后端依赖、无数据库，纯 HTML + CSS + JavaScript
- 📦 **轻量无编译** - 开箱即用，无需构建工具
- 🎨 **瀑布流布局** - 原生 CSS 实现，响应式适配
- 🌙 **深浅色主题** - 默认深色模式，一键切换
- ☁️ **Cloudflare R2** - 前端直传直读，无需服务器
- 📱 **响应式设计** - PC + 移动端全覆盖
- 🔧 **零配置部署** - 支持 GitHub Pages / Cloudflare Pages / 腾讯 EdgeOne

## 📁 项目结构

```
画仓/
├── index.html          # 首页（瀑布流展示）
├── detail.html         # 详情页（图片 + 参数）
├── upload.html         # 上传页（管理员专用）
├── css/
│   └── style.css       # 自定义样式
├── js/
│   ├── config.js       # 配置文件（R2 连接信息）
│   ├── r2.js           # R2 存储对接模块
│   └── main.js         # 核心逻辑
└── README.md           # 本文档
```

## 🚀 快速开始

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
   - **TTL**：可选，建议不设置
5. 点击 **创建 API 令牌**
6. **重要**：记录以下信息（只显示一次）：
   - Access Key ID
   - Secret Access Key
   - Endpoint URL（格式：`https://<account-id>.r2.cloudflarestorage.com`）

#### 1.3 配置公开访问（可选但推荐）

1. 进入创建的存储桶
2. 点击 **设置** 标签
3. 找到 **公开访问** 部分
4. 点击 **允许访问**
5. 记录生成的公开 URL（如 `https://pub-xxx.r2.dev`）
6. 或配置自定义域名：
   - 点击 **自定义域名**
   - 添加您的域名（如 `cdn.your-domain.com`）
   - 按提示配置 DNS 解析

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

> ⚠️ 生产环境建议将 `AllowedOrigins` 改为您的域名，如 `["https://your-domain.com"]`

### 2. 配置项目

1. 复制配置模板：
   ```bash
   cp js/config.example.js js/config.local.js
   ```

2. 编辑 `js/config.local.js` 文件，填写您的 R2 配置：

```javascript
const LOCAL_CONFIG = {
    bucketName: 'your-bucket-name',           // 存储桶名称
    endpoint: 'https://your-account-id.r2.cloudflarestorage.com',  // Endpoint
    accessKeyId: 'your-access-key-id',        // Access Key ID
    secretAccessKey: 'your-secret-access-key', // Secret Access Key
    publicUrl: 'https://your-bucket.your-domain.com',  // 公开访问 URL
    adminPassword: 'your-admin-password'      // 上传页面密码
};
```

### 3. 本地预览

直接用浏览器打开 `index.html` 即可预览，或使用本地服务器：

```bash
# 使用 Python
python -m http.server 8080

# 使用 Node.js
npx serve .

# 使用 PHP
php -S localhost:8080
```

## 📦 部署指南

### GitHub Pages

1. **创建 GitHub 仓库**
   - 登录 GitHub
   - 创建新仓库（如 `my-gallery`）

2. **上传代码**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/your-username/my-gallery.git
   git push -u origin main
   ```

3. **启用 GitHub Pages**
   - 进入仓库 **Settings** > **Pages**
   - Source 选择 `Deploy from a branch`
   - Branch 选择 `main`，目录选择 `/ (root)`
   - 点击 **Save**

4. **访问网站**
   - 等待部署完成（约 1-2 分钟）
   - 访问 `https://your-username.github.io/my-gallery`

### Cloudflare Pages

1. **连接 Git 仓库**
   - 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - 进入 **Workers & Pages** > **Create application**
   - 选择 **Pages** > **Connect to Git**
   - 授权并选择您的 GitHub 仓库

2. **配置构建设置**
   - **项目名称**：自定义
   - **生产分支**：main
   - **构建命令**：留空（无需构建）
   - **构建输出目录**：`/` 或留空

3. **部署**
   - 点击 **Save and Deploy**
   - 等待部署完成

4. **访问网站**
   - 部署成功后会自动分配域名
   - 格式：`https://your-project.pages.dev`
   - 也可绑定自定义域名

### 腾讯云 EdgeOne

1. **创建 EdgeOne 站点**
   - 登录 [腾讯云控制台](https://console.cloud.tencent.com/)
   - 进入 **EdgeOne** 产品
   - 创建站点，添加您的域名

2. **配置源站**
   - 选择 **对象存储源站**
   - 或选择 **静态资源托管**
   - 上传项目文件到对象存储

3. **配置规则**
   - 添加规则：所有请求转发到静态资源
   - 配置 HTTPS 证书

4. **访问网站**
   - 通过绑定的域名访问

> 💡 也可使用 EdgeOne Pages（类似 Cloudflare Pages）进行 Git 部署

## 🔒 安全建议

1. **API 密钥保护**
   - 不要将 `config.js` 提交到公开仓库
   - 建议使用 `.gitignore` 排除配置文件
   - 或使用环境变量（需要简单改造）

2. **密码安全**
   - 修改默认的管理员密码
   - 密码存储在 `sessionStorage`，关闭浏览器后失效

3. **CORS 配置**
   - 生产环境限制 `AllowedOrigins` 为您的域名
   - 避免使用 `*` 通配符

4. **R2 权限**
   - API 令牌仅授予必要权限
   - 限制令牌仅访问特定存储桶

## 🎯 功能说明

### 首页

- 瀑布流布局展示所有图片
- 图片懒加载优化
- 点击图片进入详情页
- 顶部导航栏：网站名称、上传入口、主题切换
- 底部版权信息

### 详情页

- 高清原图展示
- 完整 AI 生图参数：
  - 正向提示词 / 负向提示词
  - 模型名称 / 采样器 / 步数 / CFG Scale
  - 分辨率 / 种子数 / 批次信息 / VAE 等
- 返回首页按钮

### 上传页

- 简易密码验证
- 图片上传（支持 PNG/JPG/WebP）
- AI 生图参数表单
- 自动上传图片和参数 JSON 到 R2
- 自动更新索引文件

## 📝 R2 存储结构

```
your-bucket/
├── index.json          # 图片索引（首页读取）
├── uploads/            # 图片目录
│   ├── 1234567890_abc123.png
│   └── ...
└── params/             # 参数目录
    ├── 1234567890_abc123.json
    └── ...
```

### index.json 格式

```json
[
  {
    "name": "1234567890_abc123.png",
    "title": "作品标题",
    "uploadTime": "2024-01-01T00:00:00.000Z"
  }
]
```

### 参数 JSON 格式

```json
{
  "prompt": "正向提示词",
  "negativePrompt": "负向提示词",
  "model": "sd_xl_base_1.0",
  "sampler": "DPM++ 2M Karras",
  "steps": 30,
  "cfgScale": 7.5,
  "width": 1024,
  "height": 1024,
  "seed": "1234567890",
  "batchSize": 1,
  "vae": "sdxl_vae.safetensors",
  "clipSkip": 2
}
```

## 🛠️ 自定义

### 修改主题色

编辑 `css/style.css` 中的 CSS 变量：

```css
:root {
    --bg-primary: #0f172a;      /* 主背景色 */
    --bg-secondary: #1e293b;    /* 次背景色 */
    --bg-card: #334155;         /* 卡片背景色 */
    --text-primary: #f8fafc;    /* 主文字色 */
    --text-secondary: #94a3b8;  /* 次文字色 */
    --accent: #6366f1;          /* 强调色 */
    --border: #475569;          /* 边框色 */
}
```

### 修改瀑布流列数

编辑 `css/style.css` 中的媒体查询：

```css
.masonry-container {
    column-count: 4;  /* 默认 4 列 */
}

@media (max-width: 1200px) {
    .masonry-container { column-count: 3; }
}

@media (max-width: 768px) {
    .masonry-container { column-count: 2; }
}

@media (max-width: 480px) {
    .masonry-container { column-count: 1; }
}
```

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！
