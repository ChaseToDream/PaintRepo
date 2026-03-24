/**
 * 画仓 - 配置文件模板
 * 复制此文件为 config.local.js 并填写您的实际配置
 */

const LOCAL_CONFIG = {
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
    
    // 上传页面密码（简易鉴权，建议设置复杂密码）
    adminPassword: 'your-admin-password'
};
