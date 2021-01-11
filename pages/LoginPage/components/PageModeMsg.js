import React from "react";

export default function PageModeMsg({ modalState, setModalState }) {
    function handleClick() {
        if(modalState === 'signUp') setModalState('login')
        else setModalState('signUp')
    }

  return (
    <div className="page-mode-msg">
      <p>
        {modalState === "signUp" ? "Alredy has an account?" : "Do not have an account?"}{" "}
        <span onClick={handleClick}>{modalState === "signUp"? 'Login' : 'Create account'}</span>
      </p>
    </div>
  );
}
