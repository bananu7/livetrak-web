import { CSSProperties, MouseEventHandler, PropsWithChildren } from 'react';
import { ProjectTimeSeconds } from '../zoom/zoom_l12';
import './Timeline.css'

export type TimelineProps = {
    markers: ProjectTimeSeconds[],
}

export function Timeline(props: TimelineProps) {
    let i = 0;
    const markers = props.markers.map(m => {
        const click = () => console.log(m);
        return (<Marker time={m} key={i++} onClick={click} />);
    });
    return(<div className="timeline">
        {markers}
    </div>);
}

export type MarkerProps = {
    time: ProjectTimeSeconds,
    onClick: MouseEventHandler<HTMLDivElement>,
}

export function Marker(props: MarkerProps) {
    const projectLength = 7200; // TODO hardcoded to 2h for now
    const style: CSSProperties = {
        left: props.time / projectLength * 100 + '%', 
    };

    return (
        <div className="marker" style={style} onClick={props.onClick}>
            <MarkerTooltip name="Zoom Marker" time={props.time}>
            This marker has been imported from the PRJDATA.ZDT file and can't be edited.
            </MarkerTooltip>
        </div>
    )
}

export type MarkerTooltipProps = {
    name: string,
    time: ProjectTimeSeconds,
}

function formatProjectTime(time: PropsWithChildren<ProjectTimeSeconds>) {
    const hours = Math.floor(time / 3600);
    time -= hours * 3600;
    const minutes = Math.floor(time / 60);
    time -= minutes * 60;
    return `${hours}:${minutes}:${Math.floor(time)}`;
}

export function MarkerTooltip(props: MarkerTooltipProps) {
    return (
        <div className="tooltip">
            <h1>{props.name}</h1>
            <span>{formatProjectTime(props.time)}</span>
            <p>{props.children}</p>
        </div>
    );
}