import React, {useEffect, useState} from 'react'
import CryptoMachine from './Encryptor'
import PreyingMantis from '../img/preyingmantis.png'
import CloseIconWhite from '../img/close_white.png'
import Header from './Header'

const { ipcRenderer } = window.require('electron')
var owasp = require('owasp-password-strength-test');

function Splash() {
    const machine = new CryptoMachine()
    const [test, setTest] = useState({})

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
            setKey("")
            setTest({errors:[]})

            ipcRenderer.send("data", {data:result, key})
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
            ipcRenderer.send("data", {data:[], key})
        } else {
            setTest(result)
        }
    }


  return (
    <div className="text-slate-300 overflow-hidden w-full  h-screen bg-gray-300 text-sm">
        <Header/>
        
        <form onSubmit={reset?createAccount:unlock} className='w-full flex flex-col text-slate-700 px-20 justify-between items-center h-full pb-20'>
                <div className='flex w-full flex-col items-center'>
                    <img src={PreyingMantis} alt="mantis" className='w-20 mb-10 opacity-30 '/>

                    
                    {/* Create the key */}
                    {reset && <>
                        
                        <p className='mb-5 '>Welcome to Mantis Protector! To get started, fill out your master key. This key is used to locally encrypt your file using government level AES encryption. </p>
                        <input placeholder='Key' className='rounded p-2 w-full  mb-4' value={key} onChange={e=>setKey(e.target.value)} type="text"/>
                        <input placeholder='Confirm Key' className='rounded p-2 w-full mb-4' value={confirmKey} onChange={e=>setConfirmKey(e.target.value)} type="text"/>
                        
                        
                    </>}

                    {/* Enter the key */}
                    {!reset && <>
                        <p className='mb-5 '>Welcome to Mantis Protector! The Mantis is happy you returned. Lets decrypt your file using you master key!</p>
                        <input placeholder='Secret' className='rounded p-2 w-full mb-4' value={key} onChange={e=>setKey(e.target.value)} type="text"/>
                    </>}
                    {/* All of the password checking stuff */}
                    {test && test.errors && test.errors.map((error, index)=>{
                        return <div className='w-full text-slate-600 mb-2 items-center flex flex-row'>
                            <div className='flex flex-row justify-center items-center mr-2 bg-red-800 rounded-full  w-4 h-4'>
                                <img src={CloseIconWhite} alt="close" className='w-full p-px h-full rounded-full'/>
                            </div>
                            {error}
                        </div>
                    })}
                </div>


                <button type="submit" className=" text-slate-50 w-full h-10 bg-orange-600">{reset?"Continue":"Unlock"}</button>
        </form>
    </div>
  )
}

export default Splash