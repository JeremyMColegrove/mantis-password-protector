import React from 'react'

import Header from './Header'
function Popup(props) {
  return (
    <div style={{height:'calc(100vh - 3em)'}}  className={"absolute w-screen  flex flex-col items-center justify-center "+(props.transparent?"bg-zinc-900 bg-opacity-60":"dark:bg-zinc-900 bg-slate-100")}>
        
        <div style={{width:'30em',  minHeight:'10em'}} {...props} className='dark:bg-zinc-800 bg-zinc-300 rounded shadow-lg py-10 px-10 flex flex-col items-center justify-center'>
            {props.closeable && props.cancel && <Header close={props.cancel}/>}
            {props.children}
        </div>
    </div>
  )
}

export default Popup