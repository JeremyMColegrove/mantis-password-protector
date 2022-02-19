import CInput from '../components/input'
import {useState, useEffect, useRef} from 'react'
import useOutsideClick from '../components/useOutsideClick'
import Hamburger from '../img/hamburger.png'
import CryptoMachine from '../components/Encryptor'
import PreyingMantis from '../img/preyingmantis.png'
import Item from '../components/item'
import Header from './Header'

const {app} = window.require('@electron/remote')

const fs = window.require('fs')
var owasp = require('owasp-password-strength-test');
const converter = require('json-2-csv');

const { ipcRenderer } = window.require('electron')




const silly = [
                "Mantis-Tip: 0000 is a bad password.", 
                "Thank you for using Mantis Protector!",
                "Mantis hopes you are having a good day :)",
                "Mantis likes to encrypt stuff!",
                "The Mantis has your back!",
                "Mantis-Tip: take care of Mantis and he will take care of you!",
                "Mantis uses government level encryption on your logins!"
              ]


function Application() {
    const [data, setData] = useState([])
    const impactRef = useRef();
    const [website, setWebsite] = useState("")
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [description, setDescription] = useState("")
    const [funnyWord, setFunnyWord] = useState(silly[Math.floor(Math.random()*silly.length)])
    
    const [key, setKey] = useState("")

    const [open, setOpen] = useState(false)
    const [search, setSearch] = useState("")

    const machine = new CryptoMachine()

    useEffect(()=>{
        // lock()
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
  function save() {
    // when saving a new password, add to list and encrypt into file
    let test = owasp.test(password)

    let deep_copy = JSON.parse(JSON.stringify(data))
    let ndata = [...deep_copy, {website, username, password, description, date:new Date(), strong:test.strong, isPassphrase:test.isPassphrase, failedTests:test.failedTests, passedTests:test.passedTests}]

    setData(ndata)
    if (machine.save(ndata, key)) {
      // the passwords were encrypted securely
      setOpen(false)
      setUsername("")
      setWebsite("")
      setPassword("")
      setDescription("")
    }
  }

  useOutsideClick(impactRef, () => {
    setOpen(false)
    setFunnyWord(silly[Math.floor(Math.random()*silly.length)])
  } ); //Change my dropdown state to close when clicked outside


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
  return (
    <div className="text-slate-300 overflow-hidden w-full  h-screen bg-gray-300 text-sm">
        <Header/>

          <div className='flex flex-row z-50'>
            <div style={{display:open?"":"none"}} ref={impactRef} className='absolute z-50 text-slate-600 bg-gray-200 shadow-lg flex flex-col justify-between w-full max-w-sm py-10 px-5 top-0 h-full dark'>
              <div className=' text-slate-500'>
                <div className='flex items-center justify-center text-slate-600 flex-row mb-10'>
                  <img src={PreyingMantis} alt="mantis" className='opacity-30 mr-2 object-contain h-12 '/>
                  
                </div>
                <p className='mb-5'>{funnyWord}</p>
                

                <CInput value={website} onChange={e=>setWebsite(e.target.value)} placeholder="Website" type="text" className="w-full  mb-4 p-1 py-2 px-3"/>
                <CInput value={username} onChange={e=>setUsername(e.target.value)} placeholder="Username" type="text" className="w-full mb-4 p-1 py-2 px-3"/>
                <CInput value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" type="text" className="w-full mb-4 p-1 py-2 px-3"/>
                <textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder='Description' className='rounded input w-full py-2 mb-4 p-1 px-3 h-40'></textarea>

              </div>
              <div>
                <button onClick={save} className='hover:bg-orange-800 shadow-md bg-orange-700 mb-4 text-slate-100  rounded p-1 py-2 w-full'>Secure</button>
                <div className='flex flex-row justify-between w-full h-7 opacity-70'>
                    {/* <img src={DownloadIcon} alt="download" className=' mr-4 h-full p-px'/> */}
                    {/* <img src={LockIcon} alt="download" className='h-full p-px'/> */}
                    <div onClick={saveCSV} className='rounded hover:bg-gray-300 hover:cursor-pointer p-4 flex flex-row items-center justify-center'>
                        Download CSV
                    </div>
                    <div onClick={lock} className='rounded hover:bg-gray-300 hover:cursor-pointer p-4 flex flex-row items-center justify-center'>
                        Lock
                    </div>
                </div>
              </div>
            </div>

            {/* The main window scene */}
            <div className="w-full h-full">
              <div className="h-4/12 m-10 mb-8 mt-6 flex flex-row text-slate-600">
                <div onClick={()=>setOpen(open=>!open)} className="hover:cursor-pointer w-14 mr-1 rounded bg-gray-50 flex flex-row justify-center items-center">
                    <img src={Hamburger} alt="hamburger" className='w-4 opacity-50'/>
                </div>
                <CInput value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search username, website or description" type="text" className="p-3 px-3 w-full rounded-lg input"/>
              </div>
              <div className='mx-10 text-slate-500 pl-12 pr-4'>
                <div className='flex flex-row justify-between '>
                  <p>Site</p>
                  <p>Username</p>
                  <p>Password</p>
                </div>
                {/* Divider for list labels */}
                <div className='w-full  my-4 h-px'/>
              </div>
              <div className='mx-5 px-5 overflow-y-auto text-slate-600' style={{height:"calc(100vh - 16em)"}}>
                {data.map((item, index) =>{
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
