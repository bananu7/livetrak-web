import { useState, useCallback, useRef } from 'react'
import { Channel, AudioStatus } from './Channel'
import { AudioSystem, ChannelController } from '../audio'

export type AudioProps = {
    audioSystem: AudioSystem,
    url: string,
    name: string,
}

// TODO add via react :)

export function AudioChannel(props: AudioProps) {
    const [status, setStatus] = useState<AudioStatus>('warning');
    const audioRef = useRef<HTMLAudioElement>();
    const deleterRef = useRef<() => void>();
    const [controller, setController] = useState<ChannelController|null>(null);

    const audioCreated = useCallback((htmlElement: HTMLAudioElement) => {
        if (audioRef.current && deleterRef.current) {
            setController(null);
            deleterRef.current();
            setStatus('warning');
        }

        audioRef.current = htmlElement;

        if (htmlElement) {
            const [ctrl, deleter] = props.audioSystem.makeAudio(htmlElement, props.name);
            setController(ctrl);
            setStatus('ok');
            deleterRef.current = deleter;
        }
    }, [props.audioSystem, props.url, props.name]);

    const channel = controller
        ? <Channel controller={controller} name={props.name} status={status}/>
        : null;

    const setStatusOk = useCallback(() => { setStatus('ok'); }, []);
    const setStatusWarning = useCallback(() => {setStatus('warning'); }, []);
    const setStatusError = useCallback(() => { setStatus('error'); }, []);

    return (
        <div>
            <audio
                src={props.url}
                ref={audioCreated}
                style={{visibility: 'hidden'}}
                muted={false}
                crossOrigin="anonymous"

                onLoadStart={setStatusWarning}
                onCanPlayThrough={setStatusOk}
                onSeeking={setStatusWarning}
                onSeeked={setStatusOk}
                onStalled={setStatusError}
                onWaiting={setStatusWarning}
            />
            {channel}
        </div>
    );
}
