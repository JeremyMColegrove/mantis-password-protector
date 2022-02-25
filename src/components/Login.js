import React, {useEffect, useState} from 'react'
import Popup from './Popup'
import CryptoMachine from './Encryptor'
import useThemeDetector from './useThemeDetector'
import PreyingMantis from '../img/preyingmantis.png'
import PreyingMantisDark from '../img/preyingmantis_dark.png'
import CloseIconWhite from '../img/close_white.png'

var owasp = require('owasp-password-strength-test');

function Login(props) {
    // call to main window that login was success
    const {onSuccess} = props

    const machine = new CryptoMachine()

    const [test, setTest] = useState({})
    
    const isDarkTheme = useThemeDetector()

    const [reset, setReset] = useState(false)
    
    const [key, setKey] = useState("")

    const [confirmKey, setConfirmKey] = useState("")


    // checks to see if the encrypted file exists (already have an 'account')
    useEffect(()=>{
        async function fetchFile() {
          // check if a file exists, if not, encrypt with a new set password
          let exists = await machine.fileExists()
          if (!exists) {
            setReset(true)
          } else {
            setReset(false)
          }
        }
        fetchFile()
      }, [])


    // file already exists, attempt to unlock it
    function unlock(e) {
        e.preventDefault()
        let result = machine.load(key)
        if (result != null) {
            onSuccess(key, result)
            // ipcRenderer.send("switch", {data:result, key})
        } else {
            setTest({errors:["Incorrect key"]})
        }
    }


    // file does not exist, lets create one and encrypt it
    function createAccount(e) {
        e.preventDefault()
        if (key !== confirmKey) {
            setTest({errors:["Keys do not match"]})
            return
        }
        var result = owasp.test(key);
        if (result.strong && machine.save([], key)) {
            // send the data and key to the main window
            setKey("")
            setTest({errors:[]})
            setReset(false)
            // ipcRenderer.send("switch", {data:[], key})
            onSuccess(key, [])
        } else {
            setTest(result)
        }
    }


    return (
    <Popup>
            <form onSubmit={reset?createAccount:unlock} className="flex flex-col w-5/6 justify-center items-center">
                <img src={isDarkTheme?PreyingMantis:PreyingMantisDark} alt="mantis" className='w-14 mb-10 '/>
                
                {/* All of the password checking stuff */}
                {test && test.errors && test.errors.map((error, index)=>{
                    return <div className='w-full text-red-100 text-xs  mb-2 items-center flex flex-row'>
                        {/* <div className='flex flex-row justify-center items-center mr-2 bg-red-800 rounded-full  w-4 h-4'>
                            <img src={CloseIconWhite} alt="close" className='w-full p-px h-full rounded-full'/>
                        </div> */}
                        {error}
                    </div>
                })}

                {/* Create the key */}
                {reset && <>
                    <input placeholder='Key' className='rounded text-zinc-800 dark:text-zinc-100 dark:bg-zinc-900 p-2 w-full  mb-4' value={key} onChange={e=>setKey(e.target.value)} type="text"/>
                    <input placeholder='Confirm Key' className='rounded text-zinc-800 dark:text-zinc-100 dark:bg-zinc-900 p-2 w-full mb-4' value={confirmKey} onChange={e=>setConfirmKey(e.target.value)} type="text"/>
                </>}

                {/* Enter the key */}
                {!reset && <>
                    <input placeholder='Secret' className='rounded text-zinc-800 dark:bg-zinc-900 dark:text-zinc-100  p-2 w-full mb-4' value={key} onChange={e=>setKey(e.target.value)} type="text"/>
                </>}

                <button type="submit" className=" mb-4 text-slate-50 w-full h-10 bg-zinc-600">{reset?"Continue":"Unlock"}</button>

        </form>
            
            
    </Popup>
    )
}

export default Login