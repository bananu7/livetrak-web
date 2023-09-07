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

export type Directory = {
    name: string,
}

export async function getDirectories(token: string): Promise<Directory[]> {
    try {
        const url = `${FILEBROWSER_URL_ROOT}api/resources/?auth=${token}`;
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
            }
        });
        const json = await response.json();
        console.log(json);
        return json.items.map((i: any) => ({ name: i.name }));
    } catch (error) {
        console.error('Error in getDirectories:', error);
        throw error;
    }
}