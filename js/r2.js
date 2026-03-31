/**
 * 画仓 - Cloudflare R2 存储对接模块
 * 实现 S3 兼容 API 的签名认证和文件读写
 */

const R2Client = {
    /**
     * 生成 AWS Signature Version 4 签名
     * @param {string} method - HTTP 方法
     * @param {string} path - 请求路径
     * @param {Object} headers - 请求头
     * @param {string} payloadHash - 请求体 SHA256 哈希
     * @returns {Object} 签名后的请求头
     */
    async signRequest(method, path, headers, payloadHash) {
        const now = new Date();
        const amzDate = now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
        const dateStamp = amzDate.substring(0, 8);
        
        const service = 's3';
        const region = R2_CONFIG.region;
        
        // 构造规范请求
        const canonicalHeaders = Object.keys(headers)
            .sort()
            .map(key => `${key.toLowerCase()}:${headers[key].trim()}\n`)
            .join('');
        const signedHeaders = Object.keys(headers)
            .sort()
            .map(key => key.toLowerCase())
            .join(';');
        
        const canonicalRequest = [
            method,
            path,
            '',
            canonicalHeaders,
            signedHeaders,
            payloadHash
        ].join('\n');
        
        // 构造待签名字符串
        const algorithm = 'AWS4-HMAC-SHA256';
        const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
        const canonicalRequestHash = await this.sha256(canonicalRequest);
        
        const stringToSign = [
            algorithm,
            amzDate,
            credentialScope,
            canonicalRequestHash
        ].join('\n');
        
        // 计算签名
        const kDate = await this.hmacSha256(`AWS4${R2_CONFIG.secretAccessKey}`, dateStamp);
        const kRegion = await this.hmacSha256(kDate, region);
        const kService = await this.hmacSha256(kRegion, service);
        const kSigning = await this.hmacSha256(kService, 'aws4_request');
        const signature = await this.hmacSha256Hex(kSigning, stringToSign);
        
        // 构造 Authorization 头
        const authorization = `${algorithm} Credential=${R2_CONFIG.accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
        
        return {
            ...headers,
            'Authorization': authorization,
            'X-Amz-Date': amzDate
        };
    },
    
    /**
     * SHA256 哈希
     * @param {string} data - 待哈希数据
     * @returns {Promise<string>} 哈希值（十六进制）
     */
    async sha256(data) {
        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(data);
        const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
        return this.arrayBufferToHex(hashBuffer);
    },
    
    /**
     * HMAC-SHA256
     * @param {string|ArrayBuffer} key - 密钥
     * @param {string} data - 数据
     * @returns {Promise<ArrayBuffer>} HMAC 结果
     */
    async hmacSha256(key, data) {
        const encoder = new TextEncoder();
        const keyBuffer = typeof key === 'string' ? encoder.encode(key) : key;
        const dataBuffer = encoder.encode(data);
        
        const cryptoKey = await crypto.subtle.importKey(
            'raw',
            keyBuffer,
            { name: 'HMAC', hash: 'SHA-256' },
            false,
            ['sign']
        );
        
        return crypto.subtle.sign('HMAC', cryptoKey, dataBuffer);
    },
    
    /**
     * HMAC-SHA256 返回十六进制字符串
     * @param {string|ArrayBuffer} key - 密钥
     * @param {string} data - 数据
     * @returns {Promise<string>} HMAC 结果（十六进制）
     */
    async hmacSha256Hex(key, data) {
        const result = await this.hmacSha256(key, data);
        return this.arrayBufferToHex(result);
    },
    
    /**
     * ArrayBuffer 转十六进制字符串
     * @param {ArrayBuffer} buffer - 缓冲区
     * @returns {string} 十六进制字符串
     */
    arrayBufferToHex(buffer) {
        return Array.from(new Uint8Array(buffer))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    },
    
    /**
     * 获取文件的公开访问 URL
     * @param {string} key - 文件键名
     * @returns {string} 公开访问 URL
     */
    getPublicUrl(key) {
        return `${R2_CONFIG.publicUrl}/${key}`;
    },
    
    /**
     * 读取文件内容
     * @param {string} key - 文件键名
     * @returns {Promise<Response>} 响应对象
     */
    async getFile(key) {
        if (!key) {
            throw new Error('文件键名不能为空');
        }
        
        const method = 'GET';
        const path = `/${R2_CONFIG.bucketName}/${key}`;
        const url = `${R2_CONFIG.endpoint}${path}`;
        
        try {
            const headers = {
                'Host': new URL(R2_CONFIG.endpoint).host
            };
            
            const signedHeaders = await this.signRequest(method, path, headers, await this.sha256(''));
            
            const response = await fetch(url, {
                method,
                headers: signedHeaders
            });
            
            if (!response.ok) {
                throw new Error(`读取文件失败: ${response.status} ${response.statusText}`);
            }
            
            return response;
        } catch (error) {
            if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
                throw new Error('网络连接失败，请检查网络设置');
            }
            throw error;
        }
    },
    
    /**
     * 读取 JSON 文件
     * @param {string} key - 文件键名
     * @returns {Promise<Object>} JSON 对象
     */
    async getJson(key) {
        const response = await this.getFile(key);
        return response.json();
    },
    
    /**
     * 获取图片 URL（优先使用公开访问）
     * @param {string} key - 文件键名
     * @returns {string} 图片 URL
     */
    getImageUrl(key) {
        // 如果配置了公开访问域名，直接返回公开 URL
        if (R2_CONFIG.publicUrl) {
            return this.getPublicUrl(key);
        }
        // 否则需要通过签名 URL 访问
        return this.getSignedUrl(key);
    },
    
    /**
     * 获取签名 URL（用于私有访问）
     * @param {string} key - 文件键名
     * @param {number} expiresIn - 过期时间（秒）
     * @returns {string} 签名 URL
     */
    getSignedUrl(key, expiresIn = 3600) {
        const method = 'GET';
        const path = `/${R2_CONFIG.bucketName}/${key}`;
        const now = new Date();
        const amzDate = now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
        const dateStamp = amzDate.substring(0, 8);
        
        // 构造签名（简化版，实际生产环境需要完整签名）
        const expires = Math.floor(expiresIn);
        const credential = `${R2_CONFIG.accessKeyId}/${dateStamp}/${R2_CONFIG.region}/s3/aws4_request`;
        
        return `${R2_CONFIG.endpoint}${path}?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=${encodeURIComponent(credential)}&X-Amz-Date=${amzDate}&X-Amz-Expires=${expires}&X-Amz-SignedHeaders=host`;
    },
    
    /**
     * 上传文件
     * @param {string} key - 文件键名
     * @param {Blob|File|ArrayBuffer|string} data - 文件数据
     * @param {string} contentType - 内容类型
     * @returns {Promise<boolean>} 是否成功
     */
    async uploadFile(key, data, contentType = 'application/octet-stream') {
        if (!key) {
            throw new Error('文件键名不能为空');
        }
        if (!data) {
            throw new Error('文件数据不能为空');
        }
        
        const method = 'PUT';
        const path = `/${R2_CONFIG.bucketName}/${key}`;
        const url = `${R2_CONFIG.endpoint}${path}`;
        
        try {
            // 转换数据为 ArrayBuffer
            let body;
            if (data instanceof Blob || data instanceof File) {
                body = await data.arrayBuffer();
            } else if (typeof data === 'string') {
                body = new TextEncoder().encode(data);
            } else {
                body = data;
            }
            
            const bodyHash = await this.sha256ArrayBuffer(body);
            
            const headers = {
                'Host': new URL(R2_CONFIG.endpoint).host,
                'Content-Type': contentType,
                'X-Amz-Content-Sha256': bodyHash
            };
            
            const signedHeaders = await this.signRequest(method, path, headers, bodyHash);
            
            const response = await fetch(url, {
                method,
                headers: signedHeaders,
                body
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`上传文件失败: ${response.status} ${response.statusText}\n${errorText}`);
            }
            
            return true;
        } catch (error) {
            if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
                throw new Error('网络连接失败，请检查网络设置');
            }
            throw error;
        }
    },
    
    /**
     * SHA256 哈希 ArrayBuffer
     * @param {ArrayBuffer} data - 待哈希数据
     * @returns {Promise<string>} 哈希值（十六进制）
     */
    async sha256ArrayBuffer(data) {
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        return this.arrayBufferToHex(hashBuffer);
    },
    
    /**
     * 删除文件
     * @param {string} key - 文件键名
     * @returns {Promise<boolean>} 是否成功
     */
    async deleteFile(key) {
        const method = 'DELETE';
        const path = `/${R2_CONFIG.bucketName}/${key}`;
        const url = `${R2_CONFIG.endpoint}${path}`;
        
        const headers = {
            'Host': new URL(R2_CONFIG.endpoint).host
        };
        
        const signedHeaders = await this.signRequest(method, path, headers, await this.sha256(''));
        
        const response = await fetch(url, {
            method,
            headers: signedHeaders
        });
        
        if (!response.ok && response.status !== 204) {
            throw new Error(`删除文件失败: ${response.status} ${response.statusText}`);
        }
        
        return true;
    },
    
    /**
     * 读取索引文件
     * @returns {Promise<Array>} 图片索引数组
     */
    async getIndex() {
        try {
            const index = await this.getJson('index.json');
            return index || [];
        } catch (error) {
            console.warn('读取索引文件失败，返回空数组:', error);
            return [];
        }
    },
    
    /**
     * 更新索引文件
     * @param {Array} index - 图片索引数组
     * @returns {Promise<boolean>} 是否成功
     */
    async updateIndex(index) {
        const jsonStr = JSON.stringify(index, null, 2);
        return this.uploadFile('index.json', jsonStr, 'application/json');
    },
    
    /**
     * 生成唯一文件名
     * @param {string} originalName - 原始文件名
     * @returns {string} 唯一文件名
     */
    generateUniqueName(originalName) {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8);
        const ext = originalName.split('.').pop().toLowerCase();
        return `${timestamp}_${random}.${ext}`;
    }
};
