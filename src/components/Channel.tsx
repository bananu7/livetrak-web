import { useState, useCallback } from 'react'
import { ChannelStrip } from './ChannelStrip.tsx'
import { ChannelController } from '../audio'
import { Fader } from './Fader'
import { MuteButton } from './MuteButton'
import { Meter } from './Meter'
import './Channel.css'

export type ChannelProps = {
    controller: ChannelController,
    name: string,
}

export function Channel(props: ChannelProps) {
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

    return (
        <div className="channelWrapper">
        <div className="channel">
            <ChannelStrip controller={props.controller} />
            <div className="recPlayWrapper"><button />ERR/PLAY</div>
            <div style={{width: '100%'}}>
                <MuteButton muted={muted} onClick={muteClick} />
            </div>
            <div style={{display: 'flex', marginLeft: '-10px'}}>
                <Fader setValue={setVolume} value={volume} />
                <Meter name={props.name} />
            </div>
            <span>{props.name}</span>
        </div>
        </div>
    );
}


