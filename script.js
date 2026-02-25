// ==========================================
// MiaTech English Assessment v3.2
// JavaScript completo - Listo para usar
// ==========================================

// ==========================================
// SECCIÓN 1: CONFIGURACIÓN Y DATOS
// ==========================================

// 1.1 - Datos de las imágenes
const PICTURES_DATA = {
    picture1: {
        level: "A1",
        task: "For this picture you must talk about the different activities people are doing, talk about what they are wearing, how they feel and describe all the objects you can see. The recording must be minimum 2 minutes and maximum 3 minutes.",
        imageUrl: "img/A1-1.png",
        minTime: 2,
        maxTime: 3
    },
    picture2: {
        level: "A2.1",
        task: "Look at the picture. Describe what you see. Where are the people? What are they doing? Would you like to work in a place like this? Why or why not? The recording must be minimum 2 minutes and maximum 4 minutes.",
        imageUrl: "img/A21-1.png",
        minTime: 2,
        maxTime: 4
    },
    picture3: {
        level: "A2.2",
        task: "For this picture you must talk about how important it is for friends spent time together, do you think going out with friends is always fun? How do you spend time with your friends? What activities do you do in your free time with your friends? Mention the differences between these two images. The recording must be minimum 3 minutes and maximum 5 minutes.",
        imageUrl: "img/A22_1.png",
        minTime: 3,
        maxTime: 5
    },
    picture4: {
        level: "B1",
        task: "For this picture you must talk about the sequence of the activities that people are doing in each box, describe each situation, and describe the most items as you can do it. The recording must be minimum 3 minutes and maximum 5 minutes.",
        imageUrl: "img/B1_1.png",
        minTime: 3,
        maxTime: 5
    }
};

// 1.2 - Detectar navegador
function detectBrowser() {
    const ua = navigator.userAgent;
    if (ua.indexOf("Edg") > -1) return "edge";
    if (ua.indexOf("Chrome") > -1) return "chrome";
    if (ua.indexOf("Firefox") > -1) return "firefox";
    return "other";
}

const BROWSER = detectBrowser();

// 1.3 - Mensajes del sistema
const MESSAGES = {
    greeting: "Hello {nombre}! I'm MiaTech", //it's a pleasure to have you here. I'll be your assistant and evaluator today.\n\nNow we'll begin the assessment. Please select one of the pictures below and complete the task according to the level.\n\nRemember to start with a personal introduction including your full name, age, city, profession, and hobbies, then describe the picture according to the instructions.\n\nGood luck!",
    confirmSelection: "Great choice, {nombre}! You selected Picture {num} (Level {level}).\n\nWhen you're ready, press the microphone button to start recording your response.",
    farewell: "Thank you for completing this assessment. Goodbye."
};

// 1.4 - Configuración global
const CONFIG = {
    apiKey: '', // ⚠️ AGREGAR TU API KEY DE GEMINI AQUÍ
    currentLanguage: 'en',
    isRecording: false,
    isSpeaking: false,
    recognition: null,
    synthesis: window.speechSynthesis,
    browser: BROWSER,
    voiceSettings: {
        speed: 0.8,
        pitch: 1.2,
        volume: 1.0
    },
    
    evaluacionIniciada: false,
    evaluacionActiva: true,
    pasoActual: 0,
    
    datosEvaluacion: {
        firstName: '',
        lastName: '',
        major: '',
        selectedPicture: null,
        selectedLevel: '',
        pictureTask: '',
        minTime: 0,
        maxTime: 0,
        recordingStartTime: null,
        recordingDuration: 0,
        fullTranscription: '',
        fechaInicio: '',
        calificacion: null,
        conversacionCompleta: []
    },
    
    intentosCalificacion: 0,
    maxIntentosAutomaticos: 3,
    reintentosManual: 0,
    maxReintentosManual: 3
};

// ==========================================
// SECCIÓN 2: INICIALIZACIÓN
// ==========================================

window.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 MiaTech Assessment v3.2');
    console.log('🌐 Browser:', BROWSER);
    
    CONFIG.recognition = initializeSpeechRecognition();
    
    if (CONFIG.synthesis.onvoiceschanged !== undefined) {
        CONFIG.synthesis.onvoiceschanged = loadVoices;
    }
    setTimeout(loadVoices, 1000);
    
    requestMicrophonePermission();
    generatePictureCards();
    
    CONFIG.datosEvaluacion.fechaInicio = new Date().toISOString();
});

function loadVoices() {
    const voices = CONFIG.synthesis.getVoices();
    if (voices.length > 0) {
        console.log('🎤 Voices loaded');
    }
}

function requestMicrophonePermission() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(() => {
                console.log('✅ Microphone permissions granted');
            })
            .catch((err) => {
                console.error('❌ Permissions denied:', err);
                alert('Please allow microphone access to perform the assessment.');
            });
    }
}

// ==========================================
// SECCIÓN 3: GENERACIÓN DE TARJETAS DE IMÁGENES
// ==========================================

function generatePictureCards() {
    const grid = document.getElementById('pictures-grid');
    
    Object.keys(PICTURES_DATA).forEach((key, index) => {
        const pic = PICTURES_DATA[key];
        const num = index + 1;
        
        const card = document.createElement('div');
        card.className = 'picture-card';
        card.id = `picture-card-${num}`;
        card.onclick = () => selectPicture(num);
        
        card.innerHTML = `
            <div class="picture-header">
                <div class="picture-level">Level: ${pic.level}</div>
                <div class="picture-duration">Duration: ${pic.minTime}-${pic.maxTime} min</div>
            </div>
            <div class="picture-task">${pic.task}</div>
            <div class="picture-radio">
                <input type="radio" name="picture" id="radio-${num}" value="${num}">
                <label for="radio-${num}">Select this picture</label>
            </div>
            <div class="picture-image-container">
                <img src="${pic.imageUrl}" alt="Picture ${num}" class="picture-image">
            </div>
        `;
        
        grid.appendChild(card);
    });
}

// ==========================================
// SECCIÓN 4: FORMULARIO DE ESTUDIANTE
// ==========================================

function submitStudentForm(event) {
    event.preventDefault();
    
    const firstName = document.getElementById('student-firstname').value.trim();
    const lastName = document.getElementById('student-lastname').value.trim();
    const major = document.getElementById('student-major').value.trim();
    
    let hasError = false;
    
    if (!firstName) {
        document.getElementById('student-firstname').classList.add('error');
        document.getElementById('error-firstname').classList.add('active');
        hasError = true;
    } else {
        document.getElementById('student-firstname').classList.remove('error');
        document.getElementById('error-firstname').classList.remove('active');
    }
    
    if (!lastName) {
        document.getElementById('student-lastname').classList.add('error');
        document.getElementById('error-lastname').classList.add('active');
        hasError = true;
    } else {
        document.getElementById('student-lastname').classList.remove('error');
        document.getElementById('error-lastname').classList.remove('active');
    }
    
    if (!major) {
        document.getElementById('student-major').classList.add('error');
        document.getElementById('error-major').classList.add('active');
        hasError = true;
    } else {
        document.getElementById('student-major').classList.remove('error');
        document.getElementById('error-major').classList.remove('active');
    }
    
    if (hasError) return;
    
    CONFIG.datosEvaluacion.firstName = firstName;
    CONFIG.datosEvaluacion.lastName = lastName;
    CONFIG.datosEvaluacion.major = major;
    
    console.log('✅ Student data saved:', { firstName, lastName, major });
    
    document.getElementById('student-form-modal').classList.remove('active');
    iniciarEvaluacionReal();
}

function iniciarEvaluacionReal() {
    CONFIG.evaluacionIniciada = true;
    CONFIG.pasoActual = 1;
    
    document.getElementById('btn-start').disabled = true;
    document.getElementById('btn-start').textContent = '⏳ Assessment in progress...';
    
    // Saludo personalizado PRIMERO
    const greeting = MESSAGES.greeting.replace('{nombre}', CONFIG.datosEvaluacion.firstName);
    addMessageToChat('assistant', greeting);
    updateCurrentResponse(greeting);
    speakText(greeting);
    
    // Mostrar selección de imágenes DESPUÉS de que termine de hablar
    const utterance = CONFIG.synthesis.getUtterances ? CONFIG.synthesis.getUtterances()[0] : null;
    
    // Calcular tiempo aproximado del saludo (palabras × 0.5 segundos)
    const palabras = greeting.split(' ').length;
    const tiempoEstimado = palabras * 500; // 500ms por palabra aproximadamente
    
    setTimeout(() => {
        document.getElementById('pictures-container').style.display = 'block';
        console.log('📸 Showing picture selection');
    }, tiempoEstimado);
}

// ==========================================
// SECCIÓN 5: SELECCIÓN DE IMAGEN
// ==========================================

let selectedPictureNum = null;

function selectPicture(num) {
    selectedPictureNum = num;
    
    document.querySelectorAll('.picture-card').forEach((card, index) => {
        if (index + 1 === num) {
            card.classList.add('selected');
            card.classList.remove('dimmed');
            document.getElementById(`radio-${num}`).checked = true;
        } else {
            card.classList.remove('selected');
            card.classList.add('dimmed');
        }
    });
    
    document.getElementById('btn-confirm').classList.add('active');
}

function confirmarSeleccion() {
    if (!selectedPictureNum) {
        alert('Please select a picture first');
        return;
    }
    
    const pictureKey = `picture${selectedPictureNum}`;
    const picData = PICTURES_DATA[pictureKey];
    
    CONFIG.datosEvaluacion.selectedPicture = selectedPictureNum;
    CONFIG.datosEvaluacion.selectedLevel = picData.level;
    CONFIG.datosEvaluacion.pictureTask = picData.task;
    CONFIG.datosEvaluacion.minTime = picData.minTime;
    CONFIG.datosEvaluacion.maxTime = picData.maxTime;
    
    // Ocultar imágenes no seleccionadas
    document.querySelectorAll('.picture-card').forEach((card, index) => {
        if (index + 1 !== selectedPictureNum) {
            card.classList.add('hidden');
        }
    });
    
    // Ocultar botón de confirmación
    document.getElementById('btn-confirm').classList.remove('active');
    
    // Mensaje del usuario en chat
    const selectionMsg = `I selected Picture ${selectedPictureNum} (Level ${picData.level})`;
    addMessageToChat('user', selectionMsg);
    
    // Confirmación de MiaTech
    const confirmation = MESSAGES.confirmSelection
        .replace('{nombre}', CONFIG.datosEvaluacion.firstName)
        .replace('{num}', selectedPictureNum)
        .replace('{level}', picData.level);
    
    addMessageToChat('assistant', confirmation);
    updateCurrentResponse(confirmation);
    speakText(confirmation);
    
    // Calcular tiempo del mensaje de confirmación
    const palabras = confirmation.split(' ').length;
    const tiempoEstimado = palabras * 500;
    
    // Mostrar controles DESPUÉS de que MiaTech termine de hablar
    setTimeout(() => {
        CONFIG.pasoActual = 2;
        
        // Ocultar contenedor de imágenes
        document.getElementById('pictures-container').style.display = 'none';
        
        // Mostrar información de la imagen seleccionada en current-response
        const taskInfo = `Selected: Picture ${selectedPictureNum} (Level ${picData.level})\n\n${picData.task}`;
        updateCurrentResponse(taskInfo);
        
        // Mostrar controles de grabación
        document.getElementById('recording-controls').style.display = 'flex';
        document.getElementById('mic-button').disabled = false;
        document.getElementById('transcription-container').style.display = 'block';
        
        // Actualizar temporizador
        document.getElementById('timer-required').textContent = 
            `Required: ${picData.minTime}-${picData.maxTime} min`;
        
        console.log('🎤 Recording controls enabled');
    }, tiempoEstimado);
}

// ==========================================
// SECCIÓN 6: SISTEMA DE VOZ
// ==========================================

function initializeSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
        alert('⚠️ Your browser does not support voice recognition.\n\nPlease use Google Chrome or Microsoft Edge.');
        return null;
    }
    
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    
    recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            
            if (event.results[i].isFinal) {
                finalTranscript += transcript + ' ';
            } else {
                interimTranscript += transcript;
            }
        }
        
        if (finalTranscript) {
            CONFIG.datosEvaluacion.fullTranscription += finalTranscript;
        }
        
        const displayText = CONFIG.datosEvaluacion.fullTranscription + interimTranscript;
        const textElement = document.getElementById('transcription-text');
        textElement.textContent = displayText || 'Start speaking to see your transcription here...';
        textElement.classList.toggle('transcription-empty', !displayText);
        textElement.scrollTop = textElement.scrollHeight;
    };
    
    recognition.onerror = (event) => {
        console.error('❌ Recognition error:', event.error);
    };
    
    recognition.onend = () => {
        console.log('🛑 Recognition ended');
        if (CONFIG.isRecording) {
            recognition.start();
        }
    };
    
    return recognition;
}

function speakText(text) {
    if (CONFIG.isSpeaking) {
        CONFIG.synthesis.cancel();
    }
    
    CONFIG.isSpeaking = true;
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = CONFIG.voiceSettings.speed;
    utterance.pitch = CONFIG.voiceSettings.pitch;
    utterance.volume = CONFIG.voiceSettings.volume;
    
    const voices = CONFIG.synthesis.getVoices();
    let voice = null;
    
    if (BROWSER === 'edge') {
        voice = voices.find(v => v.name.includes('Microsoft Jenny'));
        if (voice) {
            console.log('🎤 Voice: Microsoft Jenny (Edge)');
        }
    }
    
    if (!voice && BROWSER === 'chrome') {
        voice = voices.find(v => 
            v.name.includes('Google US English') || 
            v.name.includes('Google English') ||
            (v.lang.startsWith('en') && v.name.includes('Google'))
        );
        if (voice) {
            console.log('🎤 Voice: Google English (Chrome)');
        }
    }
    
    if (!voice) {
        voice = voices.find(v => v.lang.startsWith('en'));
        if (voice) {
            console.log('🎤 Fallback voice:', voice.name);
        }
    }
    
    if (voice) {
        utterance.voice = voice;
    }
    
    utterance.onstart = () => {
        document.getElementById('avatar-container').classList.add('speaking');
        
        const gif = document.getElementById('miatech-gif');
        if (gif) {
            const animatedSrc = gif.getAttribute('data-animated');
            gif.src = animatedSrc + '?t=' + new Date().getTime();
        }
    };
    
    utterance.onend = () => {
        document.getElementById('avatar-container').classList.remove('speaking');
        CONFIG.isSpeaking = false;
        
        const gif = document.getElementById('miatech-gif');
        if (gif) {
            const staticSrc = gif.getAttribute('data-static');
            gif.src = staticSrc;
        }
    };
    
    utterance.onerror = (event) => {
        console.error('❌ Synthesis error:', event);
        document.getElementById('avatar-container').classList.remove('speaking');
        CONFIG.isSpeaking = false;
        
        const gif = document.getElementById('miatech-gif');
        if (gif) {
            const staticSrc = gif.getAttribute('data-static');
            gif.src = staticSrc;
        }
    };
    
    CONFIG.synthesis.speak(utterance);
}

function toggleRecording() {
    if (!CONFIG.recognition) {
        alert('Speech recognition is not available');
        return;
    }
    
    if (CONFIG.isRecording) {
        stopRecording();
    } else {
        startRecording();
    }
}

function startRecording() {
    console.log('🎤 Starting recording...');
    
    CONFIG.isRecording = true;
    CONFIG.datosEvaluacion.recordingStartTime = Date.now();
    CONFIG.datosEvaluacion.fullTranscription = '';
    
    const micButton = document.getElementById('mic-button');
    micButton.classList.add('recording');
    
    const micIcon = document.getElementById('mic-icon');
    micIcon.innerHTML = `
        <div class="wave-container">
            <div class="wave-bar"></div>
            <div class="wave-bar"></div>
            <div class="wave-bar"></div>
            <div class="wave-bar"></div>
            <div class="wave-bar"></div>
        </div>
    `;
    
    try {
        CONFIG.recognition.start();
    } catch (e) {
        console.error('Error starting recognition:', e);
    }
    
    startTimer();
    
    setTimeout(() => {
        document.getElementById('btn-submit').disabled = false;
    }, 2000);
}

function stopRecording() {
    console.log('🛑 Stopping recording...');
    
    CONFIG.isRecording = false;
    
    if (CONFIG.recognition) {
        CONFIG.recognition.stop();
    }
    
    const endTime = Date.now();
    const duration = (endTime - CONFIG.datosEvaluacion.recordingStartTime) / 1000;
    CONFIG.datosEvaluacion.recordingDuration = Math.floor(duration);
    
    console.log(`⏱️ Recording duration: ${Math.floor(duration / 60)}:${(duration % 60).toFixed(0).padStart(2, '0')}`);
    
    const micButton = document.getElementById('mic-button');
    micButton.classList.remove('recording');
    
    const micIcon = document.getElementById('mic-icon');
    micIcon.innerHTML = `
        <svg width="35" height="35" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
            <line x1="12" y1="19" x2="12" y2="23"/>
            <line x1="8" y1="23" x2="16" y2="23"/>
        </svg>
    `;
    
    stopTimer();
}

// ==========================================
// SECCIÓN 7: TEMPORIZADOR
// ==========================================

let timerInterval = null;

function startTimer() {
    let seconds = 0;
    
    const timerDisplay = document.getElementById('timer-display');
    const timerCurrent = document.getElementById('timer-current');
    
    timerDisplay.classList.add('recording');
    timerCurrent.classList.add('recording');
    
    timerInterval = setInterval(() => {
        seconds++;
        updateTimerDisplay(seconds);
    }, 1000);
}

function updateTimerDisplay(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    
    const display = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    document.getElementById('timer-current').textContent = display;
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    const timerDisplay = document.getElementById('timer-display');
    const timerCurrent = document.getElementById('timer-current');
    
    timerDisplay.classList.remove('recording');
    timerCurrent.classList.remove('recording');
}

// ==========================================
// SECCIÓN 8: ENVÍO Y EVALUACIÓN
// ==========================================

function enviarRespuesta() {
    if (!CONFIG.datosEvaluacion.fullTranscription.trim()) {
        alert('Please record your response first');
        return;
    }
    
    console.log('📤 Sending response for evaluation...');
    
    document.getElementById('mic-button').disabled = true;
    document.getElementById('btn-submit').disabled = true;
    
    showSpinner('Generating your grade...');
    
    addMessageToChat('user', CONFIG.datosEvaluacion.fullTranscription);
    
    CONFIG.pasoActual = 3;
    generarCalificacionConReintentos();
}

async function generarCalificacionConReintentos() {
    CONFIG.intentosCalificacion = 0;
    
    for (let i = 1; i <= CONFIG.maxIntentosAutomaticos; i++) {
        CONFIG.intentosCalificacion++;
        console.log(`🔄 Automatic attempt ${i} of ${CONFIG.maxIntentosAutomaticos}`);
        
        const calificacion = await generarCalificacionCompleta();
        
        if (calificacion) {
            hideSpinner();
            mostrarCalificacionFinal(calificacion);
            return;
        }
        
        if (i < CONFIG.maxIntentosAutomaticos) {
            console.log('⏳ Waiting 2 seconds...');
            await esperar(2000);
        }
    }
    
    hideSpinner();
    console.log('❌ All 3 automatic attempts failed');
    mostrarModalError();
}

async function generarCalificacionCompleta() {
    if (!CONFIG.apiKey || CONFIG.apiKey === '') {
        console.log('⚠️ No API key configured');
        return null;
    }

    try {
        console.log('🤖 Calling Gemini AI with ResponseSchema...');
        
        const datos = CONFIG.datosEvaluacion;
        
        const prompt = `You are an expert English evaluator using the CEFR framework.

STUDENT INFORMATION:
- Name: ${datos.firstName} ${datos.lastName}
- Major: ${datos.major}
- Selected Picture: Picture ${datos.selectedPicture} (Level ${datos.selectedLevel})
- Task: "${datos.pictureTask}"
- Required Duration: ${datos.minTime}-${datos.maxTime} minutes
- Actual Duration: ${Math.floor(datos.recordingDuration / 60)}:${(datos.recordingDuration % 60).toString().padStart(2, '0')} minutes

STUDENT'S COMPLETE RESPONSE (Introduction + Image Description):
"${datos.fullTranscription}"

EVALUATION CRITERIA:
1. Personal Introduction (coherence, fluency, vocabulary)
2. Image Description:
   - Did they follow the task instructions?
   - Is the language level appropriate for ${datos.selectedLevel}?
   - Vocabulary range
   - Grammatical structures
   - Fluency and coherence
   - Task completion
3. Duration compliance (${Math.floor(datos.recordingDuration / 60)} min ${datos.recordingDuration % 60} sec vs ${datos.minTime}-${datos.maxTime} min required)

Provide:
- Overall CEFR level (A1, A2, B1, B2)
- Detailed feedback for each criterion
- Specific suggestions for improvement

${datos.recordingDuration < (datos.minTime * 60) ? "NOTE: Student did not meet minimum duration." : ""}

Be rigorous: Short responses = A1 or A2.`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${CONFIG.apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.5,
                    maxOutputTokens: 3500,
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: "object",
                        properties: {
                            nivel: { 
                                type: "string",
                                description: "Only A1, A2, B1 or B2"
                            },
                            complejidadLexica: { 
                                type: "string",
                                description: "Rating + description in 20 words"
                            },
                            estructuraGramatical: { 
                                type: "string",
                                description: "Rating + description in 20 words"
                            },
                            fluidez: { 
                                type: "string",
                                description: "Rating + description in 20 words"
                            },
                            extension: { 
                                type: "string",
                                description: "Rating + description in 20 words"
                            },
                            duracionCumplida: { 
                                type: "string",
                                description: "Comment about duration compliance"
                            },
                            consejo: { 
                                type: "string",
                                description: "2 short sentences (30 words total)"
                            }
                        },
                        required: ["nivel", "complejidadLexica", "estructuraGramatical", "fluidez", "extension", "duracionCumplida", "consejo"]
                    }
                }
            })
        });

        console.log('📥 Status:', response.status);

        if (!response.ok) {
            console.error(`❌ HTTP ${response.status}`);
            return null;
        }

        const data = await response.json();
        
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            let jsonText = data.candidates[0].content.parts[0].text.trim();
            
            console.log('📄 First 200 chars:', jsonText.substring(0, 200));
            console.log('📏 Length:', jsonText.length);
            
            try {
                const calificacion = JSON.parse(jsonText);
                console.log('✅ ResponseSchema worked. Level:', calificacion.nivel);
                return calificacion;
            } catch (parseError) {
                console.warn('⚠️ Parse failed, cleaning...');
                try {
                    const jsonLimpio = limpiarJSON(jsonText);
                    const calificacion = JSON.parse(jsonLimpio);
                    console.log('✅ Cleaning successful. Level:', calificacion.nivel);
                    return calificacion;
                } catch (cleanError) {
                    console.error('❌ Cleaning failed:', cleanError.message);
                    console.log('📄 Text:', jsonText);
                    return null;
                }
            }
        }
        
        console.error('❌ No content');
        return null;
        
    } catch (error) {
        console.error('❌ Error:', error);
        return null;
    }
}

function limpiarJSON(texto) {
    console.log('🧹 Cleaning JSON...');
    const inicio = texto.indexOf('{');
    const fin = texto.lastIndexOf('}') + 1;
    
    if (inicio === -1 || fin === 0) {
        throw new Error('JSON not found');
    }
    
    if (inicio > 0) console.log(`⚠️ Removing ${inicio} chars before`);
    if (fin < texto.length) console.log(`⚠️ Removing ${texto.length - fin} chars after`);
    
    return texto.substring(inicio, fin);
}

function mostrarCalificacionFinal(calificacion) {
    CONFIG.datosEvaluacion.calificacion = calificacion;
    
    const nombreFormal = CONFIG.datosEvaluacion.firstName;
    
    let respuestaFinal = `That's all, ${nombreFormal}. Your grading is:\n\n`;
    respuestaFinal += `Level ${calificacion.nivel}\n\n`;
    respuestaFinal += `- LEXICAL COMPLEXITY: ${calificacion.complejidadLexica}\n\n`;
    respuestaFinal += `- GRAMMATICAL STRUCTURE: ${calificacion.estructuraGramatical}\n\n`;
    respuestaFinal += `- FLUENCY AND COHERENCE: ${calificacion.fluidez}\n\n`;
    respuestaFinal += `- EXTENSION: ${calificacion.extension}\n\n`;
    respuestaFinal += `- DURATION: ${calificacion.duracionCumplida}\n\n`;
    respuestaFinal += `${calificacion.consejo}\n\n`;
    respuestaFinal += MESSAGES.farewell;
    
    addMessageToChat('assistant', respuestaFinal);
    updateCurrentResponse(respuestaFinal);
    speakText(respuestaFinal);
    
    setTimeout(() => {
        document.getElementById('download-button').classList.add('active');
    }, 2000);
}

function mostrarModalError() {
    document.getElementById('modal-error').classList.add('active');
}

function esperar(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ==========================================
// SECCIÓN 9: DESCARGA DE RESULTADOS
// ==========================================

function descargarResultados() {
    const datos = CONFIG.datosEvaluacion;
    const fecha = new Date();
    
    const opcionesFecha = { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
    };
    const fechaFormato = fecha.toLocaleString('en-US', opcionesFecha);
    
    let contenido = '';
    contenido += `${'='.repeat(65)}\n`;
    contenido += `           ENGLISH ASSESSMENT - MIATECH\n`;
    contenido += `${'='.repeat(65)}\n\n`;
    
    contenido += `STUDENT INFORMATION\n`;
    contenido += `${'-'.repeat(65)}\n`;
    contenido += `First Name: ${datos.firstName}\n`;
    contenido += `Last Name: ${datos.lastName}\n`;
    contenido += `Full Name: ${datos.firstName} ${datos.lastName}\n`;
    contenido += `Major/Program: ${datos.major}\n`;
    contenido += `Date: ${fechaFormato}\n`;
    contenido += `\n`;
    
    contenido += `ASSESSMENT DETAILS\n`;
    contenido += `${'-'.repeat(65)}\n`;
    contenido += `Selected Picture: Picture ${datos.selectedPicture} (Level ${datos.selectedLevel})\n`;
    contenido += `Required Duration: ${datos.minTime}-${datos.maxTime} minutes\n`;
    contenido += `Actual Duration: ${Math.floor(datos.recordingDuration / 60)}:${(datos.recordingDuration % 60).toString().padStart(2, '0')} minutes\n`;
    contenido += `Evaluator: MiaTech (AI)\n`;
    contenido += `Grading attempts: ${CONFIG.intentosCalificacion + CONFIG.reintentosManual}\n\n`;
    
    contenido += `${'='.repeat(65)}\n\n`;
    
    contenido += `PICTURE TASK\n`;
    contenido += `${'-'.repeat(65)}\n`;
    contenido += `${datos.pictureTask}\n\n`;
    
    contenido += `${'='.repeat(65)}\n\n`;
    
    contenido += `STUDENT'S RESPONSE (FULL TRANSCRIPTION)\n`;
    contenido += `${'-'.repeat(65)}\n`;
    contenido += `${datos.fullTranscription}\n\n`;
    
    contenido += `${'='.repeat(65)}\n\n`;
    
    if (datos.calificacion) {
        contenido += `FINAL GRADE\n`;
        contenido += `${'-'.repeat(65)}\n\n`;
        contenido += `LEVEL: ${datos.calificacion.nivel}\n\n`;
        contenido += `EVALUATED CRITERIA:\n\n`;
        contenido += `• LEXICAL COMPLEXITY (Vocabulary)\n`;
        contenido += `  ${datos.calificacion.complejidadLexica}\n\n`;
        contenido += `• GRAMMATICAL STRUCTURE\n`;
        contenido += `  ${datos.calificacion.estructuraGramatical}\n\n`;
        contenido += `• FLUENCY AND COHERENCE\n`;
        contenido += `  ${datos.calificacion.fluidez}\n\n`;
        contenido += `• EXTENSION\n`;
        contenido += `  ${datos.calificacion.extension}\n\n`;
        contenido += `• DURATION COMPLIANCE\n`;
        contenido += `  ${datos.calificacion.duracionCumplida}\n\n`;
        contenido += `${'-'.repeat(65)}\n\n`;
        contenido += `GENERAL FEEDBACK\n`;
        contenido += `${'-'.repeat(65)}\n`;
        contenido += `${datos.calificacion.consejo}\n\n`;
    } else {
        contenido += `⚠️ GRADE NOT AVAILABLE\n\n`;
        contenido += `Unable to generate automatic grade after\n`;
        contenido += `multiple attempts. Please contact your teacher\n`;
        contenido += `for a manual evaluation.\n\n`;
        contenido += `Attempts made: ${CONFIG.intentosCalificacion + CONFIG.reintentosManual}\n`;
        contenido += `Reason: Communication error with AI system\n\n`;
    }
    
    contenido += `${'='.repeat(65)}\n\n`;
    contenido += `COMPLETE CONVERSATION\n`;
    contenido += `${'-'.repeat(65)}\n\n`;
    
    datos.conversacionCompleta.forEach(msg => {
        const tiempo = new Date(msg.timestamp).toLocaleTimeString('en-US');
        const emisor = msg.role === 'user' ? 'User' : 'MiaTech';
        contenido += `[${tiempo}] ${emisor}:\n${msg.message}\n\n`;
    });
    
    contenido += `${'='.repeat(65)}\n`;
    contenido += `Generated by MiaTech English Assessment v3.2\n`;
    contenido += `Language Assessment System\n`;
    contenido += `University - Language Department\n`;
    contenido += `Repository email: roshyc97ia@gmail.com\n`;
    contenido += `${'='.repeat(65)}\n`;
    
    const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    const nombreArchivo = `assessment_${datos.firstName.toLowerCase()}_${datos.lastName.toLowerCase()}_${fecha.toISOString().split('T')[0]}.txt`;
    a.download = nombreArchivo;
    
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log('✅ File downloaded:', nombreArchivo);
    alert('✅ Results downloaded successfully.\n\nFile: ' + nombreArchivo);
}

function descargarSinCalificacion() {
    document.getElementById('modal-error').classList.remove('active');
    CONFIG.datosEvaluacion.calificacion = {
        nivel: 'Not available', 
        error: 'Unable to generate grade after multiple attempts'
    };
    descargarResultados();
}

// ==========================================
// SECCIÓN 10: FUNCIONES AUXILIARES
// ==========================================

function addMessageToChat(role, text) {
    const chatHistory = document.getElementById('chat-history');
    const chatEmpty = document.getElementById('chat-empty');
    
    if (chatEmpty) {
        chatEmpty.style.display = 'none';
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${role}`;
    
    const label = document.createElement('div');
    label.className = 'chat-message-label';
    label.textContent = role === 'user' ? '👤 User' : '🤖 MiaTech';
    
    const messageText = document.createElement('div');
    messageText.className = 'chat-message-text';
    messageText.textContent = text;
    
    messageDiv.appendChild(label);
    messageDiv.appendChild(messageText);
    chatHistory.appendChild(messageDiv);
    
    chatHistory.scrollTop = chatHistory.scrollHeight;
    
    CONFIG.datosEvaluacion.conversacionCompleta.push({
        role: role,
        message: text,
        timestamp: new Date().toISOString()
    });
}

function updateCurrentResponse(text) {
    const responseElement = document.getElementById('current-response-text');
    responseElement.textContent = text;
}

function showSpinner(text) {
    const spinner = document.getElementById('spinner-container');
    const spinnerText = document.getElementById('spinner-text');
    
    spinnerText.textContent = text || 'Processing...';
    spinner.classList.add('active');
}

function hideSpinner() {
    const spinner = document.getElementById('spinner-container');
    spinner.classList.remove('active');
}

function iniciarEvaluacion() {
    if (CONFIG.evaluacionIniciada) return;
    
    console.log('📋 Showing student information form');
    document.getElementById('student-form-modal').classList.add('active');
}

function reiniciarEvaluacion() {
    location.reload();
}
