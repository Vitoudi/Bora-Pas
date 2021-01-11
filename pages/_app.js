import '../styles/globals.css'
import "simplebar/dist/simplebar.min.css";
import {GlobalContextProvider} from '../context/GlobalContext'
import React, { useContext, useEffect, useState } from "react";
import Header from '../shared_components/Header'
import LoginPage from "./LoginPage/index";
import UserPage from "./UserPage/index";
import { GlobalContext } from "../context/GlobalContext";
import { auth } from "../firebase/firebaseContext";
import LoadingPage from "./LoadingPage/index";


  

function MyApp({ Component, pageProps }) {


  return (
    <GlobalContextProvider>
    <>
      <Header/>
      <Component {...pageProps} />
    </>
    </GlobalContextProvider>
  );
}


export default MyApp
