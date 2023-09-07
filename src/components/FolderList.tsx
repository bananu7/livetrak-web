import { useState, useEffect } from 'react'
import { getDirectories, Directory } from '../filebrowser'

export function FolderList(props: {token: string}) {
    const [dirs, setDirs] = useState<Directory[]>([]);
    const fetchDirs = async () => {
        setDirs(await getDirectories(props.token));
    };

    useEffect(() => {
        fetchDirs();
    }, []);

    const dirlis = dirs.map(d =>
        <li key={d.name}>{d.name}</li>
    );

    return (
        <div>
            <ul>
                {dirlis}
            </ul>
        </div>
    );
}
