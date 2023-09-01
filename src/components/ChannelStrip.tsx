import { useState } from 'react'
import { RotaryEncoder } from './RotaryEncoder'

export function ChannelStrip() {
    // TODO example values
    const [fx, setFx] = useState(0.1);
    const [high, setHigh] = useState(0.1);
    const [low, setLow] = useState(-0.5);
    const [mid, setMid] = useState(0);
    const [pan, setPan] = useState(-1.0);

    return (<div className="strip">
        <button className="toggled">EQ OFF</button>
        <RotaryEncoder value={fx} setValue={setFx} zeroAtCenter={false} color="blue">FX</RotaryEncoder>
        <RotaryEncoder value={pan} setValue={setPan} color="red">PAN</RotaryEncoder>
        <button>LOW CUT</button>
        <RotaryEncoder value={high} setValue={setHigh} color="green">HIGH</RotaryEncoder>
        {/* TODO freq is a special case */}
        <RotaryEncoder value={0} color="green">FREQ</RotaryEncoder>
        <RotaryEncoder value={mid} setValue={setMid} color="green">MID</RotaryEncoder>
        <RotaryEncoder value={low} setValue={setLow} color="green">LOW</RotaryEncoder>
    </div>);
}
