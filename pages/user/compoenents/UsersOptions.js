import React, { useContext } from 'react'
import { auth, storage, firestore } from "../../../firebase/firebaseContext";
import {GlobalContext} from '../../../context/GlobalContext'
import styles from '../userInfoPage.module.css'

export default function UsersOptions() {
    const [globalState, setGlobalState] = useContext(GlobalContext)

    function handleClick() {
        auth.signOut()
            .then(()=> {
                setGlobalState(state=> {
                    return {...state, user: {...state.user, isLoggedIn: false}}
                })
            })
    }
    return (
      <div
        className={styles['user-options']}
        style={{ marginTop: 40, cursor: "pointer" }}
      >
        <p onClick={handleClick}>Sair</p>
      </div>
    );
}
