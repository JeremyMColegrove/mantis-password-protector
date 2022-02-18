import React from 'react'
import CloseIcon from '../img/close.png'
const { ipcRenderer } = window.require('electron')

function Header() {

    // closes all windows
    function close() {
        ipcRenderer.send("close")
    }
    return (
        <header className='titlebar  h-10  w-full flex flex-row-reverse '>
            <img onClick={close} src={CloseIcon} alt="close" className='hover:bg-gray-400 rounded-md m-1 p-2 w-auto hover:cursor-pointer h-full opacity-50'/>
            <div className='w-full drag-region'/> 
        </header>
    )
}

export default Header