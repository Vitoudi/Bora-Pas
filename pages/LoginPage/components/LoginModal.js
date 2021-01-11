import React, { useContext, useState } from "react";
import { auth } from "../../../firebase/firebaseContext";
import {GlobalContext} from '../../../context/GlobalContext'

export default function LoginModal() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [validInputFields, setValidInputFields] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [globalState, setGlobalState] = useContext(GlobalContext)

  function handleClick() {
    checkInputFields()
    if(!validInputFields) return

  }

  function checkInputFields() {
      setValidInputFields(false)
    if (email.length === 0 && password.length === 0) {
      setErrorMsg("Please enter values");
    } else if (email.length < 6) {
       setErrorMsg("Email is too short");
    } else if (password.length < 6) {
      setErrorMsg("Passowrd is too short");
    } else {
        tryToSignUser()
    }
  }

  function tryToSignUser() {
    auth
      .signInWithEmailAndPassword(email, password)
      .then(() => {
          setGlobalState((globalState)=> {
              return {...globalState, user: {...globalState.user, isLoggedIn: true}}
          })
          console.log(globalState)
      })
      .catch((err) => {
        setErrorMsg(err.message);
        setValidInputFields(false);
      });
  }

  return (
    <div className="modal login-modal">
      <h2>Login:</h2>
      <section className="modal-user-info-container">
        <form action="" className="form login-form">
          <label className="input-label">
            email:
            <input
              className="input-1"
              type="email"
              name="email"
              id="email"
              onChange={(e) => {
                setEmail(e.target.value);
                setErrorMsg("");
              }}
              value={email}
            />
          </label>
          <label className="input-label">
            password:
            <input
              className="input-1"
              type="password"
              name="password"
              id="password"
              onChange={(e) => {
                setPassword(e.target.value);
                setErrorMsg("");
              }}
              value={password}
            />
          </label>
        </form>
      </section>
      <button onClick={handleClick} className="btn">
        Login
      </button>

      {errorMsg && <div className="error-msg-place">{errorMsg}</div>}
    </div>
  );
}
