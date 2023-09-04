import { useCallback } from 'react'
import { AudioSystem } from '../audio'

export type TransportProps = {
    audioSystem: AudioSystem,
}

export function Transport(props: TransportProps) {
    const audioSystem = props.audioSystem;
    const play = useCallback(() => {
        if (!audioSystem)
            return;
        audioSystem.resume();
        audioSystem.update({ velocity: 1 })
    }, [audioSystem]);

    const pause = useCallback(() => {
        if (!audioSystem)
            return;
        audioSystem.update({ velocity: 0 })
    }, [audioSystem]);

    const stop = useCallback(() => {
        if (!audioSystem)
            return;
        audioSystem.update({ position: 0, velocity: 0 })
    }, [audioSystem]);

    const skipRelative = useCallback((deltaSeconds: number) => {
        if (!audioSystem)
            return;
        const { position } = audioSystem.query();

        let newPosition = position + deltaSeconds;
        if (newPosition < 0)
            newPosition = 0;

        audioSystem.update({ position: newPosition });
    }, [audioSystem]);

    return (
        <div>
            <button onClick={() => skipRelative(-600) }>&minus;10m</button>
            <button onClick={() => skipRelative(-60) }>&minus;1m</button>
            <button onClick={() => skipRelative(-5) }>⏪</button>
            <button onClick={() => play()}>⏵</button>
            <button onClick={() => pause()}>⏸</button>
            <button onClick={() => stop()}>⏹</button>
            <button onClick={() => skipRelative(5) }>⏩</button>
            <button onClick={() => skipRelative(60) }>+1m</button>
            <button onClick={() => skipRelative(600) }>+10m</button>
        </div>
    );
}
