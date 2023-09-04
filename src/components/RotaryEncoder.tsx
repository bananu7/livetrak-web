import { useCallback, PropsWithChildren, CSSProperties, WheelEvent} from 'react'

export type RotaryEncoderProps = {
    color: string,
    zeroAtCenter?: boolean,
    value: number,
    setValue?: (v: number) => void,
}

export function RotaryEncoder(props: PropsWithChildren<RotaryEncoderProps>) {
    const zeroAtCenter = props.zeroAtCenter ?? true;

    const wheelHandler = useCallback((e: WheelEvent<HTMLDivElement>) => {
        // TODO react doesn't support active listeners?
        //e.preventDefault();
        if (!props.setValue)
            return;
        
        const delta = 0.05;

        const minVal = zeroAtCenter ? -1 : 0;

        if (e.deltaY < 0 && props.value < 1) {
            props.setValue(props.value + delta);
        } else if (e.deltaY > 0 && props.value > minVal) { // TODO make sure it never gets below minVal
            props.setValue(props.value - delta);
        }       
    }, [props.value]);

    return (
        <div className="rotaryWrapper" onWheel={wheelHandler}>
            <div style={{position: 'relative'}}>
                <div className={"rotary " + props.color}></div>
                <RotaryHalo value={props.value} zeroAtCenter={zeroAtCenter} />
            </div>
            <span>{props.children}</span>
        </div>
    );
}

function gradientFromCenter(v: number, color: string) {
    // normalized 1 = 135deg, -1 = 225deg
    if (v > 0) {
        const perc = v * 135;
        return `conic-gradient(${color} 0%, ${color} ${perc}deg, black ${perc}deg)`;
    } else {
        const perc = 360 + v * 135;
        return `conic-gradient(black 0%, black ${perc}deg, ${color} ${perc}deg)`;
    }
}

function gradientFromLeft(v: number, color: string) {
    const perc = v * 280;
    return `conic-gradient(from 220deg at 50% 50%, ${color} 0%, ${color} ${perc}deg, black ${perc}deg)`;
}

export function RotaryHalo(props: { value: number, zeroAtCenter: boolean }) {
    const background =
        props.zeroAtCenter
        ? gradientFromCenter(props.value, '#e3a127')
        : gradientFromLeft(props.value, '#e3a127');

    const style : CSSProperties = {
        width: '40px',
        height: '40px',
        background,
        borderRadius: '20px',
        border: '2px solid black',
        boxSizing: 'border-box',
    }
    return (
        <div style={style}>
        </div>
    )
}
