export class AdvancedReverb extends SimpleReverb {
    constructor (audioContext: AudioContext, reverbTime: number = 1, preDelay: number = 0.03) {
        this.effect = this.context.createConvolver();

        this.reverbTime = reverbTime;

        this.attack = 0.001;
        this.decay = 0.1;
        this.release = reverbTime;

        this.preDelay = this.context.createDelay(reverbTime);
        this.preDelay.delayTime.setValueAtTime(preDelay, this.context.currentTime);

        this.multitap = [];

        for(let i = 2; i > 0; i--) {
            this.multitap.push(this.context.createDelay(reverbTime));
        }
        this.multitap.map((t,i)=>{
            if(this.multitap[i+1]) {
                t.connect(this.multitap[i+1])
            }
            t.delayTime.setValueAtTime(0.001+(i*(preDelay/2)), this.context.currentTime);
        })

        this.multitapGain = this.context.createGain();
        this.multitap[this.multitap.length-1].connect(this.multitapGain);

        this.multitapGain.gain.value = 0.2;

        this.multitapGain.connect(this.output);

        this.wet = this.context.createGain();
         
        this.input.connect(this.wet);
        this.wet.connect(this.preDelay);
        this.wet.connect(this.multitap[0]);
        this.preDelay.connect(this.effect);
        this.effect.connect(this.output);
    }

    renderTail() {
        const tailContext = new OfflineAudioContext( 2, this.context.sampleRate * this.reverbTime, this.context.sampleRate );
              tailContext.oncomplete = (buffer) => {
                this.effect.buffer = buffer.renderedBuffer;
              }
        const tailOsc = new Noise(tailContext, 1);
        const tailLPFilter = new Filter(tailContext, "lowpass", 2000, 0.2);
        const tailHPFilter = new Filter(tailContext, "highpass", 500, 0.1);

        tailOsc.init();
        tailOsc.connect(tailHPFilter.input);
        tailHPFilter.connect(tailLPFilter.input);
        tailLPFilter.connect(tailContext.destination);
        tailOsc.attack = this.attack;
        tailOsc.decay = this.decay;
        tailOsc.release = this.release;

        tailContext.startRendering()

        tailOsc.on({ frequency: 500, velocity: 1 });
        setTimeout(() => {
            tailOsc.off();
        }, 20)
    }

    set decayTime(value: number) {
        const dc = value/3;
        this.reverbTime = value;
        this.attack = 0;
        this.decay = 0;
        this.release = dc;
        return this.renderTail();
    }
}


export function createReverb(input, output) {
    const verb = new AdvancedReverb(audioContext, 2, 0.01); 
    verb.renderTail();
    verb.wet.gain.value = 1;
       
    input.connect(verb.input);
    verb.output.connect(compressor);
}
