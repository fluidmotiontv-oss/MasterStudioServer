import React, { useState, useEffect } from 'react';
import { Dragon9Engine } from './d9Engine';
import { AudioEngine432 } from './audioEngine';
import FluidShaderCanvas from './FluidShaderCanvas';

const d9Engine = new Dragon9Engine();
const audioEngine = new AudioEngine432();

export default function MasterEngineShell() {
  const [temporalState, setTemporalState] = useState(d9Engine.getCurrentTemporalState());
  const [audioActive, setAudioActive] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setTemporalState(d9Engine.getCurrentTemporalState());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleAudio = () => {
    if (audioActive) {
      audioEngine.stopDrone();
      setAudioActive(false);
    } else {
      audioEngine.startDrone();
      setAudioActive(true);
    }
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <FluidShaderCanvas />

      <div style={{
        position: 'absolute',
        top: 20,
        left: 20,
        zIndex: 10,
        background: 'rgba(5, 5, 8, 0.85)',
        border: '1px solid #00ffcc',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 0 20px rgba(0, 255, 204, 0.3)',
        maxWidth: '380px'
      }}>
        <h2 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#00ffcc' }}>D9 CORE 9 // MASTER ENGINE</h2>
        <p style={{ margin: '5px 0', fontSize: '13px' }}><b>Location:</b> Pee Dub, Aotearoa</p>
        <hr style={{ borderColor: '#00ffcc44', margin: '10px 0' }} />
        
        <p style={{ margin: '5px 0', fontSize: '13px' }}><b>ISO Time:</b> {temporalState.isoTime}</p>
        <p style={{ margin: '5px 0', fontSize: '13px' }}><b>D9 Hour Index:</b> {temporalState.d9Hour} / 26</p>
        <p style={{ margin: '5px 0', fontSize: '13px' }}><b>Hour Progress:</b> {temporalState.hourProgress}</p>
        <p style={{ margin: '5px 0', fontSize: '13px' }}><b>Harmonic Base:</b> {temporalState.harmonicFrequency} Hz</p>
        
        <div style={{
          marginTop: '10px',
          padding: '6px',
          textAlign: 'center',
          background: temporalState.apexActive ? '#ff0055' : '#00ffcc22',
          color: temporalState.apexActive ? '#fff' : '#00ffcc',
          fontWeight: 'bold',
          borderRadius: '4px'
        }}>
          {temporalState.apexActive ? '⚡ APEX INTERMISSION ACTIVE ⚡' : 'NORMAL FLUID FLOW'}
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
          <button 
            onClick={toggleAudio}
            style={{
              flex: 1,
              background: audioActive ? '#00ffcc' : 'transparent',
              color: audioActive ? '#050508' : '#00ffcc',
              border: '1px solid #00ffcc',
              padding: '10px',
              cursor: 'pointer',
              fontWeight: 'bold',
              borderRadius: '4px'
            }}
          >
            {audioActive ? 'MUTE 432 Hz' : 'ENGAGE 432 Hz'}
          </button>
          
          <button 
            onClick={() => audioEngine.triggerApexChime()}
            style={{
              background: 'transparent',
              color: '#00ffcc',
              border: '1px solid #00ffcc',
              padding: '10px',
              cursor: 'pointer',
              borderRadius: '4px'
            }}
          >
            🔔 CHIME
          </button>
        </div>
      </div>
    </div>
  );
}
