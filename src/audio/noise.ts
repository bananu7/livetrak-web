type MidiEvent = {
  value: number;
  frequency: number;
  velocity: number;
}

class AmpEnvelope {
  context: OfflineAudioContext;
  output: GainNode;
  velocity: number;
  gain: number;
  attack: number;
  decay: number;
  _sustain: number;
  _release: number;

  constructor (context: OfflineAudioContext, gain: number = 1) {
    this.context = context;
    this.output = this.context.createGain();
    this.output.gain.value = gain;

    this.velocity = 0;
    this.gain = gain;
    this.attack = 0;
    this.decay = 0.001;
    this._sustain = this.output.gain.value;
    this._release = 0.001;
  }

  on (velocity: number) {
    this.velocity = velocity / 127;
    this.start(this.context.currentTime);
  }

  off () {
    return this.stop(this.context.currentTime);
  }

  start (time: number) {
    this.output.gain.value = 0;
    this.output.gain.setValueAtTime(0, time);
    this.output.gain.setTargetAtTime(1, time, this.attack+0.00001);
    this.output.gain.setTargetAtTime(this.sustain * this.velocity, time + this.attack, this.decay);
  }

  stop (time: number) {
    this.sustain = this.output.gain.value;
    this.output.gain.cancelScheduledValues(time);
    this.output.gain.setValueAtTime(this.sustain, time);
    this.output.gain.setTargetAtTime(0, time, this.release+0.00001);
  }

  set sustain(value: number) {
    this.gain = value;
    this._sustain;
  }

  get sustain () {
    return this.gain;
  }

  set release (value: number) {
    this._release = value;
  }

  get release () {
    return this._release;
  }

  connect (destination: AudioNode) {
    this.output.connect(destination);
  }
}

export class Voice {
  context: OfflineAudioContext;
  type: OscillatorType;
  value: number;
  gain: number;
  output: GainNode;
  ampEnvelope: AmpEnvelope;
  partials: OscillatorNode[];

  constructor(context: OfflineAudioContext, type: OscillatorType ="sawtooth", gain = 0.1) {
    this.context = context;
    this.type = type;
    this.value = -1;
    this.gain = gain;
    this.output = this.context.createGain();
    this.partials = [];
    this.output.gain.value = this.gain;
    this.ampEnvelope = new AmpEnvelope(this.context);
    this.ampEnvelope.connect(this.output);
  }

  init() {
    let osc = this.context.createOscillator();
      osc.type = this.type;
      osc.connect(this.ampEnvelope.output);
      osc.start(this.context.currentTime);
    this.partials.push(osc);
  }

  on(event: MidiEvent) {
    this.value = event.value;
    this.partials.forEach((osc) => {
      osc.frequency.value = event.frequency;
    });
    this.ampEnvelope.on(event.velocity);
  }

  off() {
    this.ampEnvelope.off();
    this.partials.forEach((osc) => {
      osc.stop(this.context.currentTime + this.ampEnvelope.release * 4);
    });
  }

  connect(destination: AudioNode) {
    this.output.connect(destination);
  }

  set detune (value: number) {
    this.partials.forEach(p=>p.detune.value=value);
  }
  
  set attack (value: number) {
    this.ampEnvelope.attack  = value;
  }

  get attack () {
    return this.ampEnvelope.attack;
  }

  set decay (value: number) {
    this.ampEnvelope.decay  = value;
  }

  get decay () {
    return this.ampEnvelope.decay;
  }

  set sustain (value: number) {
    this.ampEnvelope.sustain = value;
  }

  get sustain () {
    return this.ampEnvelope.sustain;
  }

  set release (value: number) {
    this.ampEnvelope.release = value;
  }

  get release () {
    return this.ampEnvelope.release;
  }
}

export class Noise extends Voice {
  _length: number;

  constructor(context: OfflineAudioContext, gain: number) {
    super(context, "sawtooth", gain);
    this._length = 2;
  }

  get length () {
    return this._length || 2;
  }
  set length (value: number) {
    this._length = value;
  }

  init() {
    var lBuffer = new Float32Array(this.length * this.context.sampleRate);
    var rBuffer = new Float32Array(this.length * this.context.sampleRate);
    for(let i = 0; i < this.length * this.context.sampleRate; i++) {
      lBuffer[i] = 1-(2*Math.random());
      rBuffer[i] = 1-(2*Math.random());
    }
    let buffer = this.context.createBuffer(2, this.length * this.context.sampleRate, this.context.sampleRate);
    buffer.copyToChannel(lBuffer,0);
    buffer.copyToChannel(rBuffer,1);

    let osc = this.context.createBufferSource();
      osc.buffer = buffer;
      osc.loop = true;
      osc.loopStart = 0;
      osc.loopEnd = 2;
      osc.start(this.context.currentTime);
      osc.connect(this.ampEnvelope.output);

    // no idea ho this worked before
    (this.partials as unknown as AudioBufferSourceNode[]).push(osc);
  }

  on(event: MidiEvent) {
    this.value = event.value;
    this.ampEnvelope.on(event.velocity);
  }
}
