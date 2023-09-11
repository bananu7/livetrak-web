import './Timeline.css'
import { ProjectTime } from '../zoom/zoom_l12';
import { CSSProperties, MouseEventHandler } from 'react';

export type TimelineProps = {
    markers: ProjectTime[],
}

export function Timeline(props: TimelineProps) {
    let i = 0;
    const markers = props.markers.map(m => {
        const click = () => console.log(m.hours, m.minutes, m.seconds);
        return (<Marker time={m} key={i++} onClick={click} />);
    });
    return(<div className="timeline">
        {markers}
    </div>);
}

export type MarkerProps = {
    time: ProjectTime,
    onClick: MouseEventHandler<HTMLDivElement>,
}

export function Marker(props: MarkerProps) {
    const secondsSinceStart = props.time.hours * 3600 + props.time.minutes * 60 + props.time.seconds;

    const style: CSSProperties = {
        position: 'absolute',
        left: secondsSinceStart / 7200 * 100 + '%', // 2h max
        top: '50%',
        backgroundColor: '#4ec144',
        border: '3px solid #276122',
        boxSizing: 'border-box',
        width: '30px',
        height: '30px',
        borderRadius: '15px',
        cursor: 'pointer',
    }
    return (
        <div style={style} onClick={props.onClick}></div>
    )
}
