import React from 'react'
import { Component } from 'react';
import Splash from './components/Splash.js'
import Application from './components/Application.js'

import {HashRouter,Route,Routes} from "react-router-dom";

// import {Switch} from 'react-router'

class ViewManager extends Component {
 
 render() {
 return (
     <HashRouter>
        <Routes>
            <Route path='/' element={<Splash/>} exact/>
            <Route path='/application' element={<Application/>} exact/>
        </Routes>
     </HashRouter>
    
 );
 }
}
export default ViewManager