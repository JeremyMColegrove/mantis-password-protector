import React, {useEffect, useState} from 'react'
import MantisIcon from '../img/preyingmantis.png'

const { ipcRenderer } = window.require('electron')

const states = {
    CHECKING:"Checking for updates",
    AVAILABLE:"Update is available",
    DOWNLOADING:"Downloading update",
    DOWNLOADED:"Update downloaded",
    FAILED:"Checking for updates failed",
    NOT_AVAILABLE:"Up to date"
}

function Updater() {
    const [progress, setProgress] = useState(50)
    const [state, setState] = useState(states.NOT_AVAILABLE);

    ipcRenderer.on('update-available', ()=>{
        setState(states.AVAILABLE)
    })

    ipcRenderer.on('checking-for-update', ()=>{
        setState(states.CHECKING)
    })
    ipcRenderer.on('update-not-available', ()=>{
        setState(states.NOT_AVAILABLE)
        console.log('update-not-available')
    })
    ipcRenderer.on('error', (_, err)=>{
        setState(states.FAILED)
    })
    ipcRenderer.on('download-progress', (_, progressData)=>{
        if (state !== states.DOWNLOADING) setState(states.DOWNLOADING)
        setProgress(progressData.percent)
    })

    ipcRenderer.on('update-downloaded', ()=>{
        setState(states.DOWNLOADED)
    })

  return (
    <div className='w-full justify-center bg-gray-50 items-center h-screen'>
        <div className='h-36 flex flex-row justify-center items-end'>
            <img src={MantisIcon} alt="mantis" className='opacity-50 w-20'/>
        </div>
        <div className='h-16 flex flex-row justify-center items-end'>
            <p className='text-slate-500 '>{state}</p>
        </div>
        <div className='h-16 px-10 w-full flex flex-row justify-center items-end'>
            {state === states.DOWNLOADING && <>
                <div className='w-full rounded-full h-2 bg-gray-300'>
                    <div className=' rounded-full h-full bg-gray-500' style={{width:`${progress}%`}}>

                    </div>
                </div>
            
            </>}
        </div>
        

    </div>
  )
}

export default Updater