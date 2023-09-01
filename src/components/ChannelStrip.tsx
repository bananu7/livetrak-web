import { useState, useCallback } from 'react'
import { RotaryEncoder } from './RotaryEncoder'
import { ChannelController } from '../audio'

export type ChannelStripProps = {
    controller: ChannelController,
}

const EQ_DB_RANGE = 15;

export function ChannelStrip(props: ChannelStripProps) {
    // TODO probably shouldn't store that here
    const [fx, setFx] = useState(0);
    const [high, setHighState] = useState(0);
    const [low, setLowState] = useState(0);
    const [mid, setMidState] = useState(0);
    const [pan, setPan] = useState(0);

    const setHigh = useCallback(g => {
        setHighState(g);
        props.controller.setHighGain(g * EQ_DB_RANGE);
    }, [props.controller.setHighGain]);

    const setMid = useCallback(g => {
        setMidState(g);
        props.controller.setMidGain(g * EQ_DB_RANGE);
    }, [props.controller.setHighGain]);

    const setLow = useCallback(g => {
        setLowState(g);
        props.controller.setLowGain(g * EQ_DB_RANGE);
    }, [props.controller.setHighGain]);

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
