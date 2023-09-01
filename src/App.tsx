import { useState, useEffect } from 'react'
import './App.css'

import { getToken } from './filebrowser'
import { floatToTimestring } from './util'

import { TimingObject } from 'timing-object';
import { setTimingsrc } from 'timingsrc';

const FOLDER_NAME = '230827_095441';

const makeUrl = function(name: string, token: string) {
    const path = `https://home.banachewicz.pl/filebrowser/api/raw/${FOLDER_NAME}/`;
    const auth = `auth=${token}`;
    const inline = 'inline=true';

    return `${path}${name}?${auth}&${inline}`;
}

// TODO global
console.log("Initializing globals")
const timingObject = new TimingObject();
const audioContext = new AudioContext();
// TODO sound was created twice in debug mode, prolly need to clean up?
let alreadySetup = false;

const makeAudio = function(url: string, timingObject: any, name: string) {
    const elem = document.createElement('audio');
    elem.src = url;
    elem.style.cssText = "visibility: hidden;";
    elem.muted = false;
    elem.volume = 1.0;
    elem.crossOrigin = "anonymous";
    document.body.appendChild(elem);

    setTimingsrc(elem, timingObject);

    /* add measurement node for lights */
    const node = audioContext.createMediaElementSource(elem);
    const gainNode = audioContext.createGain();
    const analyser = audioContext.createAnalyser();

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    function calculateVolume() {
        analyser.getByteFrequencyData(dataArray)

        let sum = 0;
        for (const amplitude of dataArray) {
          sum += amplitude * amplitude
        }

        const volume = Math.sqrt(sum / dataArray.length)

        const meter = document.getElementById(`meter-${name}`);
        if (meter)
            meter.style.height = `${volume}%`;
        requestAnimationFrame(calculateVolume)
    }
    calculateVolume();

    gainNode.gain.value = 1.0;
    node.connect(gainNode);
    node.connect(analyser)
    gainNode.connect(audioContext.destination);

    return elem;
}

type ChannelProps = {
    audio: HTMLMediaElement,
    name: string,
}

function ChannelStrip() {
  return (<div className="strip">
    <button>EQ OFF</button>
    <div className="rotary blue">SEND EFX</div>
    <div className="rotary red">PAN</div>
    <button className="toggled">LOW CUT</button>
    <div className="rotary green">HIGH</div>
    <div className="rotary green">FREQ</div>
    <div className="rotary green">MID</div>
    <div className="rotary green">LOW</div>
  </div>);
}

function Channel(props: ChannelProps) {
    const [muted, setMuted] = useState(false);
    const [volume, setVolume] = useState(100);

    return (<div className="channel">
        <ChannelStrip />
        <div>
            MUTE
            <input
                type="checkbox"
                checked={muted}
                onChange={e => {
                    const muted = e.target.checked;
                    setMuted(muted);
                    props.audio.muted = muted;
                }}
            >
            </input>
        </div>
        <div style={{display: 'flex'}}>
            <div className="fader">
                <input type="range" value={volume} onChange={(e) => {
                    const vol = Number(e.target.value);
                    setVolume(vol);
                    props.audio.volume = vol / 100;
                }}></input>
            </div>
            <div id={`meter-${props.name}`} style={{backgroundColor: 'lime', width: '5px', float: 'right'}}></div>
        </div>
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
            return { audio: makeAudio(t.url, timingObject, t.name), name: t.name };
        });
        setTracks(tracks);
        return tracks;
    }

    const updatePlaybackPosition = () => {
        const playbackPos = document.getElementById('playbackPosition');
        if (!playbackPos) {
            requestAnimationFrame(updatePlaybackPosition);
            return;
        }

        const { position } = timingObject.query();
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
        <Channel audio={track.audio} name={track.name} key={track.name}/>
    );

    const play = function() {
        audioContext.resume();
        timingObject.update({ velocity: 1 })
    }

    const skipRelative = function(deltaSeconds: number) {
        const { position } = timingObject.query();
        timingObject.update({ position: position + deltaSeconds });
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
                    <button onClick={() => skipRelative(-5) }>⏪</button>
                    <button onClick={() => play()}>⏵</button>
                    <button onClick={() => timingObject.update({ velocity: 0 })}>⏸</button>
                    <button onClick={() => timingObject.update({ position: 0, velocity: 0 })}>⏹</button>
                    <button onClick={() => skipRelative(5) }>⏩</button>
                </div>
            </div>

            <div className="channels">
                {channels}
            </div>
        </div>
    );
}

export default App;
