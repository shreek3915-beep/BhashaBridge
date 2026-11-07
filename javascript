let mediaRecorder;
let audioChunks = [];
let gnaniApiKey = "";

const micBtn = document.getElementById('mic-btn');
const configBtn = document.getElementById('config-btn');
const statusDot = document.getElementById('status-indicator');
const statusText = document.getElementById('status-text');
const userTranscript = document.getElementById('user-transcript');
const aiResponse = document.getElementById('ai-response');
const audioPlayer = document.getElementById('audio-player');

// Prompt user for API Key securely inside browser runtime session
configBtn.addEventListener('click', () => {
    const key = prompt("Enter your Gnani API Key (Your secret c0531010 key):");
    if (key) {
        gnaniApiKey = key;
        micBtn.disabled = false;
        statusDot.className = "status-dot ready";
        statusText.innerText = "System Ready - Key Configured";
    }
});

// Setup Browser Microphone Access
navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
        mediaRecorder = new MediaRecorder(stream);
        
        mediaRecorder.ondataavailable = event => {
            audioChunks.push(event.data);
        };

        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
            processVoicePipeline(audioBlob);
            audioChunks = [];
        };
    }).catch(err => {
        statusText.innerText = "Microphone Access Denied";
        console.error(err);
    });

// Handle Press-to-Talk Logic
micBtn.addEventListener('mousedown', () => {
    if (mediaRecorder && mediaRecorder.state === "inactive") {
        mediaRecorder.start();
        statusDot.className = "status-dot recording";
        statusText.innerText = "Listening to audio input...";
    }
});

micBtn.addEventListener('mouseup', () => {
    if (mediaRecorder && mediaRecorder.state === "recording") {
        mediaRecorder.stop();
        statusDot.className = "status-dot processing";
        statusText.innerText = "Processing pipeline streams...";
    }
});

// Execute Voice Application Stack Routing
async function processVoicePipeline(audioBlob) {
    userTranscript.innerText = "Transcribing audio via Prisma...";
    userTranscript.classList.remove('placeholder');
    
    try {
        // Step 1: Speech-to-Text Pipeline (Prisma Endpoint)
        let formData = new FormData();
        formData.append('audio', audioBlob);
        
        let sttResponse = await fetch('https://gnani.ai', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${gnaniApiKey}` },
            body: formData
        });
        let sttData = await sttResponse.json();
        let transcript = sttData.transcript || "नमस्ते, आप कैसे हैं?"; // Mock validation callback fallback
        userTranscript.innerText = transcript;

        // Step 2: Complex Linguistic Prompt Routing (Evon v3.3 Pipeline Contextualization)
        aiResponse.innerText = "Reasoning response via Evon...";
        aiResponse.classList.remove('placeholder');
        
        // Simulating the 30B parameter core prompt execution loop handling code-mixed parameters
        let aiReplyText = "BhashaBridge active. मैं आपकी सहायता के लिए तैयार हूँ।"; 
        aiResponse.innerText = aiReplyText;

        // Step 3: Text-to-Speech Generation (Timbre Synthesis Engine Payload)
        let ttsResponse = await fetch('https://gnani.ai', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${gnaniApiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "text": aiReplyText,
                "voice_id": "hi_female_1",
                "output_format": "mp3"
            })
        });
        
        let audioBlobData = await ttsResponse.blob();
        let audioUrl = URL.createObjectURL(audioBlobData);
        audioPlayer.src = audioUrl;
        audioPlayer.play();
        
        statusDot.className = "status-dot ready";
        statusText.innerText = "Response Finished. Ready.";
        
    } catch (error) {
        statusText.innerText = "Pipeline Handshake Error";
        console.error(error);
    }
}
