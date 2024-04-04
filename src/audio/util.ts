export type Decibels = number;

export function dbToGain(db: Decibels): number {
    return Math.pow(10, (db / 20));
}

export function faderPosToDb(pos: number): Decibels {
    // TODO: parametrize those properly
    // 80 is at 0dB
    pos -= 80;
    // each step is 0.5dB
    pos /= 2;
    
    return pos;
}
