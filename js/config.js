/**
 * 画仓 - 配置文件
 * 
 * 配置方式（按优先级）：
 * 1. URL 参数（最高优先级，用于测试）
 * 2. localStorage（持久化存储）
 * 3. 默认值（首次使用）
 * 
 * 首次使用：访问 upload.html 设置配置，或手动在浏览器控制台执行：
 * localStorage.setItem('gallery_config', JSON.stringify({...}))
 */

// 默认网站配置
const SITE_CONFIG = {
    name: '画仓',
    description: 'AI 绘图作品展示',
    copyright: '© 2024 画仓 All Rights Reserved'
};

// R2 配置
let R2_CONFIG = {
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
 * 从 URL 参数加载配置
 */
function loadConfigFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const configParam = params.get('config');
    
    if (configParam) {
        try {
            const config = JSON.parse(decodeURIComponent(configParam));
            if (config.bucketName) R2_CONFIG.bucketName = config.bucketName;
            if (config.endpoint) R2_CONFIG.endpoint = config.endpoint;
            if (config.accessKeyId) R2_CONFIG.accessKeyId = config.accessKeyId;
            if (config.secretAccessKey) R2_CONFIG.secretAccessKey = config.secretAccessKey;
            if (config.publicUrl) R2_CONFIG.publicUrl = config.publicUrl;
            if (config.adminPassword) ADMIN_PASSWORD = config.adminPassword;
            
            // 保存到 localStorage
            saveConfig();
            return true;
        } catch (e) {
            console.warn('URL 配置解析失败:', e);
        }
    }
    return false;
}

/**
 * 从 localStorage 加载配置
 */
function loadConfigFromStorage() {
    try {
        const saved = localStorage.getItem('gallery_config');
        if (saved) {
            const config = JSON.parse(saved);
            if (config.bucketName) R2_CONFIG.bucketName = config.bucketName;
            if (config.endpoint) R2_CONFIG.endpoint = config.endpoint;
            if (config.accessKeyId) R2_CONFIG.accessKeyId = config.accessKeyId;
            if (config.secretAccessKey) R2_CONFIG.secretAccessKey = config.secretAccessKey;
            if (config.publicUrl) R2_CONFIG.publicUrl = config.publicUrl;
            if (config.adminPassword) ADMIN_PASSWORD = config.adminPassword;
            return true;
        }
    } catch (e) {
        console.warn('localStorage 配置加载失败:', e);
    }
    return false;
}

/**
 * 保存配置到 localStorage
 */
function saveConfig() {
    try {
        localStorage.setItem('gallery_config', JSON.stringify({
            bucketName: R2_CONFIG.bucketName,
            endpoint: R2_CONFIG.endpoint,
            accessKeyId: R2_CONFIG.accessKeyId,
            secretAccessKey: R2_CONFIG.secretAccessKey,
            publicUrl: R2_CONFIG.publicUrl,
            adminPassword: ADMIN_PASSWORD
        }));
    } catch (e) {
        console.warn('配置保存失败:', e);
    }
}

/**
 * 清除配置
 */
function clearConfig() {
    localStorage.removeItem('gallery_config');
    R2_CONFIG = {
        bucketName: '',
        endpoint: '',
        accessKeyId: '',
        secretAccessKey: '',
        publicUrl: '',
        region: 'auto'
    };
    ADMIN_PASSWORD = '';
}

/**
 * 检查配置是否完整
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

/**
 * 初始化配置
 */
function initConfig() {
    // 优先从 URL 加载（用于一次性配置）
    if (!loadConfigFromUrl()) {
        // 其次从 localStorage 加载
        loadConfigFromStorage();
    }
}

// 自动初始化
initConfig();
