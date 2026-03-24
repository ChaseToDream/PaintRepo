/**
 * 画仓 - 核心逻辑模块
 * 包含瀑布流、懒加载、主题切换等核心功能
 */

const Gallery = {
    // 当前主题
    theme: 'dark',
    
    // 图片索引数据
    images: [],
    
    /**
     * 初始化应用
     */
    init() {
        this.loadTheme();
        this.setupThemeToggle();
    },
    
    /**
     * 加载主题设置
     */
    loadTheme() {
        const savedTheme = localStorage.getItem('gallery-theme');
        this.theme = savedTheme || 'dark';
        this.applyTheme(this.theme);
    },
    
    /**
     * 应用主题
     * @param {string} theme - 主题名称
     */
    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        this.theme = theme;
        localStorage.setItem('gallery-theme', theme);
        this.updateThemeIcon();
    },
    
    /**
     * 切换主题
     */
    toggleTheme() {
        const newTheme = this.theme === 'dark' ? 'light' : 'dark';
        this.applyTheme(newTheme);
    },
    
    /**
     * 更新主题图标
     */
    updateThemeIcon() {
        const icon = document.getElementById('theme-icon');
        if (icon) {
            icon.innerHTML = this.theme === 'dark' 
                ? '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>'
                : '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>';
        }
    },
    
    /**
     * 设置主题切换事件
     */
    setupThemeToggle() {
        const toggleBtn = document.getElementById('theme-toggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.toggleTheme());
        }
    },
    
    /**
     * 显示消息提示
     * @param {string} message - 消息内容
     * @param {string} type - 消息类型
     * @param {number} duration - 显示时长（毫秒）
     */
    showToast(message, type = 'info', duration = 3000) {
        // 移除已有的 toast
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        // 显示动画
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });
        
        // 自动隐藏
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }
};

/**
 * 首页模块
 */
const HomePage = {
    // 瀑布流容器
    container: null,
    
    // 图片观察器（懒加载）
    imageObserver: null,
    
    /**
     * 初始化首页
     */
    async init() {
        Gallery.init();
        this.container = document.getElementById('masonry-container');
        
        if (!this.container) return;
        
        this.setupLazyLoad();
        await this.loadImages();
    },
    
    /**
     * 设置懒加载
     */
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
                            img.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="%23334155" width="100" height="100"/><text x="50%" y="50%" fill="%2394a3b8" text-anchor="middle" dy=".3em">加载失败</text></svg>';
                            img.classList.add('loaded');
                        };
                        this.imageObserver.unobserve(img);
                    }
                }
            });
        }, {
            rootMargin: '100px'
        });
    },
    
    /**
     * 加载图片列表
     */
    async loadImages() {
        try {
            this.showLoading();
            Gallery.images = await R2Client.getIndex();
            this.renderImages();
        } catch (error) {
            console.error('加载图片列表失败:', error);
            Gallery.showToast('加载图片列表失败', 'error');
        } finally {
            this.hideLoading();
        }
    },
    
    /**
     * 渲染图片瀑布流
     */
    renderImages() {
        if (!this.container) return;
        
        this.container.innerHTML = '';
        
        if (Gallery.images.length === 0) {
            this.container.innerHTML = `
                <div style="column-span: all; text-align: center; padding: 60px 20px; color: var(--text-secondary);">
                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" style="margin: 0 auto 16px; opacity: 0.5;">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        <polyline points="21 15 16 10 5 21"></polyline>
                    </svg>
                    <p style="font-size: 16px; margin-bottom: 8px;">暂无图片</p>
                    <p style="font-size: 14px; opacity: 0.7;">前往上传页面添加您的第一张 AI 绘图作品</p>
                </div>
            `;
            return;
        }
        
        Gallery.images.forEach((image, index) => {
            const item = this.createImageCard(image, index);
            this.container.appendChild(item);
        });
    },
    
    /**
     * 创建图片卡片
     * @param {Object} image - 图片信息
     * @param {number} index - 索引
     * @returns {HTMLElement} 卡片元素
     */
    createImageCard(image, index) {
        const item = document.createElement('div');
        item.className = 'masonry-item';
        item.onclick = () => this.goToDetail(image.name);
        
        const imageUrl = R2Client.getImageUrl(`uploads/${image.name}`);
        
        item.innerHTML = `
            <img 
                data-src="${imageUrl}" 
                alt="${image.title || 'AI 绘图作品'}"
                loading="lazy"
            />
            <div class="loading-placeholder"></div>
        `;
        
        const img = item.querySelector('img');
        this.imageObserver.observe(img);
        
        // 图片加载完成后移除占位符
        img.onload = () => {
            img.classList.add('loaded');
            const placeholder = item.querySelector('.loading-placeholder');
            if (placeholder) placeholder.remove();
        };
        
        return item;
    },
    
    /**
     * 跳转到详情页
     * @param {string} name - 图片名称
     */
    goToDetail(name) {
        window.location.href = `detail.html?name=${encodeURIComponent(name)}`;
    },
    
    /**
     * 显示加载状态
     */
    showLoading() {
        if (!this.container) return;
        this.container.innerHTML = `
            <div style="column-span: all; text-align: center; padding: 60px 20px;">
                <div class="loading-placeholder" style="width: 60px; height: 60px; margin: 0 auto; border-radius: 50%;"></div>
                <p style="margin-top: 16px; color: var(--text-secondary);">加载中...</p>
            </div>
        `;
    },
    
    /**
     * 隐藏加载状态
     */
    hideLoading() {
        // 加载状态会在 renderImages 中被替换
    }
};

/**
 * 详情页模块
 */
const DetailPage = {
    // 图片名称
    imageName: null,
    
    /**
     * 初始化详情页
     */
    async init() {
        Gallery.init();
        this.imageName = this.getUrlParam('name');
        
        if (!this.imageName) {
            Gallery.showToast('缺少图片参数', 'error');
            setTimeout(() => window.location.href = 'index.html', 1500);
            return;
        }
        
        await this.loadDetail();
    },
    
    /**
     * 获取 URL 参数
     * @param {string} name - 参数名
     * @returns {string|null} 参数值
     */
    getUrlParam(name) {
        const params = new URLSearchParams(window.location.search);
        return params.get(name);
    },
    
    /**
     * 加载详情数据
     */
    async loadDetail() {
        try {
            // 加载图片
            const imageContainer = document.getElementById('image-container');
            if (imageContainer) {
                const imageUrl = R2Client.getImageUrl(`uploads/${this.imageName}`);
                imageContainer.innerHTML = `
                    <img 
                        src="${imageUrl}" 
                        alt="AI 绘图作品" 
                        class="detail-image"
                        onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22300%22><rect fill=%22%23334155%22 width=%22400%22 height=%22300%22/><text x=%2250%%22 y=%2250%%22 fill=%22%2394a3b8%22 text-anchor=%22middle%22 dy=%22.3em%22>图片加载失败</text></svg>'"
                    />
                `;
            }
            
            // 加载参数
            const paramsContainer = document.getElementById('params-container');
            if (paramsContainer) {
                paramsContainer.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 20px;">加载参数中...</p>';
                
                try {
                    const params = await R2Client.getJson(`params/${this.imageName}.json`);
                    this.renderParams(params, paramsContainer);
                } catch (error) {
                    paramsContainer.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 20px;">暂无参数信息</p>';
                }
            }
        } catch (error) {
            console.error('加载详情失败:', error);
            Gallery.showToast('加载详情失败', 'error');
        }
    },
    
    /**
     * 渲染参数信息
     * @param {Object} params - 参数对象
     * @param {HTMLElement} container - 容器元素
     */
    renderParams(params, container) {
        const fields = [
            { key: 'prompt', label: '正向提示词', class: 'prompt' },
            { key: 'negativePrompt', label: '负向提示词', class: 'prompt' },
            { key: 'model', label: '模型名称' },
            { key: 'sampler', label: '采样器' },
            { key: 'steps', label: '步数' },
            { key: 'cfgScale', label: 'CFG Scale' },
            { key: 'width', label: '宽度' },
            { key: 'height', label: '高度' },
            { key: 'seed', label: '种子数' },
            { key: 'batchSize', label: '批次大小' },
            { key: 'vae', label: 'VAE' },
            { key: 'clipSkip', label: 'CLIP Skip' },
            { key: 'denoisingStrength', label: '去噪强度' },
            { key: 'other', label: '其他参数', class: 'prompt' }
        ];
        
        let html = '';
        
        fields.forEach(field => {
            const value = params[field.key];
            if (value !== undefined && value !== null && value !== '') {
                html += `
                    <div class="param-card">
                        <div class="param-label">${field.label}</div>
                        <div class="param-value ${field.class || ''}">${this.escapeHtml(String(value))}</div>
                    </div>
                `;
            }
        });
        
        // 添加原始 JSON 展示
        html += `
            <div class="param-card">
                <div class="param-label">原始 JSON</div>
                <div class="param-value prompt" style="max-height: 200px; overflow-y: auto;">${this.escapeHtml(JSON.stringify(params, null, 2))}</div>
            </div>
        `;
        
        container.innerHTML = html || '<p style="color: var(--text-secondary); text-align: center; padding: 20px;">暂无参数信息</p>';
    },
    
    /**
     * HTML 转义
     * @param {string} text - 原始文本
     * @returns {string} 转义后文本
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

/**
 * 上传页模块
 */
const UploadPage = {
    // 是否已验证
    isAuthenticated: false,
    
    // 选择的文件
    selectedFile: null,
    
    /**
     * 初始化上传页
     */
    init() {
        Gallery.init();
        this.checkAuth();
    },
    
    /**
     * 检查认证状态
     */
    checkAuth() {
        const savedAuth = sessionStorage.getItem('gallery-auth');
        if (savedAuth === 'true') {
            this.isAuthenticated = true;
            this.showUploadForm();
        } else {
            this.showAuthForm();
        }
    },
    
    /**
     * 显示认证表单
     */
    showAuthForm() {
        const overlay = document.getElementById('auth-overlay');
        const form = document.getElementById('upload-form');
        
        if (overlay) overlay.style.display = 'flex';
        if (form) form.style.display = 'none';
    },
    
    /**
     * 显示上传表单
     */
    showUploadForm() {
        const overlay = document.getElementById('auth-overlay');
        const form = document.getElementById('upload-form');
        
        if (overlay) overlay.style.display = 'none';
        if (form) form.style.display = 'block';
        
        this.setupUploadForm();
    },
    
    /**
     * 验证密码
     */
    verifyPassword() {
        const passwordInput = document.getElementById('password-input');
        const errorText = document.getElementById('auth-error');
        
        if (!passwordInput) return;
        
        if (passwordInput.value === ADMIN_PASSWORD) {
            sessionStorage.setItem('gallery-auth', 'true');
            this.isAuthenticated = true;
            this.showUploadForm();
        } else {
            if (errorText) {
                errorText.textContent = '密码错误，请重试';
                errorText.style.display = 'block';
            }
            passwordInput.value = '';
        }
    },
    
    /**
     * 设置上传表单
     */
    setupUploadForm() {
        const fileInput = document.getElementById('file-input');
        const uploadArea = document.getElementById('upload-area');
        const form = document.getElementById('upload-form-element');
        
        if (!fileInput || !uploadArea || !form) return;
        
        // 文件选择
        fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        
        // 拖拽上传
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
        
        // 点击上传区域
        uploadArea.addEventListener('click', () => fileInput.click());
        
        // 表单提交
        form.addEventListener('submit', (e) => this.handleSubmit(e));
    },
    
    /**
     * 处理文件选择
     * @param {Event} e - 事件对象
     */
    handleFileSelect(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        // 验证文件类型
        const validTypes = ['image/png', 'image/jpeg', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            Gallery.showToast('仅支持 PNG、JPG、WebP 格式', 'error');
            return;
        }
        
        this.selectedFile = file;
        
        // 显示预览
        const preview = document.getElementById('file-preview');
        const nameDisplay = document.getElementById('file-name');
        
        if (preview && nameDisplay) {
            const reader = new FileReader();
            reader.onload = (e) => {
                preview.innerHTML = `<img src="${e.target.result}" alt="预览" style="max-width: 100%; max-height: 200px; border-radius: 8px;">`;
            };
            reader.readAsDataURL(file);
            nameDisplay.textContent = file.name;
        }
    },
    
    /**
     * 处理表单提交
     * @param {Event} e - 事件对象
     */
    async handleSubmit(e) {
        e.preventDefault();
        
        if (!this.selectedFile) {
            Gallery.showToast('请先选择图片文件', 'error');
            return;
        }
        
        const submitBtn = document.getElementById('submit-btn');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = '上传中...';
        }
        
        try {
            // 生成唯一文件名
            const uniqueName = R2Client.generateUniqueName(this.selectedFile.name);
            
            // 收集表单数据
            const formData = new FormData(e.target);
            const params = {
                prompt: formData.get('prompt'),
                negativePrompt: formData.get('negativePrompt'),
                model: formData.get('model'),
                sampler: formData.get('sampler'),
                steps: formData.get('steps') ? parseInt(formData.get('steps')) : null,
                cfgScale: formData.get('cfgScale') ? parseFloat(formData.get('cfgScale')) : null,
                width: formData.get('width') ? parseInt(formData.get('width')) : null,
                height: formData.get('height') ? parseInt(formData.get('height')) : null,
                seed: formData.get('seed'),
                batchSize: formData.get('batchSize') ? parseInt(formData.get('batchSize')) : null,
                vae: formData.get('vae'),
                clipSkip: formData.get('clipSkip') ? parseInt(formData.get('clipSkip')) : null,
                denoisingStrength: formData.get('denoisingStrength') ? parseFloat(formData.get('denoisingStrength')) : null,
                other: formData.get('other')
            };
            
            // 移除空值
            Object.keys(params).forEach(key => {
                if (params[key] === null || params[key] === '') {
                    delete params[key];
                }
            });
            
            // 上传图片
            Gallery.showToast('正在上传图片...', 'info');
            await R2Client.uploadFile(
                `uploads/${uniqueName}`,
                this.selectedFile,
                this.selectedFile.type
            );
            
            // 上传参数 JSON
            Gallery.showToast('正在上传参数...', 'info');
            await R2Client.uploadFile(
                `params/${uniqueName}.json`,
                JSON.stringify(params, null, 2),
                'application/json'
            );
            
            // 更新索引
            Gallery.showToast('正在更新索引...', 'info');
            const index = await R2Client.getIndex();
            index.unshift({
                name: uniqueName,
                title: formData.get('title') || '',
                uploadTime: new Date().toISOString()
            });
            await R2Client.updateIndex(index);
            
            Gallery.showToast('上传成功！', 'success');
            
            // 重置表单
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
                submitBtn.textContent = '上传';
            }
        }
    }
};
