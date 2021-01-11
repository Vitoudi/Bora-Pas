import React, {useContext, useEffect} from 'react'
import loadingIcon from '../../public/images/loading-icon.gif'
import styles from './loadingPage.module.css'
import { auth } from "../../firebase/firebaseContext";

export default function LoadingPage() {
    /*const [globalState, setGlobalState] = useContext(globalContext);
    console.log(globalContext)

    useEffect(() => {
      auth.onAuthStateChanged((user) => {
        if (user) {
          setGlobalState((state) => {
            return { ...state, user: { ...state.user, isLoggedIn: true } };
          });
        }

        setIsLoading(false);
      });
    }, []);*/

    return (
      <div className={styles["loading-page-container"]}>
        <h1 className="logo-3">
          bora <span>pas</span>
        </h1>
        <img src={loadingIcon} alt="" />
      </div>
    );
}
