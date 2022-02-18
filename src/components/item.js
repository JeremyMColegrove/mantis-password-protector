import React from 'react'
import Lock from '../img/lock.png'

function Item(props) {
    const {item} = props
    const [open, setOpen] = React.useState(false)

    function strip(url) {
        if (url.startsWith("http://www.")) {
            return url.substring(11)
        } else if (url.startsWith("https://www.")) {
            return url.substring(12)
        } else if (url.startsWith("www.")) {
            return url.substring(4)
        }
        return url
        }

    function remove() {
        props.onRemove(props.index)
    }
  return (
    <div className=' mb-4 w-full rounded items-center  bg-gray-100 h-fit ' style={{alignItems:open?'flex-start':""}}> 
        <div onClick={()=>setOpen(open=>!open)}  className='hover:cursor-pointer justify-between flex flex-row p-4'>
            <div className='flex flex-row min-w-fit'>
                <img src={Lock} alt="lock" className='w-5 opacity-50 justify-center items-center mr-3'/>
                <p>{strip(item.website)}</p>
            </div>
            <p>{item.username}</p>
            <p>{item.password}</p>
        </div>
        {open && <div className='p-4 bg-gray-200  w-full flex flex-row items-center justify-between'>
            <div>
                <p className='mb-2'>{item.description}</p>

                <p className='text-slate-400 mb-2' >Created {new Date(item.date).toLocaleString('en-US')}</p>
                <p className='text-slate-400'>This password is {item.strong?<span className='text-green-600'>strong</span>:<span className='text-red-600'>weak</span>}</p>
            </div>
            <button className='hover:bg-red-300 bg-red-200 shadow-md p-2 rounded-sm text-slate-600' onClick={remove} >Delete</button>
        </div>}
    </div>
  )
}

export default Item