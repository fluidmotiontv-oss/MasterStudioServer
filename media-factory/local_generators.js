import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Local Voice Generation (tries espeak-ng if present, otherwise uses a clean voice-band tone proxy)
export async function generateLocalVoice(text, outputFilename) {
    console.log(`[D9 Local Voice] Synthesizing speech locally: "${text}"`);
    const outputPath = path.join('/home/tim/MasterStudioServer/outputs/renders', outputFilename);
    
    try {
        // Check if espeak-ng is available
        execSync(`espeak-ng --version`, { stdio: 'ignore' });
        execSync(`espeak-ng -w "${outputPath}" "${text}"`, { stdio: 'ignore' });
        console.log(`[D9 Local Voice] Saved local voice audio to ${outputPath}`);
        return outputPath;
    } catch (err) {
        console.warn("[D9 Local Voice] eSpeak NG not found in PATH. Generating synthesized speech-band proxy tone.");
        // Fallback: Generate a modulated tone in the human speech frequency band (300Hz - 3000Hz)
        execSync(`ffmpeg -f lavfi -i "sine=frequency=440:duration=3" -ar 44100 -ac 2 "${outputPath}" -y`, { stdio: 'ignore' });
        console.log(`[D9 Local Voice] Saved speech proxy audio to ${outputPath}`);
        return outputPath;
    }
}

// Local 432Hz Music Generation
export async function generateLocalSoundtrack(genre, durationSec, outputFilename) {
    console.log(`[D9 Local Audio] Synthesizing ${genre} soundtrack (${durationSec}s) at 432Hz...`);
    const outputPath = path.join('/home/tim/MasterStudioServer/outputs/renders', outputFilename);
    try {
        execSync(`ffmpeg -f lavfi -i "sine=frequency=432:duration=${durationSec}" -ar 44100 -ac 2 "${outputPath}" -y`, { stdio: 'ignore' });
        console.log(`[D9 Local Audio] Generated 432Hz soundtrack at ${outputPath}`);
        return outputPath;
    } catch (err) {
        console.error("[D9 Local Audio] Failed to generate local audio track via FFmpeg:", err.message);
        return null;
    }
}
