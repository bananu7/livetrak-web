const FILEBROWSER_URL_ROOT = 'https://home.banachewicz.pl/filebrowser/';

// Function to get the access token from the FileBrowser server
export async function getToken(): Promise<string> {
    console.log('Requesting access token...');

    try {
        const url = `${FILEBROWSER_URL_ROOT}api/login`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
            },
            body: JSON.stringify({
                username: 'baitreader',
                password: 'baitreader',
                recaptcha: ""
            })
        });
        return await response.text();
    } catch (error) {
        console.error('Error while requesting access token:', error);
        throw error;
    }
}

export function makeUrl(folder: string, name: string, token: string) {
    const path = `${FILEBROWSER_URL_ROOT}api/raw/${folder}/`;
    const auth = `auth=${token}`;
    const inline = 'inline=true';

    return `${path}${name}?${auth}&${inline}`;
}

export type File = {
    path: string,
    name: string,
    size: number,
    extension: string,
    modified: string, // UTC timestamp
    mode: number,
    isDir: boolean,
    isSymlink: boolean,
    type: string,
}

export async function getDirectoryContents(token: string): Promise<File[]> {
    try {
        const url = `${FILEBROWSER_URL_ROOT}api/resources/?auth=${token}`;
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
            }
        });
        const json = await response.json();
        return json.items;
    } catch (error) {
        console.error('Error in getDirectories:', error);
        throw error;
    }
}