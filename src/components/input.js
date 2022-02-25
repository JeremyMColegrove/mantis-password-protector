import Hint from "./autocomplete-hint";

const Input = (props)=> {
    return (<input {...props} className={"text-zinc-800 dark:border-2 dark:border-zinc-800 dark:bg-zinc-700 dark:text-zinc-200 p-3 " + (props.className)}>{props.children}</input>)
}

export default Input;