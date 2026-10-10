const fs = require('fs');
const path = './orchestrator.js';
let code = fs.readFileSync(path, 'utf8');

const injection = `
// --- DRAGON 9 LOCAL LLM INTERCEPTOR ---
// Hijacks global fetch to reroute Gemini API calls directly to local Ollama.
const _originalFetch = global.fetch;
global.fetch = async (url, options) => {
    if (url && url.toString().includes('generativelanguage.googleapis.com')) {
        console.log("\\n[D9 Interceptor] Cloud request blocked. Rerouting prompt to local LLM...");
        try {
            let promptText = "Generate prompt";
            if (options && options.body) {
                const body = JSON.parse(options.body);
                if (body.contents && body.contents[0] && body.contents[0].parts) {
                    promptText = body.contents[0].parts.map(p => p.text).join('\\n');
                }
            }
            
            // Route to local Ollama instance (defaults to llama3 model)
            const localRes = await _originalFetch("http://localhost:11434/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: "llama3", 
                    prompt: promptText,
                    stream: false
                })
            });
            
            if (!localRes.ok) throw new Error("Local LLM returned " + localRes.status);
            const localData = await localRes.json();
            
            // Mock the exact Gemini response structure so the pipeline doesn't break
            return {
                ok: true,
                status: 200,
                json: async () => ({
                    candidates: [{
                        content: { parts: [{ text: localData.response }], role: "model" }
                    }]
                })
            };
        } catch (err) {
            console.error("[D9 Interceptor] Local LLM offline. Is Ollama running?", err.message);
            // Graceful fallback so the pipeline continues
            return {
                ok: true,
                status: 200,
                json: async () => ({
                    candidates: [{ content: { parts: [{ text: "Local LLM Offline - Fallback visual prompt generated." }] } }]
                })
            };
        }
    }
    return _originalFetch(url, options);
};
// --------------------------------------\n\n`;

if (!code.includes('DRAGON 9 LOCAL LLM INTERCEPTOR')) {
    fs.writeFileSync(path, injection + code);
    console.log("✅ Successfully injected the local LLM interceptor into orchestrator.js");
} else {
    console.log("⚡ Interceptor is already active in orchestrator.js");
}
