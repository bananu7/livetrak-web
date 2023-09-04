import { useCallback, ChangeEvent } from 'react'

export type FaderProps = {
    value: number,
    setValue: (v: number) => void,
    color?: "none" | "red" | "blue";
}

export function Fader(props: FaderProps) {
    const onChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        const vol = Number(e.target.value);
        props.setValue(vol);
    }, [props.setValue]);


    const className = "fader" + (props.color ? (" " + props.color) : "");

    return (
        <div className={className}>
            <input type="range" value={props.value} onChange={onChange}></input>
        </div>
    );
}
