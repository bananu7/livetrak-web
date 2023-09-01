import { useState, useEffect } from 'react'
import './App.css'

import { getToken } from './filebrowser'
import { floatToTimestring } from './util'
import { Channel } from './components/Channel.tsx'
import { AudioSystem, ChannelController } from './audio'

const FOLDER_NAME = '230827_095441';

const makeUrl = function(name: string, token: string) {
    const path = `https://home.banachewicz.pl/filebrowser/api/raw/${FOLDER_NAME}/`;
    const auth = `auth=${token}`;
    const inline = 'inline=true';

    return `${path}${name}?${auth}&${inline}`;
}

// TODO sound was created twice in debug mode, prolly need to clean up?
let alreadySetup = false;
let audioSystem : AudioSystem|null = null;

function App() {
    type Track = {
        controller: ChannelController,
        name: string,
    }

    const [tracks, setTracks] = useState<Track[]|null>(null);

    const setup = async () => {
        if (alreadySetup) {
            return;
        }
        alreadySetup = true;
        audioSystem = new AudioSystem();

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
            { url: 'TRACK09_10.m4a', name: "Keys" },
        ];

        const trackListWithAuth = trackList.map(track => {
            return { url: makeUrl(track.url, token), name: track.name };
        });

        const tracks = trackListWithAuth.map(t => {
            return { controller: audioSystem!.makeAudio(t.url, t.name), name: t.name };
        });
        setTracks(tracks);
        return tracks;
    }

    const updatePlaybackPosition = () => {
        if (!audioSystem)
            return;

        const playbackPos = document.getElementById('playbackPosition');
        if (!playbackPos) {
            requestAnimationFrame(updatePlaybackPosition);
            return;
        }

        const { position } = audioSystem.query();
        playbackPos.innerText = floatToTimestring(position);
        requestAnimationFrame(updatePlaybackPosition);
    }

    useEffect(() => {
        setup();
        updatePlaybackPosition();

        // TODO cleanup
        return () => { };
    }, []);



    if (!tracks) {
        return <span>Loading...</span>;
    }

    const channels = tracks.map(track =>
        <Channel controller={track.controller} name={track.name} key={track.name}/>
    );

    const play = function() {
        if (!audioSystem)
            return;
        audioSystem.resume();
        audioSystem.update({ velocity: 1 })
    }

    const pause = function() {
        if (!audioSystem)
            return;
        audioSystem.update({ velocity: 0 })
    }

    const stop = function() {
        if (!audioSystem)
            return;
        audioSystem.update({ position: 0, velocity: 0 })
    }

    const skipRelative = function(deltaSeconds: number) {
        if (!audioSystem)
            return;
        const { position } = audioSystem.query();
        audioSystem.update({ position: position + deltaSeconds });
    };

    return (
        <div>
            <div className="transport">
                <div className="screen">
                    <span className="inverted">{FOLDER_NAME}</span>
                    <br />
                    <span id="playbackPosition"></span>
                </div>
                <div>
                    <button onClick={() => skipRelative(-600) }>&minus;10m</button>
                    <button onClick={() => skipRelative(-60) }>&minus;1m</button>
                    <button onClick={() => skipRelative(-5) }>⏪</button>
                    <button onClick={() => play()}>⏵</button>
                    <button onClick={() => pause()}>⏸</button>
                    <button onClick={() => stop()}>⏹</button>
                    <button onClick={() => skipRelative(5) }>⏩</button>
                    <button onClick={() => skipRelative(60) }>+1m</button>
                    <button onClick={() => skipRelative(600) }>+10m</button>
                </div>
            </div>

            <div className="channels">
                {channels}
            </div>
        </div>
    );
}

export default App;
