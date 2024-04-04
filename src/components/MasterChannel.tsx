import { useState, useCallback } from 'react'
import { Fader } from './Fader'
import { MuteButton } from './MuteButton'
import { Meter } from './Meter'
import { SimpleChannelController } from '../audio'
import { dbToGain, faderPosToDb } from '../audio/util'

export type MasterChannelProps = {
    controller: SimpleChannelController,
}

export function MasterChannel(props: MasterChannelProps) {
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

        props.controller.setGain(gain);
    }, [props.controller]);

    const name = "MASTER";

    return (<div className="channel">
        <div /> {/* filler */}
        <div /> {/* filler */}
        <div style={{width: '100%'}}>
            <MuteButton muted={muted} onClick={muteClick} />
        </div>
        <div style={{display: 'flex', marginLeft: '-10px'}}>
            <Fader setValue={setVolume} value={volume} color={"red"} />
            <Meter name={name} />
        </div>
        <span>{name}</span>
    </div>);
}
