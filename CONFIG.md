# Cloudflare R2 配置教程

本文档详细介绍如何配置 Cloudflare R2 存储服务，为画仓提供图片存储和访问能力。

## 目录

- [准备工作](#准备工作)
- [创建 R2 Bucket](#创建-r2-bucket)
- [生成 API 密钥](#生成-api-密钥)
- [配置公开访问](#配置公开访问)
- [配置 CORS 策略](#配置-cors-策略)
- [配置网站](#配置网站)
- [验证配置](#验证配置)

---

## 准备工作

### 需要准备的内容

- Cloudflare 账号（免费即可）
- 一个 R2 Bucket 名称（需唯一，小写字母/数字/短横线）
- R2 存储用量（免费计划 10GB/月）

### 获取 Account ID

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 右上角点击头像 → 主页
3. 向下滚动找到 **Account ID**

---

## 创建 R2 Bucket

### 步骤 1：进入 R2 存储页面

1. 登录 Cloudflare Dashboard
2. 左侧菜单选择 **R2 对象存储**

### 步骤 2：创建存储桶

1. 点击 **创建存储桶**
2. 填写配置：

| 配置项 | 说明 | 示例 |
|--------|------|------|
| 存储桶名称 | 全局唯一，3-63字符 | `my-ai-gallery` |
| 位置提示 | 选择最近的区域 | 亚太（香港） |

> ⚠️ **命名规则**：
> - 仅支持小写字母、数字、短横线
> - 必须全局唯一
> - 创建后不可更改名称

3. 点击 **创建存储桶**

---

## 生成 API 密钥

### 步骤 1：进入 API 令牌页面

1. 在 R2 存储概述页面
2. 点击右上角 **管理 R2 API 令牌**

### 步骤 2：创建 API 令牌

1. 点击 **创建 API 令牌**
2. 选择模板：**编辑 Cloudflare R2 令牌**

3. 配置令牌权限：

| 配置项 | 推荐值 |
|--------|--------|
| 令牌名称 | `gallery-upload` |
| 权限 | 对象读写 |
| 指定存储桶 | 选择你的存储桶 |
| TTL | 永不过期（或自定义） |

4. 点击 **创建 API 令牌**

### 步骤 3：保存凭证 ⚠️ 重要

创建后页面**只显示一次**以下信息，请立即保存：

```
┌─────────────────────────────────────────┐
│  Access Key ID:                          │
│  xxxxxxxxxxxxxxxxxxxx                    │
│                                          │
│  Secret Access Key:                     │
│  xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx    │
│                                          │
│  S3 API 端点:                            │
│  https://xxxxxxxxxxxx.r2.cloudflarestorage.com │
└─────────────────────────────────────────┘
```

> 💡 **提示**：可以在 R2 概述页面找到完整的 S3 API 端点。

---

## 配置公开访问

### 步骤 1：进入存储桶设置

1. 在 R2 对象存储页面
2. 点击你的存储桶名称
3. 进入 **设置** 标签页

### 步骤 2：启用公开访问

1. 找到 **公开访问** 部分
2. 点击 **允许访问**
3. 系统生成公开访问 URL

### 步骤 3：记录公开 URL

保存公开访问 URL，格式如下：

```
https://pub-xxxxxxxxxxxx.r2.dev
```

或绑定自定义域名后使用：

```
https://gallery.your-domain.com
```

---

## 配置 CORS 策略

CORS（跨域资源共享）允许浏览器从网站直接访问 R2 资源。

### 步骤 1：进入 CORS 设置

1. 在存储桶 **设置** 页面
2. 找到 **CORS 策略** 部分
3. 点击 **添加 CORS 策略**

### 步骤 2：配置 CORS 规则

复制以下 JSON 配置：

```json
[
  {
    "AllowedOrigins": [
      "https://your-gallery.com",
      "https://*.github.io"
    ],
    "AllowedMethods": [
      "GET",
      "PUT",
      "POST",
      "DELETE",
      "HEAD"
    ],
    "AllowedHeaders": [
      "*"
    ],
    "ExposeHeaders": [
      "ETag"
    ],
    "MaxAgeSeconds": 3600
  }
]
```

### 配置说明

| 字段 | 说明 | 推荐值 |
|------|------|--------|
| AllowedOrigins | 允许访问的域名 | 你的网站域名 |
| AllowedMethods | 允许的 HTTP 方法 | GET, PUT, POST, DELETE, HEAD |
| AllowedHeaders | 允许的请求头 | * |
| ExposeHeaders | 暴露给浏览器的响应头 | ETag |
| MaxAgeSeconds | 预检请求缓存时间 | 3600（1小时） |

> ⚠️ **安全建议**：
> - 正式环境请将 `AllowedOrigins` 改为你的实际域名
> - 不要使用 `*`（允许所有域名）
> - GitHub Pages 域名格式：`https://username.github.io`

---

## 配置网站

### 配置参数对照表

| 参数 | 来源 | 示例值 |
|------|------|--------|
| Bucket 名称 | 存储桶名称 | `my-ai-gallery` |
| Endpoint | R2 概述页面 | `https://xxxx.r2.cloudflarestorage.com` |
| Access Key ID | API 令牌 | `xxxxxxxxxx` |
| Secret Access Key | API 令牌 | `xxxxxxxxxx` |
| 公开访问 URL | R2 设置 | `https://pub-xxxx.r2.dev` |
| 管理员密码 | 自定义 | `your-secure-password` |

### 首次配置步骤

1. 部署网站后访问 `upload.html`
2. 输入管理员密码（首次可任意设置）
3. 在配置表单中填写以上信息
4. 点击 **保存配置**

配置将自动保存到浏览器 localStorage 中。

---

## 验证配置

### 测试读取功能

1. 打开首页 `index.html`
2. 检查控制台（F12 → Console）是否有错误
3. 如果已上传图片，应正常显示在瀑布流中

### 测试上传功能

1. 访问 `upload.html`
2. 输入管理员密码登录
3. 上传一张测试图片（PNG/JPG/WebP）
4. 填写 ComfyUI 参数（至少填写正向提示词和模型）
5. 点击 **上传作品**
6. 返回首页检查图片是否显示

### 常见问题排查

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| 图片显示 404 | R2 未开启公开访问 | 检查存储桶设置 |
| 上传失败 | CORS 配置错误 | 确认 CORS 包含 PUT/POST |
| CORS 错误 | AllowedOrigins 不包含网站域名 | 修改 CORS 配置 |
| 认证失败 | API 密钥错误 | 检查并重新生成令牌 |

---

## 存储结构

R2 存储使用以下目录结构（自动创建）：

```
your-bucket/
├── index.json              # 图片索引文件（自动管理）
├── uploads/                # 图片存储目录
│   ├── 1711270400000_abc.png
│   └── 1711270500000_def.jpg
└── params/                 # ComfyUI 参数存储
    ├── 1711270400000_abc.png.json
    └── 1711270500000_def.jpg.json
```

---

## 下一步

配置完成后，请阅读 [USAGE.md](USAGE.md) 了解如何使用画仓上传和管理作品。
