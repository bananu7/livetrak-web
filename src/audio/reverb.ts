import { Noise } from './noise'

export class AdvancedReverb {
    effect: ConvolverNode;
    preDelay: DelayNode;
    multitap: DelayNode[];
    multitapGain: GainNode;
    input: GainNode;
    output: GainNode;

    reverbTime: number;
    attack: number;
    decay: number;
    release: number;

    audioContext: AudioContext

    constructor (audioContext: AudioContext, reverbTime: number = 1, preDelay: number = 0.03) {
        this.audioContext = audioContext;
        this.input = audioContext.createGain();
        this.output = audioContext.createGain();
        this.effect = audioContext.createConvolver();

        this.reverbTime = reverbTime;

        this.preDelay = audioContext.createDelay(reverbTime);
        this.preDelay.delayTime.setValueAtTime(preDelay, audioContext.currentTime);

        this.multitap = [];

        for(let i = 2; i > 0; i--) {
            this.multitap.push(audioContext.createDelay(reverbTime));
        }
        this.multitap.map((t,i)=>{
            if(this.multitap[i+1]) {
                t.connect(this.multitap[i+1])
            }
            t.delayTime.setValueAtTime(0.001+(i*(preDelay/2)), audioContext.currentTime);
        })

        this.multitapGain = audioContext.createGain();
        this.multitap[this.multitap.length-1].connect(this.multitapGain);

        this.multitapGain.gain.value = 0.2;

        this.multitapGain.connect(this.output);
        
        /*
        input  --> preDelay -> effect       ---> output
               \-> multitap -> multitapGain -/
        */

        this.input.connect(this.preDelay);
        this.input.connect(this.multitap[0]);
        this.preDelay.connect(this.effect);
        this.effect.connect(this.output);

        this.attack = 0.001;
        this.decay = 0.1;
        this.release = reverbTime/3;
        this.setDecayTime(reverbTime);
    }

    setDecayTime(value: number) {
        this.reverbTime = value;
        this.attack = 0.001;    // 0
        this.decay = 0.1;       // 0
        this.release = value/3; // value
        return this.renderTail(this.attack, this.decay, this.release);
    }

    private renderTail(attack: number, decay: number, release: number) {
        const tailContext = new OfflineAudioContext( 2, this.audioContext.sampleRate * this.reverbTime, this.audioContext.sampleRate );
              tailContext.oncomplete = (buffer) => {
                this.effect.buffer = buffer.renderedBuffer;
              }
        const tailOsc = new Noise(tailContext, 1);
        // todo
        //const tailLPFilter = new Filter(tailContext, "lowpass", 2000, 0.2);
        //const tailHPFilter = new Filter(tailContext, "highpass", 500, 0.1);

        /*
            constructor (context, type = "lowpass", cutoff = 1000, resonance = 0.9) {
                super(context);
                this.name = "filter";
                this.effect.frequency.value = cutoff;
                this.effect.Q.value = resonance;
                this.effect.type = type;
            }

            setup() {
                this.effect = this.context.createBiquadFilter();
                this.effect.connect(this.output);
        */

        tailOsc.init();
        //tailOsc.connect(tailHPFilter.input);
        //tailHPFilter.connect(tailLPFilter.input);
        //tailLPFilter.connect(tailContext.destination);
        tailOsc.attack = attack;
        tailOsc.decay = decay;
        tailOsc.release = release;

        tailContext.startRendering()

        tailOsc.on({ frequency: 500, velocity: 1, value: 1 });
        setTimeout(() => {
            tailOsc.off();
        }, 20)
    }
}


export function createReverb(audioContext: AudioContext, input: AudioNode, output: AudioNode) {
    const verb = new AdvancedReverb(audioContext, 2, 0.01);
       
    input.connect(verb.input);
    verb.output.connect(output);
}
