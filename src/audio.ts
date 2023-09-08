import { TimingObject, ITimingObject } from 'timing-object';
import { setTimingsrc } from 'timingsrc';

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
    masterMuteNode: GainNode;
    audios: Audio[];

    constructor() {
        console.log("[audio] Creating new AudioSystem");
        this.timingObject = new TimingObject();
        this.audioContext = new AudioContext();
        this.audios = [];

        this.masterGainNode = this.audioContext.createGain();
        this.masterMuteNode = this.audioContext.createGain();

        this.masterGainNode.connect(this.masterMuteNode);
        this.masterMuteNode.connect(this.audioContext.destination);
    }

    makeAudio (url: string, name: string): ChannelController {
        const elem = document.createElement('audio');
        elem.src = url;
        elem.style.cssText = "visibility: hidden;";
        elem.muted = false;
        elem.volume = 1.0;
        elem.crossOrigin = "anonymous";
        document.body.appendChild(elem);

        setTimingsrc(elem, this.timingObject);

        /* add measurement node for lights */
        const node = this.audioContext.createMediaElementSource(elem);
        const gainNode = this.audioContext.createGain();
        const muteNode = this.audioContext.createGain();
        const analyser = this.audioContext.createAnalyser();

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

        gainNode.gain.value = 1.0;
        node.connect(gainNode);
        node.connect(analyser); // TOOD this could be pre-fader or post-fader
        gainNode.connect(muteNode);

        // gainNode.connect(this.audioContext.destination); // TODO - eq bypass

        const [eqController, eqNodes] = this.makeEqChain(muteNode, this.masterGainNode);

        this.audios.push({
            element: elem,
            nodes: [node, gainNode, muteNode, analyser, ...eqNodes],
        })

        return {
            setGain: g => gainNode.gain.value = g,
            setMute: m => muteNode.gain.value = m ? 0 : 1,
            setEqBypass: _eqBypass => {return;}, // TODO implement
            ...eqController
        };
    }

    clear() {
        this.audios.forEach(a => this.clearAudio(a));
    }

    clearAudio(audio: Audio) {
        document.body.removeChild(audio.element);
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
            setGain: (_g: number) => {},
            setMute: (_m: boolean) => {}
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
