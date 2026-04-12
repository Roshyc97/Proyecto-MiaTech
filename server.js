// ============================================
// MI@TECH SERVER - PORTABLE VERSION
// ============================================

const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config();

// ============================================
// CONFIGURATION OBJECT (CENTRALIZED)
// ============================================

const config = {
    // Server
    port: process.env.PORT || 3001,
    nodeEnv: process.env.NODE_ENV || 'development',
    
    // API Keys
    geminiApiKey: process.env.GEMINI_API_KEY || '',
    
    // Paths (normalized for cross-platform compatibility)
    dbPath: path.normalize(process.env.DATABASE_PATH || './db/miatech.db'),
    cachePath: path.normalize(process.env.CACHE_PATH || './cache/audios/'),
    logPath: path.normalize(process.env.LOG_PATH || './logs/'),
    
    // Audio settings
    audioRetention: parseInt(process.env.AUDIO_RETENTION || '3600', 10),
    
    // SSL (optional, for production)
    sslKeyPath: process.env.SSL_KEY_PATH ? path.normalize(process.env.SSL_KEY_PATH) : null,
    sslCertPath: process.env.SSL_CERT_PATH ? path.normalize(process.env.SSL_CERT_PATH) : null
};

// ============================================
// VALIDATE CONFIGURATION
// ============================================

function validateConfig() {
    const errors = [];
    
    if (!config.geminiApiKey || config.geminiApiKey === 'your_api_key_here') {
        errors.push('❌ GEMINI_API_KEY is not configured in .env file');
    }
    
    if (errors.length > 0) {
        console.error('\n🚨 CONFIGURATION ERRORS:\n');
        errors.forEach(error => console.error(error));
        console.error('\n💡 Please check your .env file and try again.\n');
        process.exit(1);
    }
}

// ============================================
// CREATE REQUIRED DIRECTORIES
// ============================================

function ensureDirectories() {
    const directories = [
        path.dirname(config.dbPath),      // db/
        config.cachePath,                 // cache/audios/
        config.logPath                    // logs/
    ];
    
    directories.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            console.log(`✅ Created directory: ${dir}`);
        }
    });
}

// ============================================
// LOGGING UTILITY
// ============================================

function log(message, level = 'INFO') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level}] ${message}\n`;
    
    // Console output
    console.log(logMessage.trim());
    
    // File output (if in production or logs enabled)
    if (config.nodeEnv === 'production' || process.env.ENABLE_FILE_LOGS === 'true') {
        const logFile = path.join(config.logPath, `miatech-${new Date().toISOString().split('T')[0]}.log`);
        fs.appendFileSync(logFile, logMessage, 'utf8');
    }
}

// ============================================
// EXPRESS APP SETUP
// ============================================

const app = express();

// Middleware: Parse JSON
app.use(express.json());

// Middleware: Serve static files (excluding index.html)
app.use(express.static(path.join(__dirname), { index: false }));

// ============================================
// ROUTES
// ============================================

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        environment: config.nodeEnv,
        timestamp: new Date().toISOString(),
        apiKeyConfigured: !!config.geminiApiKey
    });
});

// Main route: Serve index.html with injected API key
app.get('/', (req, res) => {
    try {
        const indexPath = path.join(__dirname, 'index.html');
        
        if (!fs.existsSync(indexPath)) {
            log('index.html not found', 'ERROR');
            return res.status(404).send('Application files not found');
        }
        
        let html = fs.readFileSync(indexPath, 'utf-8');
        
        // Inject API Key securely
        html = html.replace(/PLACEHOLDER_API_KEY_HERE/g, config.geminiApiKey);
        
        res.send(html);
        
        log(`Served index.html with API Key injected (${req.ip})`);
        
    } catch (error) {
        log(`Error serving index.html: ${error.message}`, 'ERROR');
        res.status(500).send('Internal server error');
    }
});

// Catch-all route (404)
app.use((req, res) => {
    log(`404 - Route not found: ${req.path}`, 'WARN');
    res.status(404).send('Not Found');
});

// ============================================
// ERROR HANDLER
// ============================================

app.use((error, req, res, next) => {
    log(`Unhandled error: ${error.message}`, 'ERROR');
    console.error(error.stack);
    res.status(500).send('Internal Server Error');
});

// ============================================
// SERVER STARTUP
// ============================================

function startServer() {
    // Validate configuration
    validateConfig();
    
    // Ensure required directories exist
    ensureDirectories();
    
    // Start server
    app.listen(config.port, () => {
        console.log('\n' + '='.repeat(50));
        console.log('🚀 MI@TECH SERVER STARTED');
        console.log('='.repeat(50));
        console.log(`📍 Environment: ${config.nodeEnv}`);
        console.log(`🌐 Port: ${config.port}`);
        console.log(`🔑 API Key configured: ${config.geminiApiKey ? 'YES ✓' : 'NO ✗'}`);
        console.log(`📂 Database path: ${config.dbPath}`);
        console.log(`💾 Cache path: ${config.cachePath}`);
        console.log(`📝 Log path: ${config.logPath}`);
        console.log('='.repeat(50));
        console.log(`✅ Server running at: http://localhost:${config.port}`);
        console.log(`✅ Health check: http://localhost:${config.port}/health`);
        console.log('='.repeat(50) + '\n');
        
        log('Server started successfully');
    });
}

// ============================================
// GRACEFUL SHUTDOWN
// ============================================

process.on('SIGTERM', () => {
    log('SIGTERM received, shutting down gracefully...', 'INFO');
    process.exit(0);
});

process.on('SIGINT', () => {
    log('SIGINT received, shutting down gracefully...', 'INFO');
    process.exit(0);
});

// ============================================
// START APPLICATION
// ============================================

startServer();