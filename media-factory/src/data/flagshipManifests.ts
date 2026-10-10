/**
 * Flagship Asset Architect Manifests
 * Super Puff and Pee Dub Surf Chronicles for Nutflox Cartoon Pipeline.
 *
 * @license Apache-2.0
 */

import { AssetArchitectManifest } from '../types';

export const FLAGSHIP_MANIFESTS: {
  superPuff: AssetArchitectManifest;
  peeDubSurfChronicles: AssetArchitectManifest;
} = {
  superPuff: {
    manifestVersion: '2.9.4',
    architectId: 'D9-ARCHITECT-SUPERPUFF-CORE',
    seriesTitle: 'Super Puff',
    episodeId: 'SP-EP101-NEBULA',
    episodeTitle: 'The Cosmic Marshmallow Nebula',
    season: 1,
    episodeNumber: 1,
    dragon9Cycle: 'CYCLE-03:BEAT-07',
    resolution: '1920x1080',
    fps: 24,
    colorSpace: 'bt709',
    aspectRatio: '16:9',
    audioTuning: '432Hz Verdi Harmonic',
    characters: [
      {
        id: 'char_super_puff',
        name: 'Super Puff',
        description: 'Sentient marshmallow superhero with bouncy fluid dynamics and cotton-candy aura.',
        elevenLabsVoiceId: '21m00Tcm4TlvDq8ikWAM',
        voiceSettings: { stability: 0.45, similarityBoost: 0.85, style: 0.65 },
        visualModelSeed: 948201
      },
      {
        id: 'char_mayor_fluff',
        name: 'Mayor Fluffington',
        description: 'Stately powder-sugar elder statesman with gelatin spectacles.',
        elevenLabsVoiceId: 'AZnzlk1XvdvUeBnXmlld',
        voiceSettings: { stability: 0.70, similarityBoost: 0.75, style: 0.30 },
        visualModelSeed: 110293
      },
      {
        id: 'char_general_crisp',
        name: 'General Crisp',
        description: 'Toasted graham cracker cyborg warlord with crunchy mechanical appendages.',
        elevenLabsVoiceId: 'TxGEqnHWrfWFTfGW9XjX',
        voiceSettings: { stability: 0.60, similarityBoost: 0.90, style: 0.75 },
        visualModelSeed: 774129
      }
    ],
    scenes: [
      {
        sceneId: 'SCENE_01_COSMIC_SUGAR_REEF',
        sceneTitle: 'Cosmic Sugar Reef Approaching',
        durationSeconds: 12.5,
        dragon9Timecode: '03:07:00:12',
        backgroundPrompt: 'Vibrant neon pastel space reef floating in cosmic marshmallow dust, cel-shaded 90s animation, candy asteroids orbiting in liquid indigo space, ultra-crisp line art.',
        cameraMotion: 'Pan right with dynamic 2.5D parallax push-in, focal length 35mm, motion blur 0.35.',
        visualPrompts: [
          'Keyframe 01: Wide shot of Sugar Reef glistening under two pastel magenta suns.',
          'Keyframe 02: Super Puff zooming into frame leaving a rainbow gelatin particle trail, bouncy squash-and-stretch.',
          'Keyframe 03: Close-up on Super Puff puffing up with glowing eyes, hero landing stance.'
        ],
        dialogue: [
          {
            characterId: 'char_super_puff',
            speaker: 'Super Puff',
            line: 'Hold onto your sprinkles! The Nebula is collapsing into pure syrup!',
            emotion: 'heroic_urgent',
            startOffset: 1.2,
            duration: 3.4
          },
          {
            characterId: 'char_mayor_fluff',
            speaker: 'Mayor Fluffington',
            line: 'Puff! The Graham Citadel has activated their mega toaster cannons!',
            emotion: 'panic_distress',
            startOffset: 5.0,
            duration: 4.1
          }
        ],
        sfx: ['sfx_cosmic_whoosh_432hz.wav', 'sfx_marshmallow_squish.wav', 'sfx_energy_hum_low.wav'],
        ffmpegFilters: 'tblend=all_mode=average,eq=saturation=1.35:contrast=1.15,unsharp=5:5:0.8'
      },
      {
        sceneId: 'SCENE_02_GRAHAM_CRACKER_SIEGE',
        sceneTitle: 'General Crisp Toaster Cannon Siege',
        durationSeconds: 15.0,
        dragon9Timecode: '03:07:12:36',
        backgroundPrompt: 'Interior of the colossal Toaster Dreadnought, glowing red thermal heating coils, crumb steam vents, retro-futuristic steampunk cartoon architecture.',
        cameraMotion: 'Low angle rotating tracking shot tilting upwards towards General Crisp.',
        visualPrompts: [
          'Keyframe 01: General Crisp raising crunchy mechanical claw towards glowing heat coil lever.',
          'Keyframe 02: Orange energy sparks leaping between molten butter capacitors, dynamic lighting.',
          'Keyframe 03: Super Puff kicking through the vent, expanding into a giant protective fluff shield.'
        ],
        dialogue: [
          {
            characterId: 'char_general_crisp',
            speaker: 'General Crisp',
            line: 'Once the coils reach maximum crunch, your soft world will be toasted forever!',
            emotion: 'sinister_commanding',
            startOffset: 0.8,
            duration: 5.2
          },
          {
            characterId: 'char_super_puff',
            speaker: 'Super Puff',
            line: 'You forgot one crucial factor, Crisp: you cannot melt a celestial marshmallow!',
            emotion: 'defiant_triumphant',
            startOffset: 6.8,
            duration: 5.5
          }
        ],
        sfx: ['sfx_toaster_heat_alarm.wav', 'sfx_crunch_impact.wav', 'sfx_steam_blast.wav'],
        ffmpegFilters: 'tblend=all_mode=average,eq=gamma_r=1.2:gamma_b=0.9,drawbox=x=0:y=0:w=iw:h=60:color=black@0.8:t=fill'
      }
    ]
  },

  peeDubSurfChronicles: {
    manifestVersion: '2.9.4',
    architectId: 'D9-ARCHITECT-PEEDUB-SURF-CORE',
    seriesTitle: 'Pee Dub Surf Chronicles',
    episodeId: 'PD-EP204-TIDAL-NINE',
    episodeTitle: 'Point Break at Tidal Nine',
    season: 2,
    episodeNumber: 4,
    dragon9Cycle: 'CYCLE-06:BEAT-02',
    resolution: '1920x1080',
    fps: 24,
    colorSpace: 'bt709',
    aspectRatio: '16:9',
    audioTuning: '432Hz Verdi Harmonic (Dub Reggae Core)',
    characters: [
      {
        id: 'char_pee_dub',
        name: 'Pee Dub',
        description: 'Vaporwave surf guru with sunglasses, neon board shorts, and endless chill wisdom.',
        elevenLabsVoiceId: 'ErXwobaYiN019PkySvjV',
        voiceSettings: { stability: 0.80, similarityBoost: 0.80, style: 0.20 },
        visualModelSeed: 554321
      },
      {
        id: 'char_wave_rider_rex',
        name: 'Wave Rider Rex',
        description: 'Adrenaline-junkie cybernetic raptor on an anti-gravity hydrofoil surfboard.',
        elevenLabsVoiceId: 'VR6AewLTigWG4xSOukaG',
        voiceSettings: { stability: 0.50, similarityBoost: 0.70, style: 0.80 },
        visualModelSeed: 882014
      },
      {
        id: 'char_salty_sam',
        name: 'Salty Sam',
        description: 'Ancient pelican sea captain with a cyber-eyepatch and weathered weather sense.',
        elevenLabsVoiceId: 'N2lVS1w4EtoT3dr4eOWO',
        voiceSettings: { stability: 0.65, similarityBoost: 0.85, style: 0.40 },
        visualModelSeed: 339012
      }
    ],
    scenes: [
      {
        sceneId: 'SCENE_01_POINT_BREAK_DAWN',
        sceneTitle: 'Sunrise Over the Bioluminescent Reef',
        durationSeconds: 14.0,
        dragon9Timecode: '06:02:00:00',
        backgroundPrompt: 'Vaporwave retro surf coastline at neon sunrise, violet waters breaking into glowing cyan seafoam, palm trees silhouetted against giant chrome sun, retro cel anime aesthetic.',
        cameraMotion: 'Slow high-altitude drone tracking dolly shot skimming across the surface of the wave curl.',
        visualPrompts: [
          'Keyframe 01: Pee Dub sitting cross-legged on surfboard in glassy neon morning swell.',
          'Keyframe 02: Salty Sam landing on the pier railing with an old holographic tide chart.',
          'Keyframe 03: Distant rumble on the horizon as the Dragon 9 tidal wave swells.'
        ],
        dialogue: [
          {
            characterId: 'char_salty_sam',
            speaker: 'Salty Sam',
            line: 'The barometer is dropping into negative decibels, Pee Dub. The Fifty-Four Foot Beast is rolling in.',
            emotion: 'ominous_warning',
            startOffset: 1.0,
            duration: 4.8
          },
          {
            characterId: 'char_pee_dub',
            speaker: 'Pee Dub',
            line: 'You gotta respect the ocean frequency, Sam. Forty-eight hertz in the reef, four-thirty-two in the soul.',
            emotion: 'transcendent_chill',
            startOffset: 6.2,
            duration: 5.6
          }
        ],
        sfx: ['sfx_ocean_surf_wash_432hz.wav', 'sfx_seagull_hologram.wav', 'sfx_board_wax_scrape.wav'],
        ffmpegFilters: 'tblend=all_mode=average,eq=gamma=1.1:saturation=1.4,curves=vintage'
      },
      {
        sceneId: 'SCENE_02_THE_DRAGON_BARREL',
        sceneTitle: 'Inside the Emerald Dragon Barrel',
        durationSeconds: 18.0,
        dragon9Timecode: '06:02:14:00',
        backgroundPrompt: 'Inside a massive 60-foot crystalline wave tube, emerald water illuminated by sunlight refraction, liquid spray swirling with neon rainbows, high speed fluid dynamics animation.',
        cameraMotion: 'Extreme wide fisheye lens inside the barrel following Pee Dub carve the face.',
        visualPrompts: [
          'Keyframe 01: Pee Dub dragging his trailing hand through the emerald wave wall creating spray sparks.',
          'Keyframe 02: Wave Rider Rex dropping in on an anti-gravity hydrofoil board performing a vertical 360 spin.',
          'Keyframe 03: Both surfers emerging through the spitting barrel into golden sunset mist.'
        ],
        dialogue: [
          {
            characterId: 'char_wave_rider_rex',
            speaker: 'Wave Rider Rex',
            line: 'Woo-hoo! Look at that vortex pinch! We are riding inside the Dragon 9 harmonic rhythm!',
            emotion: 'ecstatic_shouting',
            startOffset: 1.5,
            duration: 4.2
          },
          {
            characterId: 'char_pee_dub',
            speaker: 'Pee Dub',
            line: 'Just carve the pocket and breathe, Rex. The rhythm does all the heavy lifting.',
            emotion: 'effortless_glide',
            startOffset: 6.5,
            duration: 5.1
          }
        ],
        sfx: ['sfx_wave_thunder_roar.wav', 'sfx_water_spray_rush.wav', 'sfx_surfboard_carve_hydro.wav'],
        ffmpegFilters: 'tblend=all_mode=average,eq=contrast=1.2:saturation=1.5,vignette=PI/4'
      }
    ]
  }
};
