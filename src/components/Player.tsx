import { useState, useEffect, useCallback } from 'react'
import { AudioChannel } from './AudioChannel.tsx'
import { MasterChannel } from './MasterChannel.tsx'
import { FxChannel } from './FxChannel.tsx'
import { Transport } from './Transport.tsx'

import { AudioSystem } from '../audio'
import { makeUrl, getJsonFile } from '../filebrowser'
import { floatToTimestring } from '../util'

export type PlayerProps = {
    token: string,
    audioSystem: AudioSystem,
    folder: string,
}

type TrackMeta = { url: string, name: string }

const DEFAULT_TRACK_LIST = [
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

export function Player(props: PlayerProps) {
    const [tracks, setTracks] = useState<TrackMeta[]|null>(null);

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

    const setup = async () => {
        const trackListInFolder = await getJsonFile(props.token, props.folder, 'tracks.json');

        // no tracklist on the server, use default one
        const trackList = trackListInFolder ?? DEFAULT_TRACK_LIST;

        const trackListWithAuth = trackList.map((track: TrackMeta) => {
            return { url: makeUrl(props.folder, track.url, props.token), name: track.name };
        });
        setTracks(trackListWithAuth);

        updatePlaybackPosition();
    }

    useEffect(() => {
        setup();

        return () => { };
    }, [props.folder, props.token, props.audioSystem]);

    if (!tracks) {
        return <span>Loading tracks...</span>;
    }

    const channels = tracks.map((t: TrackMeta) => 
        <AudioChannel audioSystem={props.audioSystem} name={t.name} url={t.url} key={t.name} />
    );

    const masterChannelController = props.audioSystem.getMasterChannelController();
    const fxChannelController = props.audioSystem.getFxChannelController();

    return (
        <div className="player">
            <div className="channels">
                {channels}
                <FxChannel controller={fxChannelController} />
                <MasterChannel controller={masterChannelController} />
            </div>

            <div className="transport">
                <div className="screen">
                    <span className="inverted">{props.folder}</span>
                    <br />
                    <span id="playbackPosition"></span>
                </div>
                <Transport audioSystem={props.audioSystem} />
            </div>
        </div>
    );
}