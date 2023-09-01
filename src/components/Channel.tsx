import { useState } from 'react'
import { ChannelStrip } from './ChannelStrip.tsx'
import { ChannelController } from '../audio'

export type ChannelProps = {
    controller: ChannelController,
    name: string,
}

export function Channel(props: ChannelProps) {
    const [muted, setMuted] = useState(false);
    const [volume, setVolume] = useState(100);

    return (<div className="channel">
        <ChannelStrip controller={props.controller} />
        <div>
            MUTE
            <input
                type="checkbox"
                checked={muted}
                onChange={e => {
                    const muted = e.target.checked;
                    setMuted(muted);
                    //controller.setMuted()
                }}
            >
            </input>
        </div>
        <div style={{display: 'flex'}}>
            <div className="fader">
                <input type="range" value={volume} onChange={(e) => {
                    const vol = Number(e.target.value);
                    setVolume(vol);
                    props.controller.setGain(vol / 100);                    
                }}></input>
            </div>
            <div id={`meter-${props.name}`} style={{backgroundColor: 'lime', width: '5px', float: 'right'}}></div>
        </div>
        <span>{props.name}</span>
    </div>);
}
