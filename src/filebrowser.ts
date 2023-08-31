// Function to get the access token from the FileBrowser server
export async function getToken(): Promise<string> {
    console.log('Requesting access token...');

    try {
        const response = await fetch('https://home.banachewicz.pl/filebrowser/api/login', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
            },
            body: JSON.stringify({
                username: '',
                password: '',
                recaptcha: ""
            })
        });
        return await response.text();
    } catch (error) {
        console.error('Error while requesting access token:', error);
        throw error;
    }
}
