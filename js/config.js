/**
 * 画仓 - Cloudflare R2 配置文件
 * 请在此处填写您的 R2 存储配置信息
 */

const R2_CONFIG = {
    // R2 Bucket 名称
    bucketName: 'your-bucket-name',
    
    // R2 Endpoint（格式：https://<account-id>.r2.cloudflarestorage.com）
    endpoint: 'https://your-account-id.r2.cloudflarestorage.com',
    
    // Access Key ID（从 Cloudflare Dashboard 获取）
    accessKeyId: 'your-access-key-id',
    
    // Secret Access Key（从 Cloudflare Dashboard 获取）
    secretAccessKey: 'your-secret-access-key',
    
    // 公开访问域名（如果配置了 R2 公开访问或自定义域名）
    publicUrl: 'https://your-bucket.your-domain.com',
    
    // 区域（R2 通常使用 'auto'）
    region: 'auto'
};

// 上传页面密码（简易鉴权，建议部署前修改）
const ADMIN_PASSWORD = 'your-admin-password';

// 网站配置
const SITE_CONFIG = {
    name: '画仓',
    description: 'AI 绘图作品展示',
    copyright: '© 2024 画仓 All Rights Reserved'
};
