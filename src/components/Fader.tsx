import { useCallback, ChangeEvent } from 'react'

export type FaderProps = {
    value: number,
    setValue: (v: number) => void,
}

export function Fader(props: FaderProps) {
    const onChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        const vol = Number(e.target.value);
        props.setValue(vol);
    }, [props.setValue]);

    return (
        <div className="fader">
            <input type="range" value={props.value} onChange={onChange}></input>
        </div>
    );
}
