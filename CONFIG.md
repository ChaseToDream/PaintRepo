# Cloudflare R2 配置教程

本文档详细介绍如何配置 Cloudflare R2 存储服务，为画仓提供图片存储能力。

## 目录

- [创建 R2 Bucket](#创建-r2-bucket)
- [生成 API 密钥](#生成-api-密钥)
- [配置公开访问](#配置公开访问)
- [配置 CORS 策略](#配置-cors-策略)
- [配置存储结构](#配置存储结构)
- [更新网站配置](#更新网站配置)

---

## 创建 R2 Bucket

### 步骤 1：登录 Cloudflare Dashboard

1. 访问 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 登录你的 Cloudflare 账号

### 步骤 2：创建存储桶

1. 在左侧菜单中选择 **R2 对象存储**
2. 点击 **创建存储桶**
3. 填写配置信息：
   - **存储桶名称**：输入唯一名称（如 `my-gallery`）
   - **位置提示**：选择离你的用户最近的区域
4. 点击 **创建存储桶**

> **命名规则**：
>
> - 仅支持小写字母、数字、短横线
> - 必须唯一
> - 3-63 个字符

---

## 生成 API 密钥

### 步骤 1：进入 R2 API 令牌页面

1. 在 R2 对象存储概述页面
2. 点击右上角 **管理 R2 API 令牌**

### 步骤 2：创建 API 令牌

1. 点击 **创建 API 令牌**
2. 配置令牌信息：

| 配置项     | 推荐值          | 说明                  |
| ---------- | --------------- | --------------------- |
| 令牌名称   | `gallery-token` | 自定义名称便于识别    |
| 权限       | 对象读写        | 需要读取和写入        |
| 指定存储桶 | 选择你的存储桶  | 限制仅访问指定 Bucket |

3. 点击 **创建 API 令牌**

### 步骤 3：保存凭证

**重要**：创建后只显示一次，请立即保存以下信息：

- **Access Key ID**
- **Secret Access Key**
- **Endpoint URL**（格式：`https://<account-id>.r2.cloudflarestorage.com`）

---

## 配置公开访问

### 步骤 1：进入存储桶设置

1. 在 R2 对象存储页面
2. 点击你的存储桶名称
3. 进入 **设置** 标签页

### 步骤 2：启用公开访问

1. 找到 **公开访问** 部分
2. 点击 **允许访问**
3. 系统会生成一个公开访问 URL：
   - 格式：`https://pub-xxx.r2.dev`
   - 或自定义域名

### 步骤 3：记录公开 URL

保存这个公开 URL，后续需要填入网站配置。

---

## 配置 CORS 策略

CORS（跨域资源共享）配置允许浏览器从不同域名访问 R2 存储的资源。

### 步骤 1：进入 CORS 设置

1. 在存储桶 **设置** 页面
2. 找到 **CORS 策略** 部分
3. 点击 **添加 CORS 策略**

### 步骤 2：配置 CORS 规则

复制以下 JSON 配置：

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

### 配置说明

| 字段           | 说明                                     |
| -------------- | ---------------------------------------- |
| AllowedOrigins | 允许访问的域名，`*` 表示所有（开发环境） |
| AllowedMethods | 允许的 HTTP 方法                         |
| AllowedHeaders | 允许的请求头                             |
| ExposeHeaders  | 暴露给浏览器的响应头                     |
| MaxAgeSeconds  | 预检请求缓存时间                         |

> **生产环境建议**：将 `AllowedOrigins` 改为你的网站域名，如 `["https://gallery.example.com"]`

---

## 配置存储结构

R2 存储使用以下目录结构：

```
your-bucket/
├── index.json              # 图片索引文件
├── uploads/                # 图片存储目录
│   ├── image1.png
│   └── image2.jpg
└── params/                  # AI 参数存储目录
    ├── image1.json
    └── image2.json
```

### 创建目录结构

R2 不需要手动创建目录，上传文件时指定路径即可。

---

## 更新网站配置

### 配置参数对照表

| 参数            | 来源                | 示例值                                 |
| --------------- | ------------------- | -------------------------------------- |
| bucketName      | 存储桶名称          | `my-gallery`                           |
| endpoint        | R2 Endpoint         | `https://xxx.r2.cloudflarestorage.com` |
| accessKeyId     | API 令牌 Access Key | `xxxxx`                                |
| secretAccessKey | API 令牌 Secret Key | `xxxxx`                                |
| publicUrl       | 公开访问 URL        | `https://pub-xxx.r2.dev`               |
| adminPassword   | 上传页面密码        | `your-secure-password`                 |

### 首次配置

1. 部署网站后，访问 `upload.html`
2. 输入管理员密码（首次可任意设置）
3. 在配置表单中填写 R2 信息
4. 点击保存

配置将存储在浏览器 localStorage 中。

---

## 验证配置

### 测试读取

1. 打开首页 `index.html`
2. 检查控制台是否有错误
3. 如果有图片，应正常显示

### 测试上传

1. 访问 `upload.html`
2. 输入管理员密码
3. 上传一张测试图片
4. 填写 AI 参数
5. 提交上传
6. 返回首页检查是否显示

---

## 常见问题

**Q: Endpoint 是什么格式？**

格式：`https://<account-id>.r2.cloudflarestorage.com`

可以在 R2 概述页面找到完整的 S3 API 端点。

**Q: API 密钥丢失怎么办？**

只能删除旧令牌，重新创建一个新的。

**Q: CORS 配置错误会导致什么问题？**

- 图片无法显示
- 上传功能失败
- 控制台显示 CORS 错误

**Q: 如何限制仅自己的网站访问？**

将 CORS 的 `AllowedOrigins` 改为你的域名：

```json
{
  "AllowedOrigins": ["https://your-gallery.com"],
  ...
}
```

---

## 下一步

配置完成后，请阅读 [USAGE.md](USAGE.md) 了解如何使用画仓上传和管理图片。
