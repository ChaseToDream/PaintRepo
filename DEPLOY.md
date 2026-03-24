# 部署指南

本文档详细介绍如何将画仓部署到三大静态托管平台。

## 目录

- [GitHub Pages](#github-pages)
- [Cloudflare Pages](#cloudflare-pages)
- [腾讯云 EdgeOne](#腾讯云-edgeone)
- [部署后验证](#部署后验证)

---

## GitHub Pages

### 前置准备

- GitHub 账号
- 本地安装 Git

### 部署步骤

### 1. 创建 GitHub 仓库

1. 登录 [GitHub](https://github.com/)
2. 点击右上角 **+** → **New repository**
3. 填写仓库信息：
   - **Repository name**: `paint-repo`（或其他名称）
   - **Description**: AI 绘图作品展示
   - **Visibility**: Public（或 Private）
4. 点击 **Create repository**

### 2. 本地初始化

```bash
# 进入项目目录
cd paint-repo

# 初始化 Git（如果是新项目）
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit - 画仓"

# 添加远程仓库
git remote add origin https://github.com/your-username/paint-repo.git

# 推送
git branch -M main
git push -u origin main
```

### 3. 启用 GitHub Pages

1. 进入仓库 **Settings** 页面
2. 左侧菜单找到 **Pages**
3. **Source** 部分：
   - **Branch**: `main`
   - **Folder**: `/ (root)`
4. 点击 **Save**
5. 等待 1-2 分钟，页面自动启用

### 4. 访问网站

部署完成后，访问：`https://your-username.github.io/paint-repo/`

> 如果仓库名是 `your-username.github.io`，则直接访问 `https://your-username.github.io/`

### 自定义域名（可选）

1. 仓库 **Settings** → **Pages** → **Custom domain**
2. 输入你的域名（如 `gallery.example.com`）
3. 在你的 DNS 提供商添加 CNAME 记录：
   - **Type**: CNAME
   - **Name**: gallery
   - **Value**: your-username.github.io
4. 勾选 **Enforce HTTPS**

---

## Cloudflare Pages

### 前置准备

- Cloudflare 账号
- GitHub 仓库（用于连接）

### 部署步骤

### 1. 连接 GitHub

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Pages** 页面
3. 点击 **创建 Cloudflare Pages 项目**
4. 选择 **连接到 Git 提供商**
5. 选择 **GitHub** 并授权

### 2. 配置项目

1. 选择你的画仓仓库
2. 配置构建设置：
   - **项目名称**: paint-repo（或自定义）
   - **生产分支**: main
   - **构建命令**: （留空）
   - **构建输出目录**: /（根目录）
3. 点击 **保存并部署**

### 3. 等待部署

- Cloudflare 会自动检测无需构建的项目
- 部署通常在 30 秒内完成
- 可在 **部署** 页面查看日志

### 4. 访问网站

部署完成后，访问：`https://paint-repo.pages.dev/`

### 自定义域名（可选）

1. 在 **Pages** 项目设置中
2. 进入 **自定义域**
3. 点击 **设置自定义域**
4. 输入你的域名并验证

---

## 腾讯云 EdgeOne

### 前置准备

- 腾讯云账号
- 已开通 EdgeOne 服务
- 对象存储 COS Bucket

### 部署步骤

### 1. 上传文件到 COS

1. 登录 [腾讯云 COS 控制台](https://console.cloud.tencent.com/cos)
2. 选择或创建 Bucket
3. 进入 **文件列表**
4. 上传所有项目文件（index.html, css/, js/ 等）

### 2. 配置静态网站托管

1. 进入 Bucket 设置
2. 找到 **静态网站托管** 功能
3. 开启静态网站托管
4. 配置：
   - **索引文档**: index.html
   - **错误文档**: index.html（ SPA 模式）

### 3. 绑定自定义域名（可选）

1. 在 COS 控制台进入 **域名管理**
2. 点击 **添加域名**
3. 选择已备案的域名
4. 配置 CNAME 指向 COS 提供的域名

### 4. 配置 EdgeOne 加速

1. 登录 [腾讯云 EdgeOne 控制台](https://console.cloud.tencent.com/edgeone)
2. 选择站点或创建新站点
3. 添加你的自定义域名
4. 按提示配置 DNS

---

## 部署后验证

### 检查清单

- [ ] 网站可以正常打开
- [ ] 首页瀑布流正常显示
- [ ] 图片可以正常加载
- [ ] 点击图片能跳转到详情页
- [ ] 主题切换功能正常
- [ ] 上传页面可以访问

### 常见问题

**Q: 图片显示404？**

检查 R2 存储配置是否正确，确保 CORS 已配置。

**Q: 上传功能无法使用？**

确认 R2 的 CORS 配置包含 PUT/POST 方法。

**Q: HTTPS 证书问题？**

GitHub Pages 和 Cloudflare Pages 会自动配置 HTTPS。

---

## 下一步

部署完成后，请阅读 [CONFIG.md](CONFIG.md) 配置 Cloudflare R2 存储，然后就可以开始使用画仓了。

如需了解功能使用说明，请参阅 [USAGE.md](USAGE.md)。
