import { ProjectTimeSeconds } from './zoom_l12'

export function formatProjectTime(time: ProjectTimeSeconds) {
    const hours = Math.floor(time / 3600);
    time -= hours * 3600;
    const minutes = Math.floor(time / 60);
    time -= minutes * 60;
    return `${hours}:${minutes}:${Math.floor(time)}`;
}
