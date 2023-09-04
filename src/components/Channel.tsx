import { useState, useCallback } from 'react'
import { ChannelStrip } from './ChannelStrip.tsx'
import { ChannelController } from '../audio'
import { Fader } from './Fader'

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

    return (<div className="channel">
        <ChannelStrip controller={props.controller} />
        <div>
            <MuteButton muted={muted} onClick={muteClick} />
        </div>
        <div style={{display: 'flex'}}>
            <Fader setValue={setVolume} value={volume} />
            <div className="meterWrapper">
                <div id={`meter-${props.name}`} style={{backgroundColor: 'lime', width: '5px', float: 'right', boxShadow: '0px 0px 10px lime'}}></div>
            </div>
        </div>
        <span>{props.name}</span>
    </div>);
}

export function MuteButton(props: { muted: boolean, onClick: () => void }) {
    return (
        <div style={{width: '50%', float: 'right', display: 'flex', alignItems: 'center', flexDirection: 'column', fontSize: '12px'}}>
            <button
                className={props.muted ? "toggledRed" : ""}
                onClick={props.onClick}
                style={{width: '30px', height: '30px'}}
            >
            </button>
            MUTE
        </div>
    )
}