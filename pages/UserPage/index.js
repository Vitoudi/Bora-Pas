import React, { useContext, useEffect } from "react";
import {GlobalContext} from '../../context/GlobalContext'
import HomePage from '../../HomePage/index'
import {useSetPage} from "../../Hooks/useSetPage";
import Head from 'next/head'


export default function UserPage() {
  useSetPage({page :'Home'})
  
  return (
    <>
      <HomePage/>
    </>
  );
}


