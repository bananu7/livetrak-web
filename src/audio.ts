import { TimingObject, ITimingObject } from 'timing-object';
import { setTimingsrc } from 'timingsrc';

type AudioCommand = {
    position?: number;
    velocity?: number;
}
type AudioState = {
    position: number,
    velocity: number,
}

export class AudioSystem {
    audioContext: AudioContext;
    timingObject: ITimingObject;

    constructor() {
        console.log("[audio] Creating new AudioSystem");
        this.timingObject = new TimingObject();
        this.audioContext = new AudioContext();
    }

    makeAudio (url: string, name: string) {
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
        node.connect(analyser)

        this.makeEqChain(gainNode, this.audioContext.destination)
        //gainNode.connect(this.audioContext.destination);

        return elem;
    }

    private makeEqChain(sourceNode: AudioNode, destNode: AudioNode) {
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

        sourceNode.connect(lowCut);
        lowCut.connect(high);
        high.connect(low);
        low.connect(mid);
        mid.connect(destNode);
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

