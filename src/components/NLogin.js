import React, {useState, useEffect} from 'react'
import Hint from './autocomplete-hint'
import Popup from './Popup'

let owasp = require('owasp-password-strength-test')

function NLogin(props) {
    const {data} = props
    const [website, setWebsite] = useState("")
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [description, setDescription] = useState("")
    const [usernameHints, setUsernameHints] = useState([])
    const [passwordHints, setPasswordHints] = useState([])

    useEffect(()=>{
        if (!data) return
        let usernames = []
        let passwords = []

        for (var login of data) {
            usernames.push(login.username)
            passwords.push(login.password)
        }

        setUsernameHints(usernames)
        setPasswordHints(passwords)
    }, [data])

    function save() {
        let test = owasp.test(password)

        if (props.save) {
            return props.save({website, username, password, description, date:new Date(), strong:test.strong, isPassphrase:test.isPassphrase, failedTests:test.failedTests, passedTests:test.passedTests})
        }

        console.error("Parent event props.save does not exist. Please define this event in Application.js")
    }
    function cancel() {
        if (props.cancel) {
            return props.cancel()
        }

        console.error("Parent event props.cancel does not exist. Please define this event in Application.js")
    }
    return (
        <Popup closeable cancel={cancel} transparent>
            <div className='flex items-center justify-center  flex-row mb-10'>
            
            </div>                    
            
            <input type="text" placeholder='Website URL' onChange={e=>setWebsite(e.target.value)} className="rounded text-zinc-800 dark:bg-zinc-900 dark:text-zinc-200  input w-full py-2 mb-4 p-1 px-3"/>

            <Hint options={usernameHints} allowTabFill={true}>
                <input type="text" placeholder='Username' onChange={e=>setUsername(e.target.value)} className="rounded text-zinc-800 dark:bg-zinc-900 dark:text-zinc-200  input w-full py-2 mb-4 p-1 px-3"/>
            </Hint>
            <Hint options={passwordHints} allowTabFill={true}>
                <input type="text" placeholder='Password' onChange={e=>setPassword(e.target.value)} className="rounded  text-zinc-800 dark:bg-zinc-900 dark:text-zinc-200  input w-full py-2 mb-4 p-1 px-3"/>
            </Hint>

            <textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder='Description' className='rounded  text-zinc-800 dark:bg-zinc-900 dark:text-zinc-200  input w-full py-2 mb-4 p-1 px-3 h-40'></textarea>
        

        
            <button onClick={save} className='text-zinc-100 shadow-md bg-zinc-700 hover:bg-green-800 mb-4 rounded p-1 py-2 w-full'>Save</button>
            
        </Popup>
    )
}

export default NLogin