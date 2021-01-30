import React, { useContext, useEffect, useState } from "react";
import LoginPage from "./LoginPage/index";
import UserPage from './UserPage/index';
import { GlobalContext } from "../context/GlobalContext";
import {auth} from '../firebase/firebaseContext'
import LoadingPage from "./LoadingPage/index";
import Header from '../shared_components/Header'
//import sw from '../service-worker'

import {useRouter} from 'next/router'

import Link from 'next/link'
import Head from "next/head";

let isUserPage = false

export default function CurrentPage() {
  const [globalState, setGlobalState] = useContext(GlobalContext);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = globalState;

  const router = useRouter()

  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      if (user) {
        setGlobalState((state) => {
          return { ...state, user: { ...state.user, isLoggedIn: true, uid: auth.currentUser.uid } };
        });
      }
      setIsLoading(false);
    });

    /*if(navigator) navigator.serviceWorker
      .register("../service-worker/sw.js")
      .then((res) => console.warn(res))
      .catch((err) => {
        console.error(err);
      });*/

  }, []);

  /*function Redirect({ to }) {
    useEffect(() => {
      router.replace(to);
    }, [to]);

    return null;
  }*/

  if (isLoading) {
    return (
      <>
        <Head>
          <title>BORA PAS - Prepare-se para o Pas UNB</title>
        </Head>
        <LoadingPage />
      </>
    );
  } 


  return (
    <>
      <Head>
        <title>BORA PAS - Prepare-se para o Pas UNB</title>
      </Head>
      <div
        className={`current-page ${
          !user.isLoggedIn ? "login-page" : "user-page"
        }`}
      >
        {user.isLoggedIn ? <UserPage /> : <LoginPage />}
      </div>
    </>
  );
}





