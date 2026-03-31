/**
 * 画仓 - AI 图片站点核心逻辑
 * 支持 ComfyUI 工作流参数展示
 */

// ========================================
// 全局共享模块
// ========================================
const Gallery = {
    theme: 'dark',
    images: [],
    paramsCache: new Map(), // 缓存参数数据

    init() {
        this.loadTheme();
        this.setupThemeToggle();
    },

    loadTheme() {
        const savedTheme = localStorage.getItem('gallery-theme');
        this.theme = savedTheme || 'dark';
        this.applyTheme(this.theme);
    },

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        this.theme = theme;
        localStorage.setItem('gallery-theme', theme);
        this.updateThemeIcon();
    },

    toggleTheme() {
        const newTheme = this.theme === 'dark' ? 'light' : 'dark';
        this.applyTheme(newTheme);
    },

    updateThemeIcon() {
        const icon = document.getElementById('theme-icon');
        if (icon) {
            if (this.theme === 'dark') {
                icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;
            } else {
                icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
            }
        }
    },

    setupThemeToggle() {
        const toggleBtn = document.getElementById('theme-toggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.toggleTheme());
        }
    },

    showToast(message, type = 'info', duration = 3000) {
        const existingToast = document.querySelector('.toast');
        if (existingToast) existingToast.remove();

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        requestAnimationFrame(() => toast.classList.add('show'));

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    },

    showConfigNotice() {
        const notice = document.createElement('div');
        notice.className = 'config-notice';
        notice.innerHTML = `
            <div class="config-notice-box">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="3"/>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                </svg>
                <h2>需要配置存储</h2>
                <p>请先配置 Cloudflare R2 存储信息，访问 <code>upload.html</code> 进行设置</p>
                <a href="upload.html" class="btn btn-primary" style="margin-top: 16px;">前往设置</a>
            </div>
        `;
        document.body.appendChild(notice);
    },

    // 复制到剪贴板
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            // 降级方案
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            const success = document.execCommand('copy');
            document.body.removeChild(textarea);
            return success;
        }
    },

    // 格式化日期
    formatDate(isoString) {
        if (!isoString) return '';
        const date = new Date(isoString);
        return date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
};

// ========================================
// 首页模块 - 瀑布流展示
// ========================================
const HomePage = {
    container: null,
    imageObserver: null,
    statsObserver: null,

    async init() {
        Gallery.init();
        this.container = document.getElementById('masonry-container');

        if (!this.container) return;

        // 检查配置
        const configStatus = checkConfig();
        if (!configStatus.valid) {
            Gallery.showConfigNotice();
            return;
        }

        this.setupLazyLoad();
        await this.loadImages();
        this.loadStats();
    },

    setupLazyLoad() {
        this.imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    const src = img.dataset.src;
                    if (src) {
                        img.src = src;
                        img.onload = () => img.classList.add('loaded');
                        img.onerror = () => {
                            img.src = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect fill="#12121a" width="200" height="200"/><text x="50%" y="50%" fill="#555566" text-anchor="middle" dy=".3em" font-size="12">加载失败</text></svg>');
                            img.classList.add('loaded');
                        };
                        this.imageObserver.unobserve(img);
                    }
                }
            });
        }, { rootMargin: '100px' });
    },

    async loadImages() {
        try {
            this.showLoading();
            Gallery.images = await R2Client.getIndex();
            // 倒序显示，最新的在前
            Gallery.images.sort((a, b) => new Date(b.uploadTime) - new Date(a.uploadTime));
            this.renderImages();
        } catch (error) {
            console.error('加载图片列表失败:', error);
            Gallery.showToast('加载图片列表失败', 'error');
            this.showEmpty();
        }
    },

    async loadStats() {
        // 更新统计
        const totalEl = document.getElementById('total-count');
        if (totalEl) {
            totalEl.textContent = Gallery.images.length;
        }

        // 统计模型和采样器（使用缓存）
        const models = new Set();
        const samplers = new Set();
        let loadedCount = 0;
        const maxParallel = 5; // 限制并发请求数

        // 分批加载，避免过多并发请求
        for (let i = 0; i < Gallery.images.length; i += maxParallel) {
            const batch = Gallery.images.slice(i, i + maxParallel);
            const promises = batch.map(async (img) => {
                try {
                    let params;
                    const cacheKey = `params/${img.name}.json`;
                    
                    // 检查缓存
                    if (Gallery.paramsCache.has(cacheKey)) {
                        params = Gallery.paramsCache.get(cacheKey);
                    } else {
                        params = await R2Client.getJson(cacheKey);
                        Gallery.paramsCache.set(cacheKey, params);
                    }
                    
                    if (params.model) models.add(params.model);
                    if (params.sampler) samplers.add(params.sampler);
                } catch (e) {
                    // 忽略单个加载失败
                }
            });
            
            await Promise.all(promises);
            loadedCount += batch.length;
            
            // 实时更新统计显示
            const modelsEl = document.getElementById('models-count');
            const samplersEl = document.getElementById('samplers-count');
            if (modelsEl) modelsEl.textContent = models.size;
            if (samplersEl) samplersEl.textContent = samplers.size;
        }
    },

    renderImages() {
        if (!this.container) return;

        this.container.innerHTML = '';

        if (Gallery.images.length === 0) {
            this.showEmpty();
            return;
        }

        Gallery.images.forEach((image, index) => {
            const item = this.createImageCard(image, index);
            this.container.appendChild(item);
        });
    },

    createImageCard(image, index) {
        const item = document.createElement('div');
        item.className = 'masonry-item';
        item.style.animationDelay = `${Math.min(index * 0.05, 0.5)}s`;
        item.onclick = () => window.location.href = `detail.html?name=${encodeURIComponent(image.name)}`;

        const imageUrl = R2Client.getImageUrl(`uploads/${image.name}`);

        item.innerHTML = `
            <img data-src="${imageUrl}" alt="${this.escapeHtml(image.title || 'AI 绘图作品')}" loading="lazy"/>
            <div class="card-info">
                ${image.title ? `<div class="card-title">${this.escapeHtml(image.title)}</div>` : ''}
                <div class="card-meta">
                    <span class="card-tag">
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                        </svg>
                        ComfyUI
                    </span>
                    <span>${Gallery.formatDate(image.uploadTime)}</span>
                </div>
            </div>
        `;

        const img = item.querySelector('img');
        this.imageObserver.observe(img);

        return item;
    },

    showLoading() {
        if (!this.container) return;
        const cols = window.innerWidth > 1500 ? 4 : window.innerWidth > 1024 ? 3 : window.innerWidth > 640 ? 2 : 1;
        let html = '';
        for (let i = 0; i < cols * 2; i++) {
            html += `<div class="loading-placeholder" style="min-height: ${200 + Math.random() * 150}px; margin-bottom: 20px;"></div>`;
        }
        this.container.innerHTML = html;
    },

    showEmpty() {
        if (!this.container) return;
        this.container.innerHTML = `
            <div class="empty-state">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                </svg>
                <h3>画廊空无一物</h3>
                <p>上传你的第一张 AI 创作，开启艺术之旅</p>
            </div>
        `;
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// ========================================
// 详情页模块 - ComfyUI 参数展示
// ========================================
const DetailPage = {
    imageName: null,
    currentParams: null,

    // ComfyUI 参数配置
    paramConfig: {
        // 核心参数组
        core: {
            title: '核心参数',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>',
            fields: [
                { key: 'model', label: '模型', icon: 'model' },
                { key: 'sampler', label: '采样器', icon: 'sampler' },
                { key: 'steps', label: '步数', icon: 'steps', type: 'number' },
                { key: 'cfgScale', label: 'CFG Scale', icon: 'cfg', type: 'number', decimals: 1 },
                { key: 'seed', label: '种子', icon: 'seed', type: 'seed' },
                { key: 'scheduler', label: '调度器', icon: 'scheduler' }
            ]
        },
        // 图像参数组
        image: {
            title: '图像设置',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>',
            fields: [
                { key: 'width', label: '宽度', icon: 'width', type: 'dimension' },
                { key: 'height', label: '高度', icon: 'height', type: 'dimension' },
                { key: 'batchSize', label: '批次大小', icon: 'batch' },
                { key: 'batchCount', label: '批次数量', icon: 'count' }
            ]
        },
        // 高级参数组
        advanced: {
            title: '高级设置',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>',
            fields: [
                { key: 'vae', label: 'VAE', icon: 'vae' },
                { key: 'clipSkip', label: 'CLIP Skip', icon: 'clip' },
                { key: 'denoisingStrength', label: '降噪强度', icon: 'denoise', type: 'percent' },
                { key: 'controlnet', label: 'ControlNet', icon: 'control' },
                { key: 'ipAdapter', label: 'IP-Adapter', icon: 'ip' },
                { key: 'lora', label: 'LoRA', icon: 'lora' }
            ]
        },
        // 提示词组
        prompts: {
            title: '提示词',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
            fields: [
                { key: 'prompt', label: '正向提示词', icon: 'positive', negative: false, type: 'prompt' },
                { key: 'negativePrompt', label: '负向提示词', icon: 'negative', negative: true, type: 'prompt' }
            ]
        },
        // 其他参数
        other: {
            title: '其他',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>',
            fields: [
                { key: 'other', label: '其他参数', icon: 'other', type: 'text' }
            ]
        }
    },

    async init() {
        Gallery.init();
        this.imageName = this.getUrlParam('name');

        if (!this.imageName) {
            Gallery.showToast('缺少图片参数', 'error');
            setTimeout(() => window.location.href = 'index.html', 1500);
            return;
        }

        // 检查配置
        const configStatus = checkConfig();
        if (!configStatus.valid) {
            Gallery.showConfigNotice();
            return;
        }

        await this.loadDetail();
    },

    getUrlParam(name) {
        const params = new URLSearchParams(window.location.search);
        return params.get(name);
    },

    async loadDetail() {
        try {
            const imageContainer = document.getElementById('image-container');
            if (imageContainer) {
                const imageUrl = R2Client.getImageUrl(`uploads/${this.imageName}`);
                imageContainer.innerHTML = `
                    <img src="${imageUrl}" alt="AI 绘图作品" class="detail-image"
                         onerror="this.src='data:image/svg+xml,' + encodeURIComponent('<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22300%22><rect fill=%22%2312121a%22 width=%22400%22 height=%22300%22/><text x=%2250%%22 y=%2250%%22 fill=%22%23555566%22 text-anchor=%22middle%22 dy=%22.3em%22>图片加载失败</text></svg>')"/>
                `;
            }

            const paramsContainer = document.getElementById('params-container');
            if (paramsContainer) {
                paramsContainer.innerHTML = '<div class="loading-placeholder" style="min-height: 200px;"></div>';

                try {
                    let params;
                    const cacheKey = `params/${this.imageName}.json`;
                    
                    // 检查缓存
                    if (Gallery.paramsCache.has(cacheKey)) {
                        params = Gallery.paramsCache.get(cacheKey);
                    } else {
                        params = await R2Client.getJson(cacheKey);
                        Gallery.paramsCache.set(cacheKey, params);
                    }
                    
                    this.currentParams = params;
                    this.renderParams(params, paramsContainer);
                } catch (error) {
                    console.warn('加载参数失败:', error);
                    paramsContainer.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 40px 20px;">暂无参数信息</p>';
                }
            }
        } catch (error) {
            console.error('加载详情失败:', error);
            Gallery.showToast('加载详情失败', 'error');
        }
    },

    renderParams(params, container) {
        let html = '';

        // 遍历所有参数组
        for (const [groupKey, group] of Object.entries(this.paramConfig)) {
            const hasContent = group.fields.some(f => {
                const value = params[f.key];
                return value !== undefined && value !== null && value !== '';
            });

            if (!hasContent) continue;

            html += `
                <div class="param-group">
                    <div class="param-group-title">
                        ${group.icon}
                        ${group.title}
                    </div>
                    <div class="params-grid ${groupKey === 'prompts' ? 'full-width' : ''}">
            `;

            for (const field of group.fields) {
                const value = params[field.key];
                if (value === undefined || value === null || value === '') continue;

                html += this.renderParamItem(field, value, params);
            }

            html += '</div></div>';
        }

        container.innerHTML = html || '<p style="color: var(--text-muted); text-align: center; padding: 40px 20px;">暂无参数信息</p>';
    },

    renderParamItem(field, value, allParams) {
        const isFullWidth = field.type === 'prompt' || field.type === 'text';
        const isNegative = field.negative;
        const isNumber = field.type === 'number' || field.type === 'dimension';

        let displayValue = value;
        let formattedValue = value;

        // 格式化数值
        if (field.decimals !== undefined && typeof value === 'number') {
            displayValue = value.toFixed(field.decimals);
        }
        if (field.type === 'percent' && typeof value === 'number') {
            displayValue = (value * 100).toFixed(1) + '%';
        }
        if (field.type === 'dimension' && typeof value === 'number') {
            displayValue = value + 'px';
        }
        if (field.type === 'seed' && typeof value === 'number') {
            displayValue = value.toLocaleString();
        }

        // 处理 LoRA 和 IP-Adapter（可能是数组或对象）
        if ((field.key === 'lora' || field.key === 'ipAdapter') && typeof value === 'object') {
            displayValue = JSON.stringify(value, null, 2);
        }

        return `
            <div class="param-item ${isFullWidth ? 'full' : ''} ${isNegative ? 'prompt negative' : ''} ${isNumber ? 'number' : ''}">
                <div class="param-label">
                    <span class="dot"></span>
                    ${field.label}
                    <button class="copy-btn" onclick="DetailPage.copyParam('${field.key}')" title="复制">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                        </svg>
                    </button>
                </div>
                <div class="param-value">${field.type === 'prompt' ? this.escapeHtml(String(value)) : this.escapeHtml(String(displayValue))}</div>
            </div>
        `;
    },

    // 复制单个参数
    copyParam(key) {
        if (!this.currentParams) return;
        const value = this.currentParams[key];
        if (value !== undefined) {
            Gallery.copyToClipboard(String(value));
            Gallery.showToast('已复制到剪贴板', 'success');
        }
    },

    // 复制全部参数
    copyAllParams() {
        if (!this.currentParams) return;
        Gallery.copyToClipboard(JSON.stringify(this.currentParams, null, 2));
        Gallery.showToast('全部参数已复制', 'success');
    },

    // 下载参数 JSON
    downloadParams() {
        if (!this.currentParams) return;
        const blob = new Blob([JSON.stringify(this.currentParams, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `params_${this.imageName}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        Gallery.showToast('参数已下载', 'success');
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// ========================================
// 上传页模块
// ========================================
const UploadPage = {
    isAuthenticated: false,
    selectedFile: null,

    init() {
        Gallery.init();
        this.checkAuth();
    },

    checkAuth() {
        const savedAuth = sessionStorage.getItem('gallery-auth');
        if (savedAuth === 'true') {
            this.isAuthenticated = true;
            this.showUploadForm();
        } else {
            this.showAuthForm();
        }
    },

    showAuthForm() {
        const overlay = document.getElementById('auth-overlay');
        const form = document.getElementById('upload-form');

        if (overlay) overlay.style.display = 'flex';
        if (form) form.style.display = 'none';
    },

    showUploadForm() {
        const overlay = document.getElementById('auth-overlay');
        const form = document.getElementById('upload-form');

        if (overlay) overlay.style.display = 'none';
        if (form) form.style.display = 'block';

        this.setupUploadForm();
        this.checkAndShowConfig();
    },

    checkAndShowConfig() {
        const configStatus = checkConfig();
        if (!configStatus.valid) {
            this.showConfigForm(configStatus.missing);
        }
    },

    showConfigForm(missing) {
        const container = document.querySelector('.upload-container');
        if (!container) return;

        const configHtml = `
            <div class="upload-header">
                <h1>配置存储连接</h1>
                <p>首次使用需要配置 Cloudflare R2 存储信息</p>
            </div>
            <div id="config-form">
                <div class="form-group">
                    <label class="form-label">Bucket 名称 *</label>
                    <input type="text" id="config-bucket" class="form-input" placeholder="your-bucket-name">
                </div>
                <div class="form-group">
                    <label class="form-label">Endpoint *</label>
                    <input type="text" id="config-endpoint" class="form-input" placeholder="https://your-account-id.r2.cloudflarestorage.com">
                </div>
                <div class="form-group">
                    <label class="form-label">Access Key ID *</label>
                    <input type="text" id="config-accessKey" class="form-input" placeholder="your-access-key-id">
                </div>
                <div class="form-group">
                    <label class="form-label">Secret Access Key *</label>
                    <input type="password" id="config-secretKey" class="form-input" placeholder="your-secret-access-key">
                </div>
                <div class="form-group">
                    <label class="form-label">公开访问 URL</label>
                    <input type="text" id="config-publicUrl" class="form-input" placeholder="https://your-bucket.your-domain.com">
                </div>
                <div class="form-group">
                    <label class="form-label">管理员密码 *</label>
                    <input type="password" id="config-password" class="form-input" placeholder="设置上传页面密码">
                </div>
                <div class="form-group" style="margin-top: 24px;">
                    <button type="button" onclick="UploadPage.saveConfigAndShowUpload()" class="btn btn-primary w-full" style="padding: 14px 24px; width: 100%;">
                        保存配置
                    </button>
                </div>
            </div>
        `;

        const uploadHeader = container.querySelector('.upload-header');
        const uploadForm = container.querySelector('form');

        if (uploadHeader) uploadHeader.outerHTML = configHtml;
        if (uploadForm) uploadForm.style.display = 'none';
    },

    saveConfigAndShowUpload() {
        const bucket = document.getElementById('config-bucket')?.value;
        const endpoint = document.getElementById('config-endpoint')?.value;
        const accessKey = document.getElementById('config-accessKey')?.value;
        const secretKey = document.getElementById('config-secretKey')?.value;
        const publicUrl = document.getElementById('config-publicUrl')?.value;
        const password = document.getElementById('config-password')?.value;

        if (!bucket || !endpoint || !accessKey || !secretKey || !password) {
            Gallery.showToast('请填写所有必填项', 'error');
            return;
        }

        R2_CONFIG.bucketName = bucket;
        R2_CONFIG.endpoint = endpoint;
        R2_CONFIG.accessKeyId = accessKey;
        R2_CONFIG.secretAccessKey = secretKey;
        R2_CONFIG.publicUrl = publicUrl || '';
        ADMIN_PASSWORD = password;

        saveConfig();
        Gallery.showToast('配置已保存', 'success');

        location.reload();
    },

    verifyPassword() {
        const passwordInput = document.getElementById('password-input');
        const errorText = document.getElementById('auth-error');

        if (!passwordInput) return;

        const configStatus = checkConfig();
        if (!configStatus.valid) {
            sessionStorage.setItem('gallery-auth', 'true');
            this.isAuthenticated = true;
            this.showUploadForm();
            return;
        }

        if (passwordInput.value === ADMIN_PASSWORD) {
            sessionStorage.setItem('gallery-auth', 'true');
            this.isAuthenticated = true;
            this.showUploadForm();
        } else {
            if (errorText) {
                errorText.style.display = 'block';
            }
            passwordInput.value = '';
        }
    },

    setupUploadForm() {
        const fileInput = document.getElementById('file-input');
        const uploadArea = document.getElementById('upload-area');
        const form = document.getElementById('upload-form-element');

        if (!fileInput || !uploadArea || !form) return;

        fileInput.addEventListener('change', (e) => this.handleFileSelect(e));

        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                fileInput.files = files;
                this.handleFileSelect({ target: fileInput });
            }
        });

        uploadArea.addEventListener('click', () => fileInput.click());

        form.addEventListener('submit', (e) => this.handleSubmit(e));
    },

    handleFileSelect(e) {
        const file = e.target.files[0];
        if (!file) return;

        const validTypes = ['image/png', 'image/jpeg', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            Gallery.showToast('仅支持 PNG、JPG、WebP 格式', 'error');
            return;
        }

        this.selectedFile = file;

        const preview = document.getElementById('file-preview');
        const nameDisplay = document.getElementById('file-name');

        if (preview && nameDisplay) {
            const reader = new FileReader();
            reader.onload = (e) => {
                preview.innerHTML = `<img src="${e.target.result}" alt="预览">`;
            };
            reader.readAsDataURL(file);
            nameDisplay.textContent = file.name;
        }
    },

    async handleSubmit(e) {
        e.preventDefault();

        if (!this.selectedFile) {
            Gallery.showToast('请先选择图片文件', 'error');
            return;
        }

        const submitBtn = document.getElementById('submit-btn');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span>上传中...</span>';
        }

        try {
            const uniqueName = R2Client.generateUniqueName(this.selectedFile.name);

            const formData = new FormData(e.target);
            const params = {
                prompt: formData.get('prompt'),
                negativePrompt: formData.get('negativePrompt'),
                model: formData.get('model'),
                sampler: formData.get('sampler'),
                scheduler: formData.get('scheduler'),
                steps: formData.get('steps') ? parseInt(formData.get('steps')) : null,
                cfgScale: formData.get('cfgScale') ? parseFloat(formData.get('cfgScale')) : null,
                width: formData.get('width') ? parseInt(formData.get('width')) : null,
                height: formData.get('height') ? parseInt(formData.get('height')) : null,
                seed: formData.get('seed') ? parseInt(formData.get('seed')) : null,
                batchSize: formData.get('batchSize') ? parseInt(formData.get('batchSize')) : null,
                batchCount: formData.get('batchCount') ? parseInt(formData.get('batchCount')) : null,
                vae: formData.get('vae'),
                clipSkip: formData.get('clipSkip') ? parseInt(formData.get('clipSkip')) : null,
                denoisingStrength: formData.get('denoisingStrength') ? parseFloat(formData.get('denoisingStrength')) : null,
                controlnet: formData.get('controlnet'),
                ipAdapter: formData.get('ipAdapter'),
                lora: formData.get('lora'),
                other: formData.get('other')
            };

            // 清理空值
            Object.keys(params).forEach(key => {
                if (params[key] === null || params[key] === '') {
                    delete params[key];
                }
            });

            Gallery.showToast('正在上传图片...', 'info');
            await R2Client.uploadFile(`uploads/${uniqueName}`, this.selectedFile, this.selectedFile.type);

            Gallery.showToast('正在上传参数...', 'info');
            await R2Client.uploadFile(`params/${uniqueName}.json`, JSON.stringify(params, null, 2), 'application/json');

            Gallery.showToast('正在更新索引...', 'info');
            const index = await R2Client.getIndex();
            index.unshift({
                name: uniqueName,
                title: formData.get('title') || '',
                uploadTime: new Date().toISOString()
            });
            await R2Client.updateIndex(index);

            Gallery.showToast('上传成功！', 'success');

            e.target.reset();
            this.selectedFile = null;
            document.getElementById('file-preview').innerHTML = '';
            document.getElementById('file-name').textContent = '';

        } catch (error) {
            console.error('上传失败:', error);
            Gallery.showToast(`上传失败: ${error.message}`, 'error');
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="17 8 12 3 7 8"/>
                        <line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                    上传作品
                `;
            }
        }
    }
};
