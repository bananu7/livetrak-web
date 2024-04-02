import { CSSProperties, MouseEventHandler, PropsWithChildren } from 'react';
import { ProjectTimeSeconds } from '../zoom/zoom_l12';
import { formatProjectTime } from '../util';
import './Timeline.css'

export type TimelineProps = {
    markers: ProjectTimeSeconds[],
    readonly projectTime: ProjectTimeSeconds,
    readonly projectLength: ProjectTimeSeconds,
    setProjectTime: (time: ProjectTimeSeconds) => void,
}

export function Timeline(props: TimelineProps) {
    let i = 0;
    const markers = props.markers.map(m => {
        const click = () => props.setProjectTime(m);
        return (<Marker time={m} key={i++} onClick={click} projectLength={ props.projectLength } />);
    });
    return(
        <div className="timelineWrapper">
            <div className="timeline">
                {markers}
                <Scrubber projectTime={ props.projectTime } projectLength={ props.projectLength }/>
            </div>
        </div>
    );
}

export type ScrubberProps = {
    readonly projectTime: ProjectTimeSeconds,
    readonly projectLength: ProjectTimeSeconds,
}

export function Scrubber(props: ScrubberProps) {
    const projectPercent = props.projectTime / props.projectLength * 100;
    const style: CSSProperties = {
        left: `calc(${projectPercent}% - 20px)`,
    };

    /*
    <svg height={120} width={100} style={{width: '100%', height: '100%'}}>
        <path d="M 0 60 H 200" stroke="#4ec144" strokeWidth="5"/>
    </svg>
    */

    const lineStyle : CSSProperties = {
        width: `${projectPercent}%`
    };

    return (
        <>
            <div className="scrubberLine" style={lineStyle} />
            <div className="scrubber" style={style} />
        </>
    );
}

export type MarkerProps = {
    time: ProjectTimeSeconds,
    onClick: MouseEventHandler<HTMLDivElement>,
    readonly projectLength: ProjectTimeSeconds,
}

export function Marker(props: MarkerProps) {
    const projectPercent = props.time / props.projectLength * 100;
    const style: CSSProperties = {
        left: `calc(${projectPercent}% - 15px)`,
    };

    return (
        <div className="marker" style={style} onClick={props.onClick}>
            <svg width={30} height={35}>
                <path d="M 5 5 H 25 V 20 L 15 30 L 5 20 Z" fill="#4ec144" stroke="#276122" strokeWidth="3"/>
            </svg>
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

export function MarkerTooltip(props: PropsWithChildren<MarkerTooltipProps>) {
    return (
        <div className="tooltip">
            <h1>{props.name}</h1>
            <span>{formatProjectTime(props.time)}</span>
            <p>{props.children}</p>
        </div>
    );
}