import React from 'react'
import CloseIcon from '../img/close.png'
import CloseIconWhite from '../img/close_white.png'
import useThemeDetector from './useThemeDetector'


const { ipcRenderer } = window.require('electron')


function Header(props) {
    const isDarkTheme = useThemeDetector()

    // closes all windows
    function close() {
        // give option to override
        if (props.close) return props.close()

        // otherwise close out of whole application
        ipcRenderer.send("close")
    }

    return (
        <header className='titlebar  h-10  w-full flex flex-row-reverse '>
            <img onClick={close} src={isDarkTheme?CloseIconWhite:CloseIcon} alt="close" className='hover:bg-gray-400 dark:hover:bg-zinc-600  rounded-sm m-2  p-px w-auto hover:cursor-pointer h-6'/>
            <div className='w-full drag-region'/> 
        </header>
    )
}

export default Header