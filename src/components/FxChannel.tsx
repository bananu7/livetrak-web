import { useState, useCallback } from 'react'
import { Fader } from './Fader'
import { MuteButton } from './MuteButton'
import { Meter } from './Meter'
import { SimpleChannelController } from '../audio'

export type FxChannelProps = {
    controller: SimpleChannelController,
}

export function FxChannel(props: FxChannelProps) {
    const [muted, setMuted] = useState(false);
    const [volume, setVolumeState] = useState(100);
    const muteClick = useCallback(() => {
        setMuted(m => {
            props.controller.setMute(!m);
            return(!m)
        });
    }, [props.controller.setMute]);
    const setVolume = useCallback((vol: number) => {
        setVolumeState(vol);
        props.controller.setGain(vol / 100);
    }, [props.controller]);

    const name = "FX";

    return (<div className="channel">
        <div /> {/* filler */}
        <div /> {/* filler */}
        <div style={{width: '100%'}}>
            <MuteButton muted={muted} onClick={muteClick} />
        </div>
        <div style={{display: 'flex', marginLeft: '-10px'}}>
            <Fader setValue={setVolume} value={volume} color={"blue"} />
            <Meter name={name} />
        </div>
        <span>{name}</span>
    </div>);
}
