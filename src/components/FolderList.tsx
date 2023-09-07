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
        const dirs = await getDirectories(props.token);
        dirs.sort((a,b) => {
            if (a.name > b.name) {
                return -1;
            }
            if (b.name > a.name) {
                return 1;
            }
            return 0;
        });
        setDirs(dirs);
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
