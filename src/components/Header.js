import React from 'react'
import CloseIcon from '../img/close.png'
import CloseIconWhite from '../img/close_white.png'
import useThemeDetector from './useThemeDetector'


const { ipcRenderer } = window.require('electron')


function Header() {
    const isDarkTheme = useThemeDetector()

    // closes all windows
    function close() {
        ipcRenderer.send("close")
    }
    return (
        <header className='titlebar  h-10  w-full flex flex-row-reverse '>
            <img onClick={close} src={isDarkTheme?CloseIconWhite:CloseIcon} alt="close" className='hover:bg-gray-400 dark:hover:bg-slate-600  rounded-md m-1 p-2 w-auto hover:cursor-pointer h-full'/>
            <div className='w-full drag-region'/> 
        </header>
    )
}

export default Header