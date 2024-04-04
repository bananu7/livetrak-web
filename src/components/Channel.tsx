import { useState, useCallback } from 'react'
import { ChannelStrip } from './ChannelStrip.tsx'
import { ChannelController } from '../audio'
import { Fader } from './Fader'
import { MuteButton } from './MuteButton'
import { Meter } from './Meter'
import { dbToGain, faderPosToDb } from '../audio/util'
import './Channel.css'

export type AudioStatus = "ok" | "warning" | "error";

export type ChannelProps = {
    controller: ChannelController,
    name: string,
    status: AudioStatus,
}

export function Channel(props: ChannelProps) {
    const [muted, setMuted] = useState(false);
    const [volume, setVolumeState] = useState(80);

    const muteClick = useCallback(() => {
        setMuted(m => {
            props.controller.setMute(!m);
            return(!m)
        });
    }, [props.controller.setMute]);

    const setVolume = useCallback((vol: number) => {
        setVolumeState(vol);

        const db = faderPosToDb(vol);
        const gain = dbToGain(db);
        console.log(`Setting gain for ${props.name} to ${gain}, dB = ${db}, pos=${vol}`)

        props.controller.setGain(gain);
    }, [props.controller]);

    const statusClass = {'ok':'toggledGreen', 'warning':'toggledYellow', 'error':'toggledRed'}[props.status];

    return (
        <div className="channelWrapper">
        <div className="channel">
            <ChannelStrip controller={props.controller} />
            <div className={"recPlayWrapper"}><button className={statusClass}/>ERR / PLAY</div>
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


