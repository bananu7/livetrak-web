import { useCallback, ChangeEvent, WheelEvent } from 'react'
import './Fader.css'

export type FaderProps = {
    value: number,
    setValue: (v: number) => void,
    color?: "none" | "red" | "blue";
}

const steps = 100;

export function Fader(props: FaderProps) {
    const onChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        const vol = Number(e.target.value);
        props.setValue(vol);
    }, [props.setValue]);

    const wheelHandler = useCallback((e: WheelEvent<HTMLDivElement>) => {
        const delta = e.deltaY / steps * 2;

        if ((e.deltaY < 0 && props.value < steps) ||
            (e.deltaY > 0 && props.value > 0))
        {
            let newVal = props.value - delta;
            newVal = newVal < 0 ? 0 : newVal;
            newVal = newVal > steps ? steps : newVal;
            props.setValue(newVal);
        }
    }, [props.value]);

    const className = "fader" + (props.color ? (" " + props.color) : "");

    return (
        <div className={className} onWheel={wheelHandler}>
            <input type="range" max={steps} value={props.value} onChange={onChange}></input>
        </div>
    );
}
