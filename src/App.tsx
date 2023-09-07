import { useState, useEffect } from 'react'
import './App.css'

import { getToken, makeUrl } from './filebrowser'
import { floatToTimestring } from './util'
import { Channel } from './components/Channel.tsx'
import { MasterChannel } from './components/MasterChannel.tsx'
import { FxChannel } from './components/FxChannel.tsx'
import { Transport } from './components/Transport.tsx'
import { FolderList } from './components/FolderList.tsx'
import { AudioSystem, ChannelController } from './audio'

const FOLDER_NAME = '230827_095441';

// TODO sound was created twice in debug mode, prolly need to clean up?
let alreadySetup = false;
let audioSystem : AudioSystem|null = null;

function App() {
    type Track = {
        controller: ChannelController,
        name: string,
    }

    const [tracks, setTracks] = useState<Track[]|null>(null);
    const [token, setToken] = useState<string|null>(null);

    const setup = async () => {
        if (alreadySetup) {
            return;
        }
        alreadySetup = true;
        audioSystem = new AudioSystem();

        const token = await getToken();
        setToken(token);

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
            return { url: makeUrl(FOLDER_NAME, track.url, token), name: track.name };
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

    if (!token) {
        return <span>Getting token...</span>;
    }

    if (!tracks || !audioSystem) {
        return <span>Loading...</span>;
    }

    const channels = tracks.map(track =>
        <Channel controller={track.controller} name={track.name} key={track.name}/>
    );

    const masterChannelController = audioSystem.getMasterChannelController();
    const fxChannelController = audioSystem.getFxChannelController();

    return (
        <div>
            <FolderList token={token} />
            <div className="transport">
                <div className="screen">
                    <span className="inverted">{FOLDER_NAME}</span>
                    <br />
                    <span id="playbackPosition"></span>
                </div>
                <Transport audioSystem={audioSystem} />
            </div>

            <div className="channels">
                {channels}
                <FxChannel controller={fxChannelController} />
                <MasterChannel controller={masterChannelController} />
            </div>
        </div>
    );
}

export default App;
