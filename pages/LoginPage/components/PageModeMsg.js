import React from "react";

export default function PageModeMsg({ modalState, setModalState }) {
    function handleClick() {
        if(modalState === 'signUp') setModalState('login')
        else setModalState('signUp')
    }

  return (
    <div className="page-mode-msg">
      <p>
        {modalState === "signUp" ? "Já tem uma conta?" : "Ainda não tem conta?"}{" "}
        <span onClick={handleClick}>{modalState === "login"? 'Criar conta' : 'Login'}</span>
      </p>
    </div>
  );
}
