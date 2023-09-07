import { useState, useEffect, useCallback } from 'react'
import { Channel } from './Channel.tsx'
import { MasterChannel } from './MasterChannel.tsx'
import { FxChannel } from './FxChannel.tsx'
import { Transport } from './Transport.tsx'

import { AudioSystem, ChannelController } from '../audio'
import { makeUrl } from '../filebrowser'
import { floatToTimestring } from '../util'

export type PlayerProps = {
    token: string,
    audioSystem: AudioSystem,
    folder: string,
}

type Track = {
    controller: ChannelController,
    name: string,
}

export function Player(props: PlayerProps) {
    const [tracks, setTracks] = useState<Track[]|null>(null);

    const updatePlaybackPosition = useCallback(() => {
        const playbackPos = document.getElementById('playbackPosition');
        if (!playbackPos) {
            requestAnimationFrame(updatePlaybackPosition);
            return;
        }

        const { position } = props.audioSystem.query();
        playbackPos.innerText = floatToTimestring(position);
        requestAnimationFrame(updatePlaybackPosition);
    }, [props.audioSystem]);

    useEffect(() => {
        const trackList = [
            { url: 'TRACK01.m4a', name: "OHL" },
            { url: 'TRACK02.m4a', name: "OHR" },
            { url: 'TRACK03.m4a', name: "ST" },
            { url: 'TRACK04.m4a', name: "Git B" },
            { url: 'TRACK05.m4a', name: "Git Ł" },
            { url: 'TRACK06.m4a', name: "Bas K" },
            { url: 'TRACK07.m4a', name: "Bas A" },
            { url: 'TRACK08.m4a', name: "V" },
            { url: 'TRACK09_10.m4a', name: "Keys" },
        ];

        const trackListWithAuth = trackList.map(track => {
            return { url: makeUrl(props.folder, track.url, props.token), name: track.name };
        });

        const tracks = trackListWithAuth.map(t => {
            return { controller: props.audioSystem!.makeAudio(t.url, t.name), name: t.name };
        });
        setTracks(tracks);

        updatePlaybackPosition();

        // TODO cleanup
        return () => { };
    }, [props.folder, props.token, props.audioSystem]);

    if (!tracks) {
        return <span>Loading tracks...</span>;
    }

    const channels = tracks.map(track =>
        <Channel controller={track.controller} name={track.name} key={track.name}/>
    );

    const masterChannelController = props.audioSystem.getMasterChannelController();
    const fxChannelController = props.audioSystem.getFxChannelController();

    return (
        <div>
            <div className="transport">
                <div className="screen">
                    <span className="inverted">{props.folder}</span>
                    <br />
                    <span id="playbackPosition"></span>
                </div>
                <Transport audioSystem={props.audioSystem} />
            </div>

            <div className="channels">
                {channels}
                <FxChannel controller={fxChannelController} />
                <MasterChannel controller={masterChannelController} />
            </div>
        </div>
    );
}