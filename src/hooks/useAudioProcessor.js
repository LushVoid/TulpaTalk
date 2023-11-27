import { useCallback } from 'react';
import * as Tone from 'tone';

const useAudioProcessor = () => {
    // Setting up Tone.js components here
    const noise = new Tone.Noise("white").start();
    const filter = new Tone.Filter({
        type: 'lowpass',
        frequency: 800,
    }).toDestination();
    noise.connect(filter);

    const lfo = new Tone.LFO({
        type: 'sine',
        min: 500,
        max: 1200,
        frequency: 0.25
    }).connect(filter.frequency);
    lfo.start();

    const processAudio = useCallback((data) => {
        // Assuming data is an array and we use the first element
        // Adjust logic as needed
        const volume = -30 + data * 10;
        const volumeValue = Math.max(-60, Math.min(0, volume));
        noise.volume.value = volumeValue;
    }, []);

    return processAudio;
};

export default useAudioProcessor;
