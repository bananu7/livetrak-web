export type ZoomProjectData = {
    markers: ZoomMarker[];
}

export type ZoomMarker = number;

export type ProjectTime = {
    hours: number,
    minutes: number;
    seconds: number;
}

export function zoomMarkerToTime(marker: ZoomMarker): ProjectTime {
    const allSeconds = marker / 44100;
    const hours = Math.floor(allSeconds / 3600);
    const allSecondsWithoutHours = allSeconds - hours * 3600;

    const minutes = Math.floor(allSecondsWithoutHours / 60);
    const allSecondsLeft = allSecondsWithoutHours - minutes * 60

    return {
        hours,
        minutes,
        seconds: allSecondsLeft
    }
}

export function binaryZdtToProjectData(view: DataView): ZoomProjectData {
    const markers: ZoomMarker[] = [];
    for (let i = 0x05D0; i < 0x05D0 + 99 * 8; i += 8) {
        const l = view.getUint32(i, true);
        const h = view.getUint32(i+4, true);

        // all zeroes means end of markers
        if (l === 0 && h === 0)
            break;

        markers.push(l); // h seems to always be 0
    }

    return {
        markers
    }
}
