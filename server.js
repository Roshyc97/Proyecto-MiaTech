// ==========================================
// MiaTech Server - Node.js + Express
// ==========================================

const express = require('express');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// CONFIGURACIÓN
// ==========================================

// Servir archivos estáticos (CSS, JS, imágenes) - EXCEPTO index.html
app.use((req, res, next) => {
    // Bloquear acceso directo a index.html
    if (req.path === '/index.html') {
        return res.redirect('/');
    }
    next();
});

app.use(express.static(__dirname, {
    index: false,  // No servir index.html automáticamente
    setHeaders: (res, filePath) => {
        // Configurar MIME types correctos
        if (filePath.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
        } else if (filePath.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css');
        }
    }
}));

// Parser para JSON
app.use(express.json());

// ==========================================
// RUTAS
// ==========================================

// Ruta principal - Sirve index.html con API Key inyectada
app.get('/', (req, res) => {
    const indexPath = path.join(__dirname, 'index.html');
    
    // Leer el archivo HTML
    fs.readFile(indexPath, 'utf8', (err, html) => {
        if (err) {
            console.error('❌ Error reading index.html:', err);
            return res.status(500).send('Error loading application');
        }
        

        // Inyectar API Key de forma segura
        const apiKey = process.env.GEMINI_API_KEY || '';
        console.log('🔑 API Key loaded (first 10 chars):', apiKey.substring(0, 10));
        console.log('🔑 API Key length:', apiKey.length);

        // Reemplazar placeholder simple
        const htmlWithKey = html.replace('PLACEHOLDER_API_KEY_HERE', apiKey);
        console.log('✅ API Key replacement attempted');

        // Verificar si se reemplazó
        if (htmlWithKey.includes('PLACEHOLDER_API_KEY_HERE')) {
            console.log('⚠️  WARNING: Placeholder still present after replacement');
        } else {
            console.log('✅ API Key injected successfully');
        }

        res.send(htmlWithKey);

    });
});

// Ruta de health check
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        service: 'MiaTech Assessment',
        timestamp: new Date().toISOString(),
        apiKeyConfigured: !!process.env.GEMINI_API_KEY
    });
});

// ==========================================
// MANEJO DE ERRORES
// ==========================================

// Ruta 404
app.use((req, res) => {
    res.status(404).send('Page not found');
});

// Errores generales
app.use((err, req, res, next) => {
    console.error('❌ Server error:', err);
    res.status(500).send('Internal server error');
});

// ==========================================
// INICIAR SERVIDOR
// ==========================================

app.listen(PORT, '0.0.0.0', () => {
    console.log('╔══════════════════════════════════════════╗');
    console.log('║   MiaTech English Assessment System     ║');
    console.log('╚══════════════════════════════════════════╝');
    console.log('');
    console.log(`✅ Server running on:`);
    console.log(`   - Local:   http://localhost:${PORT}`);
    console.log(`   - Network: http://YOUR_IP:${PORT}`);
    console.log('');
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🔑 API Key configured: ${process.env.GEMINI_API_KEY ? 'YES ✓' : 'NO ✗'}`);
    console.log('');
    console.log('Press Ctrl+C to stop');
    console.log('');
});

// Manejo de cierre graceful
process.on('SIGTERM', () => {
    console.log('\n⚠️  SIGTERM received, shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('\n⚠️  SIGINT received, shutting down gracefully...');
    process.exit(0);
});