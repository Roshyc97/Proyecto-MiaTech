# 🎓 MI@TECH - English Assessment System

Sistema de evaluación de inglés basado en framework CEFR con inteligencia artificial.

---

## 📋 Requisitos Previos

- **Node.js** 20.x o superior
- **npm** (viene con Node.js)
- **Cuenta Google AI Studio** (para obtener API Key de Gemini)

---

## 🚀 Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/Roshyc97/Proyecto-MiaTech.git
cd Proyecto-MiaTech
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

**Copiar archivo de ejemplo:**

```bash
# Windows (PowerShell)
copy .env.example .env

# Linux/Mac
cp .env.example .env
```

**Editar archivo `.env` y agregar tu API Key:**

```env
PORT=3001
NODE_ENV=development
GEMINI_API_KEY=AIzaSy...tu_key_aqui
DATABASE_PATH=./db/miatech.db
CACHE_PATH=./cache/audios/
AUDIO_RETENTION=3600
LOG_PATH=./logs/
```

> **⚠️ IMPORTANTE:** Obtén tu API Key en https://aistudio.google.com/app/apikey

### 4. Iniciar servidor

**Desarrollo (con auto-reload):**

```bash
npm run dev
```

**Producción:**

```bash
npm start
```

### 5. Acceder a la aplicación

Abre tu navegador en:

http://localhost:3001

---

## 📁 Estructura del Proyecto

Proyecto-MiaTech/
├── index.html              # Interfaz principal
├── script.js               # Lógica del cliente
├── styles.css              # Estilos
├── server.js               # Servidor Express
├── package.json            # Dependencias
├── .env                    # Variables de entorno (NO subir a GitHub)
├── .env.example            # Plantilla de variables
├── .gitignore              # Archivos ignorados por Git
├── README.md               # Este archivo
├── img/                    # Imágenes de evaluación
│   ├── a1.png
│   ├── a2-1.png
│   ├── a2-2.png
│   └── b1.png
├── db/                     # Base de datos (creado automáticamente)
├── cache/audios/           # Cache de audios (creado automáticamente)
└── logs/                   # Logs del sistema (creado automáticamente)

> **Nota:** Las carpetas `db/`, `cache/`, y `logs/` se crean automáticamente al iniciar el servidor.

---

## 🔧 Variables de Entorno

| Variable | Descripción | Por Defecto | Requerido |
|----------|-------------|-------------|-----------|
| `PORT` | Puerto del servidor | 3001 | No |
| `NODE_ENV` | Entorno (development/production) | development | No |
| `GEMINI_API_KEY` | API Key de Google Gemini | - | **Sí** |
| `DATABASE_PATH` | Ruta de la base de datos | ./db/miatech.db | No |
| `CACHE_PATH` | Ruta del cache de audios | ./cache/audios/ | No |
| `AUDIO_RETENTION` | Tiempo de retención de audios (seg) | 3600 | No |
| `LOG_PATH` | Ruta de logs | ./logs/ | No |

---

## 🌐 Deployment

### **Render.com (Recomendado - Gratis)**

1. Conectar repositorio de GitHub
2. Configurar:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
3. Agregar variables de entorno:
   - `GEMINI_API_KEY`: Tu API Key
   - `NODE_ENV`: `production`
4. Deploy automático ✓

### **Servidor Local (Universidad)**

1. Instalar Node.js en el servidor
2. Clonar repositorio
3. Crear archivo `.env` con configuración
4. Ejecutar: `npm install && npm start`
5. Configurar Nginx como reverse proxy (opcional)
6. Configurar SSL con Let's Encrypt (opcional)

---

## 🛠️ Desarrollo

### Comandos disponibles:

```bash
# Desarrollo con auto-reload
npm run dev

# Producción
npm start

# Verificar salud del servidor
curl http://localhost:3001/health
```

### Logs:

- **Consola:** Todos los entornos
- **Archivo:** Solo en producción (carpeta `logs/`)

---

## 🔒 Seguridad

- ✅ API Key nunca expuesta en GitHub
- ✅ Inyección segura de API Key en cliente
- ✅ Variables de entorno en `.env`
- ✅ HTTPS automático en Render
- ✅ Validación de configuración al inicio

---

## 📦 Dependencias

```json
{
  "express": "^4.18.2",      // Framework web
  "dotenv": "^16.3.1"        // Variables de entorno
}
```

**Dev:**
```json
{
  "nodemon": "^3.0.1"        // Auto-reload en desarrollo
}
```

---

## 🐛 Solución de Problemas

### Error: "GEMINI_API_KEY is not configured"

**Solución:** Verifica que el archivo `.env` existe y tiene la API Key correcta.

### Error: "Cannot find module 'express'"

**Solución:** Ejecuta `npm install` para instalar dependencias.

### Puerto 3001 ya en uso

**Solución:** Cambia el puerto en `.env`:
```env
PORT=3002
```

### Aplicación no carga en navegador

**Solución:** Verifica que el servidor esté corriendo y accede a la URL correcta.

---

## 📄 Licencia

Este proyecto es parte de un proyecto de titulación universitario.

---

## 👨‍💻 Autor

**Andrés Roshyc**  
Instituto Tecnológico Superior Japón  
Proyecto de Titulación - 2026

---

## 🔗 Enlaces

- **Repositorio:** https://github.com/Roshyc97/Proyecto-MiaTech
- **Deployment:** https://proyecto-miatech.onrender.com
- **Google AI Studio:** https://aistudio.google.com/app/apikey