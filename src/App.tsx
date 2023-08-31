import { useState, useEffect } from 'react'
import './App.css'

import { getToken } from './filebrowser'

import { TimingObject } from 'timing-object';
import { setTimingsrc } from 'timingsrc';

const makeUrl = function(name: string, token: string) {
    const path = 'https://home.banachewicz.pl/filebrowser/api/raw/230827_095441/'
    const auth = `auth=${token}`;
    const inline = 'inline=true';

    return `${path}${name}?${auth}&${inline}`;
}

// TODO global
const timingObject = new TimingObject();
// TODO sound was created twice in debug mode, prolly need to clean up?
let alreadySetup = false;

const makeAudio = function(url: string, timingObject: any) {
    const elem = document.createElement('audio');
    elem.src = url;
    elem.style.cssText = "visibility: hidden;";
    elem.muted = false;
    elem.volume = 1.0;
    document.body.appendChild(elem);

    setTimingsrc(elem, timingObject);

    return elem;
}

type ChannelProps = {
    audio: HTMLMediaElement,
    name: string,
}

function Channel(props: ChannelProps) {
    const [muted, setMuted] = useState(false);
    const [volume, setVolume] = useState(100);

    return (<div className="channel">
        <input
            type="checkbox"
            checked={muted}
            onChange={e => {
                const muted = e.target.checked;
                console.log(`Setting mute of ${props.name} to ${muted}`);
                setMuted(muted);
                props.audio.muted = muted;
            }}
        >
        </input>
        <input type="range" value={volume} onChange={(e) => { 
            const vol = Number(e.target.value);
            setVolume(vol);
            props.audio.volume = vol / 100;
            console.log(vol, props.audio.volume)
        }}></input>
        <span>{props.name}</span>
    </div>);
}

function App() {    
    type Track = {
        audio: HTMLMediaElement,
        name: string,
    }

    const [tracks, setTracks] = useState<Track[]|null>(null);

    const setup = async () => {
        if (alreadySetup) {
            return;
        }
        alreadySetup = true;

        const token = await getToken();
        console.log(token);

        const trackList = [
            { url: 'TRACK01.m4a', name: "OHL" },
            { url: 'TRACK02.m4a', name: "OHR" },
            { url: 'TRACK03.m4a', name: "ST" },
            { url: 'TRACK04.m4a', name: "Git B" },
            { url: 'TRACK05.m4a', name: "Git Ł" },
            { url: 'TRACK06.m4a', name: "Bas K" },
            { url: 'TRACK07.m4a', name: "Bas A" },
            { url: 'TRACK08.m4a', name: "V" },
        ];

        const trackListWithAuth = trackList.map(track => {
            return { url: makeUrl(track.url, token), name: track.name };
        });

        const tracks = trackListWithAuth.map(t => {
            return { audio: makeAudio(t.url, timingObject), name: t.name };
        });
        setTracks(tracks);
        return tracks;
    }

    useEffect(() => {
        const objects = setup();

        // TODO cleanup
        return () => { };
    }, []);

    if (!tracks) {
        return <span>Loading...</span>;
    }

    const channels = tracks.map(track =>
        <Channel audio={track.audio} name={track.name} key={track.name}/>
    );

    const skipRelative = function(deltaSeconds: number) {
        const { position } = timingObject.query();
        timingObject.update({ position: position + deltaSeconds });
    };

    return (
        <div>
            <button onClick={() => skipRelative(-5) }>{"<<"}</button>
            <button onClick={() => timingObject.update({ velocity: 1 })}>Play</button>
            <button onClick={() => timingObject.update({ velocity: 0 })}>Pause</button>
            <button onClick={() => timingObject.update({ position: 0, velocity: 0 })}>Stop</button>
            <button onClick={() => skipRelative(5) }>{">>"}</button>
            
            <div className="channels">
                {channels}
            </div>
        </div>
    );
}

export default App;
