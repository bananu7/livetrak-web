export function floatToTimestring(f: number): string {
	const totalSeconds = Math.floor(f);
	const dec = f - totalSeconds;

	const hours = Math.floor(totalSeconds / 3600);
	const secondsWithoutHours = totalSeconds % 3600;

	const minutes = Math.floor(secondsWithoutHours / 60);
	const seconds = secondsWithoutHours % 60;

	const hoursStr = String(hours).padStart(2, '0');
	const minutesStr = String(minutes).padStart(2, '0');
	const secondsStr = String(seconds).padStart(2, '0');
	const decStr = (dec*100).toFixed(0).padStart(2, '0');

	return `${hoursStr} : ${minutesStr} : ${secondsStr} : ${decStr}`
}