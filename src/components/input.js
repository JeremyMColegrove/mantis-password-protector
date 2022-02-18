
const input = (props)=> {
    return <input {...props} className={"rounded input " + props.className} >{props.children}</input>
}

export default input;