
const input = (props)=> {
    return <input {...props} className={"rounded text-zinc-800  " + props.className} >{props.children}</input>
}

export default input;