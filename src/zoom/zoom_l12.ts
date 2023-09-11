export type ZoomProjectData = {
    markers: ZoomMarker[];
}

export type ZoomMarker = number;

export type ProjectTimeSeconds = number;

export function zoomMarkerToTime(marker: ZoomMarker): ProjectTimeSeconds {
    const seconds = marker / 44100; // TODO read actual sample rate?
    return seconds;
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
