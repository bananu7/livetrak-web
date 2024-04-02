import { useState, useEffect, useCallback, useLayoutEffect } from 'react'
import { AudioChannel } from './AudioChannel.tsx'
import { MasterChannel } from './MasterChannel.tsx'
import { FxChannel } from './FxChannel.tsx'
import { Transport } from './Transport.tsx'
import { Timeline } from './Timeline.tsx'

import { AudioSystem } from '../audio'
import { makeUrl, getJsonFile, getFile } from '../filebrowser'
import { floatToTimestring } from '../util'
import { formatProjectTime } from '../zoom/formatProjectTime'

import './Player.css'

import { ZoomProjectData, binaryZdtToProjectData, zoomMarkerToTime, ProjectTimeSeconds } from '../zoom/zoom_l12.ts'

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

async function getZoomProjectData(token: string, folder: string): Promise<ZoomProjectData> {
    const zoomProjectDataFetch = await getFile(token, folder, 'PRJDATA.ZDT');
    const blob = await zoomProjectDataFetch.blob();
    const buffer = await blob.arrayBuffer();
    const view = new DataView(buffer);

    const data = binaryZdtToProjectData(view);
    return data;
}

export function Player(props: PlayerProps) {
    const [tracks, setTracks] = useState<TrackMeta[]|null>(null);
    const [displayedProjectTime, setDisplayedProjectTime] = useState<ProjectTimeSeconds>(0);
    const [markers, setMarkers] = useState<ProjectTimeSeconds[]>([]);

    const setup = useCallback(async () => {
        const trackListInFolder = await getJsonFile(props.token, props.folder, 'tracks.json');
        const zoomProjectData = await getZoomProjectData(props.token, props.folder);
        setMarkers(zoomProjectData.markers.map(zoomMarkerToTime));

        // no tracklist on the server, use default one
        const trackList = trackListInFolder ?? DEFAULT_TRACK_LIST;

        const trackListWithAuth = trackList.map((track: TrackMeta) => {
            return { url: makeUrl(props.folder, track.url, props.token), name: track.name };
        });
        setTracks(trackListWithAuth);

    }, [props.token, props.folder]);

    useEffect(() => {
        setup();

        return () => { };
    }, [props.folder, props.token, props.audioSystem, setup]);

    // TODO - useRafLoop
    useLayoutEffect(() => {
        const i = setInterval(() => {
            const { position } = props.audioSystem.query();
            setDisplayedProjectTime(position);
        }, 100);
        return () => clearInterval(i);
    }, [props.audioSystem]);

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
            <div style={{display:'flex'}}>
                <div className="channels">
                    {channels}
                    <FxChannel controller={fxChannelController} />
                    <MasterChannel controller={masterChannelController} />
                </div>

                <div className="transport">
                    <div className="screen">
                        <span className="inverted">{props.folder}</span>
                        <br />
                        <span id="playbackPosition">{floatToTimestring(displayedProjectTime)}</span>
                    </div>
                    <Transport audioSystem={props.audioSystem} />
                    <div className="markerList" style={{flexGrow: 1}}>
                        <ul>
                            {markers.map(m => <li key={m}><div className="dot"/>{formatProjectTime(m)}</li>)}
                        </ul>
                    </div>
                </div>
            </div>

            <Timeline
                markers={markers}
                projectTime={displayedProjectTime}
                projectLength={2 * 60 * 60}
                setProjectTime={(t) => props.audioSystem.update({ position: t})}
            />
        </div>
    );
}
