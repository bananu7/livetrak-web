import { useState, useEffect } from 'react'

export type RotaryEncoderProps = {
    color: string,
    zeroAtCenter: boolean,
    value: value,
    setValue?: (v: number) => void,
    children: React.Element|React.Element[],
}

export function RotaryEncoder(props: RotaryEncoderProps) {
    return (
        <div className="rotaryWrapper">
            <div style={{position: 'relative'}}>
                <div className={"rotary " + props.color}></div>
                <RotaryHalo value={props.value} zeroAtCenter={props.zeroAtCenter} />
            </div>
            <span>{...props.children}</span>
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

}

export function RotaryHalo(props: { value: number, zeroAtCenter: boolean }) {
    const background =
        props.zeroAtCenter
        ? gradientFromCenter(props.value, '#e3a127')
        : gradientFromLeft(props.value, '#e3a127');

    const style = {
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
