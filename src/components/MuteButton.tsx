export function MuteButton(props: { muted: boolean, onClick: () => void }) {
    return (
        <div style={{width: '50%', float: 'right', display: 'flex', alignItems: 'center', flexDirection: 'column', fontSize: '12px'}}>
            <button
                className={props.muted ? "toggledRed" : ""}
                onClick={props.onClick}
                style={{width: '30px', height: '30px'}}
            >
            </button>
            MUTE
        </div>
    )
}
