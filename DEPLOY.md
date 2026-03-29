# 部署指南

本文档详细介绍如何将画仓部署到三大静态托管平台。

## 目录

- [部署前准备](#部署前准备)
- [GitHub Pages](#github-pages)
- [Cloudflare Pages](#cloudflare-pages)
- [腾讯云 EdgeOne](#腾讯云-edgeone)
- [部署后验证](#部署后验证)

---

## 部署前准备

### 必需的准备工作

1. **准备项目文件**
   - 下载或克隆画仓项目
   - 确保包含以下文件：
     ```
     ├── index.html
     ├── detail.html
     ├── upload.html
     ├── css/style.css
     ├── js/config.js
     ├── js/r2.js
     └── js/main.js
     ```

2. **准备 GitHub 仓库**（用于 GitHub Pages / Cloudflare Pages）
   - GitHub 账号
   - 本地安装 Git

3. **准备存储服务**
   - 参考 [CONFIG.md](CONFIG.md) 配置 Cloudflare R2

---

## GitHub Pages

### 方式一：手动部署

#### 步骤 1：创建仓库

1. 登录 [GitHub](https://github.com/)
2. 点击右上角 **+** → **New repository**
3. 填写信息：
   - Repository name: `paint-repo`
   - Description: AI 创作画廊
   - Visibility: Public / Private 均可
4. 点击 **Create repository**

#### 步骤 2：上传文件

1. 在仓库页面点击 **uploading an existing file**
2. 将项目所有文件拖拽到上传区域
3. 点击 **Commit changes**

#### 步骤 3：启用 Pages

1. 进入仓库 **Settings**
2. 左侧菜单选择 **Pages**
3. **Build and deployment**：
   - Source: **Deploy from a branch**
   - Branch: `main` / `/ (root)`
4. 点击 **Save**
5. 等待 1-2 分钟部署完成

#### 步骤 4：访问网站

```
https://your-username.github.io/paint-repo/
```

> 💡 如果仓库名是 `your-username.github.io`，则直接访问 `https://your-username.github.io/`

---

### 方式二：Git 命令行

```bash
# 1. 进入项目目录
cd paint-repo

# 2. 初始化 Git（如果是新下载的项目）
git init

# 3. 添加所有文件
git add .

# 4. 提交
git commit -m "Initial commit - 画仓 AI 画廊"

# 5. 添加远程仓库（替换为你的仓库地址）
git remote add origin https://github.com/your-username/paint-repo.git

# 6. 推送
git branch -M main
git push -u origin main
```

然后在 GitHub 仓库 Settings → Pages 中启用。

---

### 自定义域名（可选）

1. **仓库设置** → **Pages** → **Custom domain**
2. 输入你的域名（如 `gallery.example.com`）
3. **DNS 配置**：在你的域名服务商添加 CNAME 记录
   ```
   Type: CNAME
   Name: gallery
   Value: your-username.github.io
   ```
4. 勾选 **Enforce HTTPS**（自动申请 SSL 证书）

---

## Cloudflare Pages

### 方式一：Git 连接部署

#### 步骤 1：连接 GitHub

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Workers & Pages**
3. 点击 **创建应用程序**
4. 选择 **Pages** → **连接到 Git 提供商**
5. 选择 **GitHub** 并授权

#### 步骤 2：配置项目

1. 选择画仓仓库
2. 配置构建设置：

| 配置项 | 值 |
|--------|-----|
| 项目名称 | `paint-repo`（或自定义） |
| 生产分支 | `main` |
| 构建命令 | （留空） |
| 构建输出目录 | `/`（根目录） |

3. 点击 **保存并部署**

#### 步骤 3：等待部署

- Cloudflare 自动检测静态站点
- 部署通常在 30 秒内完成
- 可在 **部署** 页面查看构建日志

#### 步骤 4：访问网站

```
https://paint-repo.pages.dev/
```

---

### 方式二：直接上传

如果不想使用 Git：

1. 进入 **Pages** → **创建 Cloudflare Pages 项目**
2. 选择 **直接上传**
3. 压缩项目文件并上传
4. 设置生产分支后完成

---

### 自定义域名（可选）

1. 在 Pages 项目中进入 **自定义域**
2. 点击 **设置自定义域**
3. 输入你的域名
4. Cloudflare 自动配置 DNS 和 SSL

---

## 腾讯云 EdgeOne

### 前置要求

- 腾讯云账号
- 已开通 EdgeOne 服务
- 已创建对象存储 COS Bucket

### 步骤 1：上传文件到 COS

1. 登录 [腾讯云 COS 控制台](https://console.cloud.tencent.com/cos)
2. 选择或创建 Bucket
3. 进入 **文件列表**
4. 上传所有项目文件（index.html, css/, js/ 等）

### 步骤 2：配置静态网站托管

1. 进入 Bucket 设置
2. 找到 **静态网站托管**
3. 开启静态网站托管
4. 配置：

| 配置项 | 值 |
|--------|-----|
| 索引文档 | `index.html` |
| 错误文档 | `index.html` |

### 步骤 3：配置访问权限

1. 进入 **权限管理**
2. 设置 **公共读**
3. 或配置更细粒度的访问策略

### 步骤 4：绑定自定义域名（推荐）

1. 在 COS 控制台进入 **域名与传输管理**
2. 点击 **添加域名**
3. 选择已备案的域名
4. 按提示配置 CNAME

### 步骤 5：配置 EdgeOne 加速

1. 登录 [腾讯云 EdgeOne 控制台](https://console.cloud.tencent.com/edgeone)
2. 选择站点或创建新站点
3. 添加你的自定义域名
4. 按提示配置 DNS

---

## 部署后验证

### 检查清单

```
□ 网站可以正常打开
□ 首页瀑布流正常显示
□ 顶部显示统计栏（作品数、模型数、采样器数）
□ 图片可以正常加载
□ 点击图片能跳转到详情页
□ 详情页显示 ComfyUI 参数面板
□ 可以复制/下载参数
□ 主题切换功能正常
□ 上传页面可以访问并登录
```

### 常见问题排查

| 问题 | 可能原因 | 解决方案 |
|------|----------|----------|
| 页面 404 | 未正确部署 index.html | 检查 Pages/COS 配置 |
| 图片显示 404 | R2 未开启公开访问 | 参考 CONFIG.md 检查 |
| 上传失败 | CORS 配置错误 | 确认 CORS 包含 PUT/POST |
| 样式异常 | CSS 文件路径错误 | 检查文件部署位置 |
| HTTPS 错误 | 自定义域名未配置 SSL | 等待自动配置或手动申请 |

---

## 下一步

1. 配置 Cloudflare R2 存储 → [CONFIG.md](CONFIG.md)
2. 使用画仓上传和管理作品 → [USAGE.md](USAGE.md)
