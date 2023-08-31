import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

import { getToken } from './filebrowser'

import { TimingObject } from 'timing-object';
import { setTimingsrc } from 'timingsrc';

const makeUrl = function(name, token) {
    const path = 'https://home.banachewicz.pl/filebrowser/api/raw/230827_095441/'
    const auth = `auth=${token}`;
    const inline = 'inline=true';

    return `${path}${name}?${auth}&${inline}`;
}

// TODO global
const timingObject = new TimingObject();

const makeAudio = function(url, timingObject) {
    const elem = document.createElement('audio');
    elem.src = url;
    elem.style = "visibility: hidden;";
    document.body.appendChild(elem);

    setTimingsrc(elem, timingObject);

    return elem;
}

function App() {    
    const [sounds, setSounds] = useState(null);

    const setup = async () => {
        const token = await getToken();
        console.log(token);

        const urls = [
          'TRACK01.m4a',
          'TRACK02.m4a',
          'TRACK03.m4a',
          'TRACK04.m4a',
          'TRACK05.m4a',
          'TRACK06.m4a',
          'TRACK07.m4a',
          'TRACK08.m4a',
        ].map(name => makeUrl(name, token));

        const audios = urls.map(u => makeAudio(u, timingObject));
        setSounds(audios);
    }

    useEffect(() => {
        setup();
    }, []);        

    if (!sounds) {
        return <span>Loading...</span>;
    }
    //const channels = sounds.map(sound => <Channel sound={sound} name={"name"} />);

    return (
        <div>
            <button onClick={() => timingObject.update({ velocity: 1 })}>Play</button>
            <button onClick={() => timingObject.update({ velocity: 0 })}>Pause</button>
            <button onClick={() => timingObject.update({ position: 0, velocity: 0 })}>Stop</button>
            {/*}
            <Seeker sounds={sounds} seconds={700} />
            <div class="channels">
                {channels}
            </div>*/}
        </div>
    );
}

export default App;
