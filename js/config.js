/**
 * 画仓 - Cloudflare R2 配置文件
 * 
 * 敏感配置从 config.local.js 读取
 * 首次使用请复制 config.example.js 为 config.local.js 并填写实际配置
 */

// 默认配置（非敏感信息）
const SITE_CONFIG = {
    name: '画仓',
    description: 'AI 绘图作品展示',
    copyright: '© 2024 画仓 All Rights Reserved'
};

// R2 配置（从本地配置文件加载）
const R2_CONFIG = {
    bucketName: '',
    endpoint: '',
    accessKeyId: '',
    secretAccessKey: '',
    publicUrl: '',
    region: 'auto'
};

// 管理员密码
let ADMIN_PASSWORD = '';

/**
 * 加载本地配置
 * @returns {boolean} 是否加载成功
 */
function loadLocalConfig() {
    if (typeof LOCAL_CONFIG !== 'undefined') {
        R2_CONFIG.bucketName = LOCAL_CONFIG.bucketName || '';
        R2_CONFIG.endpoint = LOCAL_CONFIG.endpoint || '';
        R2_CONFIG.accessKeyId = LOCAL_CONFIG.accessKeyId || '';
        R2_CONFIG.secretAccessKey = LOCAL_CONFIG.secretAccessKey || '';
        R2_CONFIG.publicUrl = LOCAL_CONFIG.publicUrl || '';
        ADMIN_PASSWORD = LOCAL_CONFIG.adminPassword || '';
        return true;
    }
    return false;
}

// 自动加载配置
loadLocalConfig();

/**
 * 检查配置是否完整
 * @returns {Object} 配置状态
 */
function checkConfig() {
    const missing = [];
    
    if (!R2_CONFIG.bucketName) missing.push('bucketName');
    if (!R2_CONFIG.endpoint) missing.push('endpoint');
    if (!R2_CONFIG.accessKeyId) missing.push('accessKeyId');
    if (!R2_CONFIG.secretAccessKey) missing.push('secretAccessKey');
    if (!ADMIN_PASSWORD) missing.push('adminPassword');
    
    return {
        valid: missing.length === 0,
        missing: missing
    };
}
