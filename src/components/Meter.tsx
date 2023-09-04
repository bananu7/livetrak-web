export function Meter(props: {name: string}) {
    return (<div className="meterWrapper">
        <div id={`meter-${props.name}`} style={{backgroundColor: 'lime', width: '5px', float: 'right', boxShadow: '0px 0px 10px lime'}}></div>
    </div>);
}
