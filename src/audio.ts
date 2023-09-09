import { TimingObject, ITimingObject } from 'timing-object';
import { setTimingsrc } from 'timingsrc';
import { AdvancedReverb, createReverb } from './audio/reverb';

export type AudioCommand = {
    position?: number;
    velocity?: number;
}
export type AudioState = {
    position: number,
    velocity: number,
}

export type EqController = {
    setLowCutEnabled: (lowCut: boolean) => void;
    setLowGain: (lowGain: number) => void;
    setMidGain: (midGain: number) => void;
    // setMidFrequency: (freq: number) => void
    setHighGain: (highGain: number) => void;
    setPan: (pan: number) => void;
}

export type ChannelController = EqController & {
    setMute: (mute: boolean) => void;
    setEqBypass: (bypassEq: boolean) => void;
    setGain: (gain: number) => void;
}

// FX and master
export type SimpleChannelController = {
    setMute: (mute: boolean) => void;
    setGain: (gain: number) => void;
}

type Audio = {
    element: HTMLMediaElement,
    nodes: AudioNode[],
}

export class AudioSystem {
    audioContext: AudioContext;
    timingObject: ITimingObject;
    masterGainNode: GainNode;
    masterMuteNode: GainNode
    fxMasterGainNode: GainNode;
    fxMasterMuteNode: GainNode;

    audios: Audio[];
    reverb: AdvancedReverb;

    constructor() {
        console.log("[audio] Creating new AudioSystem");
        this.timingObject = new TimingObject();
        this.audioContext = new AudioContext();
        this.audios = [];

        this.masterGainNode = this.audioContext.createGain();
        this.masterMuteNode = this.audioContext.createGain();
        this.fxMasterGainNode = this.audioContext.createGain();
        this.fxMasterMuteNode = this.audioContext.createGain();

        this.fxMasterMuteNode.connect(this.masterGainNode);
        // The effect is actually past fxMasterGain because it's the same regardless
        // of the order of (gain, mute, reverb).
        this.reverb = createReverb(this.audioContext, this.fxMasterGainNode, this.fxMasterMuteNode);

        this.masterGainNode.connect(this.masterMuteNode);
        this.masterMuteNode.connect(this.audioContext.destination);
    }

    private createAnalyser(name: string) {
        const analyser = this.audioContext.createAnalyser();

        /* measurement node */
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        function calculateVolume() {
            analyser.getByteFrequencyData(dataArray)

            let sum = 0;
            for (const amplitude of dataArray) {
              sum += amplitude * amplitude
            }

            const volume = Math.sqrt(sum / dataArray.length)

            const meter = document.getElementById(`meter-${name}`);
            if (meter)
                meter.style.height = `${volume}%`;
            requestAnimationFrame(calculateVolume)
        }
        calculateVolume();

        return analyser;
    }

    makeAudio (url: string, name: string): ChannelController {
        const elem = document.createElement('audio');
        elem.src = url;
        elem.style.cssText = "visibility: hidden;";
        elem.muted = false;
        elem.volume = 1.0;
        elem.crossOrigin = "anonymous";
        document.body.appendChild(elem);

        console.log("adding audio element ", name)

        setTimingsrc(elem, this.timingObject);

        
        // L-12 routing notes from reddit:
        /*
        TL;DR EFX are driven globally from individual channels' volumes in the MASTER mix
        - if you have a channel at -∞ on the master, you cannot get reverbs from it in any monitor mix.

        When this line of mixers was first released, sending FX to the individual monitor mixes was impossible
        - just flat out not included. They added this ability later down the line in a firmware update,
        but a holdover from that seems to be that FX relies on what's sent to the master channel.
        This behavior is pre-fader for the master as well--you can mute the actual red master fader
        and the reverb is still sent to the rest of the device.
        */

        // TODO confirm with physical unit that the FX are indeed post-fader on master.

        /*
            node --> gainNode -> muteNode --> EQ -> masterGain -> masterMute               ----> output
                 \                        \-> fxGain -> fxMasterGain -> [reverb] -> fxMute --/
                  \-> analyser 
        */

        const node = this.audioContext.createMediaElementSource(elem);
        const gainNode = this.audioContext.createGain();
        const fxGainNode = this.audioContext.createGain();
        const muteNode = this.audioContext.createGain();
        const analyser = this.createAnalyser(name);

        gainNode.gain.value = 1.0;
        fxGainNode.gain.value = 0.0;

        node.connect(gainNode);
        node.connect(analyser); // TOOD this could be pre-fader or post-fader
        gainNode.connect(muteNode);
        muteNode.connect(fxGainNode);
        fxGainNode.connect(this.fxMasterGainNode);
        // muteNode.connect(this.audioContext.destination); // TODO - eq bypass

        const [eqController, eqNodes] = this.makeEqChain(muteNode, this.masterGainNode);

        // for cleanup
        this.audios.push({
            element: elem,
            nodes: [node, gainNode, muteNode, analyser, fxGainNode, ...eqNodes],
        })

        return {
            setGain: g => gainNode.gain.value = g,
            setMute: m => muteNode.gain.value = m ? 0 : 1,
            setEqBypass: _eqBypass => {return;}, // TODO implement
            ...eqController
        };
    }

    clear() {
        console.log(`Clearing audio with ${this.audios.length} entries`);
        this.audios.forEach(a => this.clearAudio(a));
    }

    clearAudio(audio: Audio) {
        document.body.removeChild(audio.element);
        console.log("removing audio element")
        audio.nodes.forEach(n => n.disconnect());
    }

    getMasterChannelController(): SimpleChannelController {
        return {
            setGain: (g: number) => this.masterGainNode.gain.value = g,
            setMute: (m: boolean) => this.masterMuteNode.gain.value = m ? 0 : 1,
        }
    }

    getFxChannelController(): SimpleChannelController {
        return {
            setGain: (g: number) => this.fxMasterGainNode.gain.value = g,
            setMute: (m: boolean) => this.fxMasterMuteNode.gain.value = m ? 0 : 1,
        }
    }

    private makeEqChain(sourceNode: AudioNode, destNode: AudioNode): [EqController, AudioNode[]] {
        const lowCut = this.audioContext.createBiquadFilter();
        lowCut.type = 'highpass';
        lowCut.frequency.value = 75;

        const low = this.audioContext.createBiquadFilter();
        low.type = 'lowshelf';
        low.frequency.value = 100;
        low.gain.value = 0;

        const mid = this.audioContext.createBiquadFilter();
        mid.type = 'peaking';
        mid.gain.value = 0;

        const high = this.audioContext.createBiquadFilter();
        high.type = 'highshelf';
        high.frequency.value = 10000;
        high.gain.value = 0;


        const panNode = this.audioContext.createStereoPanner();

        sourceNode.connect(lowCut);
        lowCut.connect(high);
        high.connect(low);
        low.connect(mid);
        mid.connect(panNode);
        panNode.connect(destNode);

        const ctrl: EqController = {
            setLowCutEnabled: e => lowCut.frequency.value = e ? 75 : 0,
            setLowGain: g => low.gain.value = g,
            setMidGain: g => mid.gain.value = g,
            // setMidFrequency: (freq: number) => void
            setHighGain: g => high.gain.value = g,
            setPan: p => panNode.pan.value = p,
        };

        const nodes = [lowCut, low, mid, high, panNode];

        return [ctrl, nodes];
    }

    resume() {
        this.audioContext.resume();
    }

    update(command: AudioCommand) {
        this.timingObject.update(command);
    }

    query(): AudioState {
        return this.timingObject.query();
    }
}
