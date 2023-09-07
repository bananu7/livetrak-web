import { useState, useEffect } from 'react'
import './App.css'

import { getToken } from './filebrowser'
import { FolderList } from './components/FolderList.tsx'
import { Player } from './components/Player.tsx'
import { AudioSystem } from './audio'

// TODO sound was created twice in debug mode, prolly need to clean up?
let alreadySetup = false;
let audioSystem : AudioSystem|null = null;

function App() {
    const [token, setToken] = useState<string|null>(null);
    const [folder, _setFolder] = useState<string|null>(null);

    const setup = async () => {
        if (alreadySetup) {
            return;
        }
        alreadySetup = true;
        audioSystem = new AudioSystem();

        const token = await getToken();
        setToken(token);
    }

    useEffect(() => {
        setup();

        // TODO cleanup
        return () => { };
    }, []);

    if (!token) {
        return <span>Getting token...</span>;
    }

    if (!audioSystem) {
        return <span>Creating audio system...</span>;
    }

    if (!folder) {
        return (<FolderList token={token} />);
    } else {
        return (<Player token={token} audioSystem={audioSystem} folder={folder} />);
    }
}

export default App;
