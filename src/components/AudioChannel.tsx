import { useState, useCallback, useRef } from 'react'
import { Channel } from './Channel'
import { AudioSystem, ChannelController } from '../audio'

export type AudioProps = {
    audioSystem: AudioSystem,
    url: string,
    name: string,
}

// TODO add via react :)
/*
htmlElement.addEventListener('seeking', _event => {
    console.log('media element seeking');
});

htmlElement.addEventListener('seeked', _event => {
    console.log('media element seeked');
});

htmlElement.addEventListener('stalled', _event => {
    console.warn('media element stalled');
});*/

export function AudioChannel(props: AudioProps) {
    const audioRef = useRef<HTMLAudioElement>();
    const deleterRef = useRef<() => void>();
    const [controller, setController] = useState<ChannelController|null>(null);

    const audioCreated = useCallback((htmlElement: HTMLAudioElement) => {
        if (audioRef.current && deleterRef.current) {
            console.log("deleting audio")
            setController(null);
            deleterRef.current();
        }

        audioRef.current = htmlElement;

        if (htmlElement) {
            console.log("making audio")
            const [ctrl, deleter] = props.audioSystem.makeAudio(htmlElement, props.name);
            setController(ctrl);
            deleterRef.current = deleter;
        }
    }, [props.audioSystem, props.url, props.name]);

    const channel = controller ? 
        <Channel controller={controller} name={props.name}/> :
        null;

    return (
        <div>
            <audio
                src={props.url}
                ref={audioCreated}
                style={{visibility: 'hidden'}}
                muted={false}
                crossOrigin="anonymous"
            />
            {channel}
        </div>
    );
}
