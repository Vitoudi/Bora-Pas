import React, { useContext, useState } from "react";
import LoginModal from "./components/LoginModal";
import SignInModal from "./components/SignInModal";
import Logo from './components/Logo'
import PageModeMsg from './components/PageModeMsg'
import {GlobalContext, GlobalState} from '../../context/GlobalContext'

export default function LoginPage() {
  const [modalState, setModalState] = useState("login");
  const [globalState, setGlobalState] = useContext(GlobalContext)

  return (
    <div className="login-page current-page">
    <Logo/>
      {modalState === "signUp" ? (
        <SignInModal setModalState={setModalState} />
      ) : (
        <LoginModal setModalState={setModalState} />
      )}
      <PageModeMsg modalState={modalState} setModalState={setModalState}/>
    </div>
  );
}
