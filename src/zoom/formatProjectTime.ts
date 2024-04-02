import { ProjectTimeSeconds } from './zoom_l12'

function padWithZero(n) {
    if (n < 10) {
        return `0${n}`;
    } else {
        return `${n}`;
    }
}

export function formatProjectTime(time: ProjectTimeSeconds) {
    const hours = Math.floor(time / 3600);
    time -= hours * 3600;
    const minutes = Math.floor(time / 60);
    time -= minutes * 60;
    return `${padWithZero(hours)}:${padWithZero(minutes)}:${padWithZero(Math.floor(time))}`;
}
