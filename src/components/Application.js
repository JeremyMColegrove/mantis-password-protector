import {useState, useEffect} from 'react'
import CryptoMachine from '../components/Encryptor'
import Item from '../components/item'
import Header from './Header'
import { Add, LockSharp } from '@material-ui/icons'
import { CloudDownloadSharp  as CloudDownload } from '@material-ui/icons'
import Login from './Login'
import NLogin from './NLogin'
import ReactTooltip from 'react-tooltip';
// import { use } from 'builder-util'


// const isDev = window.require('electron-is-dev')
const {app} = window.require('@electron/remote')
const fs = window.require('fs')
var owasp = require('owasp-password-strength-test');
const converter = require('json-2-csv');

const { ipcRenderer } = window.require('electron')



function Application() {
    const [data, setData] = useState([])


    // The different popups that can show up (lock, add new, download)
    const [pAdd, setPAdd] = useState(false)
    const [pDownload, setpDownload] = useState(false) // unused
    const [pLock, setPLock] = useState(true) // show the lock screen by default
    
    const [key, setKey] = useState("")
    const [search, setSearch] = useState("")

    const machine = new CryptoMachine()

    useEffect(()=>{
      // if (!isDev) {
        // lock()
      // }
    }, [])

    // when the splash screen gives the data to the window
    ipcRenderer.on('data', (e, args)=>{
        // validate the data here
        if (args.key != null && args.key.length > 10) {
            setKey(args.key)
        } else return

        if (args.data != null && Array.isArray(args.data)) {
            setData(args.data)
        } else return
    })
  

  // save the new password
  function save(login) {
    // when saving a new password, add to list and encrypt into file

    let deep_copy = JSON.parse(JSON.stringify(data))
    let ndata = [...deep_copy, login]

    setData(ndata)
    if (machine.save(ndata, key)) {
      console.log("Login encrypted")
      setPAdd(false)
    } else {
      console.error("Something went very wrong...")
    }
  }


  // remove one of the logins and save the file
  function remove(index) {
    let ndata = JSON.parse(JSON.stringify(data))
    ndata.splice(index, 1)
    if (machine.save(ndata, key)) {
      setData(ndata)
    } else {
      // could not save, show error here
    }
  }
  
  function lock() {
      // switch to lock screen
      ipcRenderer.send('lock')
  }

  function saveCSV() {
    converter.json2csv(data, (err, csv) => {
        if (err) {
            throw err;
        }


        // print CSV string
        let directory = app.getPath('downloads')

        fs.writeFile(`${directory}/passwords.csv`, csv, ()=>{
            //open the directory
            window.require('child_process').exec(`start "" "${directory}"`);

        })

    });
  }

  function saveLogin(key, data) {
    setKey(key)
    setData(data)
    setPLock(false)
  }

  function lock() {
    setKey("")
    setData([])
    setPLock(true)
  }
  return (
    <div className="text-slate-800 dark:text-slate-100 bg-gray-300 dark:bg-zinc-900 overflow-hidden w-full  h-screen  text-sm">
          <Header/>
          <ReactTooltip place="right"/>
          {pLock && <Login onSuccess={saveLogin}/>}
          {pAdd && <NLogin data={data} cancel={()=>setPAdd(false)} save={save}/>}
          <div className='flex flex-row z-20'>
          
            <div className='w-24 flex flex-col justify-between'>
              <div className=' flex flex-col items-center pt-6'>
                  {/* An action */}
                  
                  <div data-tip="New Login" onClick={()=>setPAdd(true)} className="rounded-full mb-6 dark:bg-zinc-800 bg-zinc-100 hover:bg-zinc-200 hover:cursor-pointer hover:dark:bg-zinc-700 p-3 flex justify-center items-center">
                    <Add  style={{width:'1em', height:'1em'}}/>
                  </div>
                  <div data-tip="Download Passwords (.csv)" onClick={saveCSV} className="rounded-full mb-6 dark:bg-zinc-800 hover:cursor-pointer hover:bg-zinc-200 bg-zinc-100 hover:dark:bg-zinc-700 p-3 flex justify-center items-center">
                    <CloudDownload style={{width:'1em', height:'1em'}}/>
                  </div>
                  <div data-tip="Lock" onClick={lock} className="rounded-full mb-6 dark:bg-zinc-800 hover:cursor-pointer hover:bg-zinc-200 bg-zinc-100 hover:dark:bg-zinc-700 p-3 flex justify-center items-center">
                    <LockSharp style={{width:'1em', height:'1em'}}/>
                  </div>
              </div>
              <p className='text-xs w-full opacity-50  p-2'>v{process.env.REACT_APP_VERSION}</p>
            </div>
            
            {/* The main window scene */}
            <div className="w-full h-full dark:bg-zinc-800 bg-zinc-100">
              <div className="h-4/12 m-10 mb-8 mt-6 flex flex-row ">
                {/* <div onClick={()=>setOpen(open=>!open)} className="hover:cursor-pointer  dark:hover:bg-zinc-700 w-14 mr-1 rounded  flex flex-row justify-center items-center">
                    <img src={isDarkTheme?HamburgerWhite:Hamburger} alt="hamburger" className='w-4 dark:w-6 opacity-50 '/>
                </div> */}
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search username, website or description" type="text" className="p-2 dark:bg-zinc-900 dark:text-zinc-200  px-3 w-full rounded"/>
              </div>
              <div className='mx-10 px-4'>
                <div className='grid grid-cols-3'>
                  <p className='text-left'>Site</p>
                  <p className='text-center'>Username</p>
                  <p className='text-right'>Password</p>
                </div>
                {/* Divider for list labels */}
                <div className='w-full bg-zinc-700  my-4 h-px'/>
              </div>
              <div className='mx-5 px-5 overflow-y-auto ' style={{height:"calc(100vh - 13em)"}}>
                {data && data.length === 0 && (
                  <p className='text-center dark:text-zinc-400'>It appears you have no logins</p>
                )}
                {data && data.map((item, index) =>{
                            // check if something is in search
                            let insearch = false
                            if (item.description.toLowerCase().includes(search)) {
                              insearch = true
                            } else if (item.username.toLowerCase().includes(search)) {
                              insearch = true
                            } else if (item.website.toLowerCase().includes(search)) {
                              insearch = true
                            } else if (search.trim() === "") {
                              insearch = true
                            }

                            return !insearch?null:<Item item={item} index={index} key={index} onRemove={remove}/>
                            })
                          }
              </div>
            </div>
          </div>
    </div>
  );
}

export default Application;
