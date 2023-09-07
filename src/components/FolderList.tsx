import { useState, useEffect } from 'react'
import { getDirectories, Directory } from '../filebrowser'
import './FolderList.css'

export type FolderListProps = {
    token: string,
    pickFolder: (folder: string) => void,
}

export function FolderList(props: FolderListProps) {
    const [dirs, setDirs] = useState<Directory[]>([]);
    const fetchDirs = async () => {
        setDirs(await getDirectories(props.token));
    };

    useEffect(() => {
        fetchDirs();
    }, []);

    const dirlis = dirs.map(d =>
        <li onClick={() => props.pickFolder(d.name)} key={d.name}>{d.name}</li>
    );

    return (
        <ul>
            {dirlis}
        </ul>
    );
}
