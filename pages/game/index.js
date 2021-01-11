import React, {useContext, useEffect, useState} from 'react'
import { GlobalContext } from '../../context/GlobalContext';
import { auth, firestore } from '../../firebase/firebaseContext';
import { useSetPage } from '../../Hooks/useSetPage';
import Snippet from '../../shared_components/Snippet';
import LoadingPage from '../LoadingPage';
import areasJson from '../../public/areas.json'
import styles from './game.module.css'
import Link from 'next/link';
import Head from 'next/head';

export default function GameMenu({user}) {
    const [globalState, setGlobalState] = useContext(GlobalContext)
    const [isLoading, setIsLoading] = useState(false)
    const [uid, setUid] = useState(user ? user.uid : "")
    const [pasType, setPasType] = useState('')

    useSetPage({page: 'Game'})

      useEffect(() => {
        if (uid) return;
        setIsLoading(true);
        auth.onAuthStateChanged((user) => {
          if (user) {
            setGlobalState((state) => {
              return {
                ...state,
                user: {
                  ...state.user,
                  isLoggedIn: true,
                  uid: auth.currentUser.uid,
                },
              };
            });

            function getPasType() {
              firestore.doc(`users/${auth.currentUser.uid}`).get()
                .then(userCred => {
                  setPasType(userCred.data().pasType)
                })
            }

            getPasType()
            setUid(auth.currentUser.uid);
          } else {
            if (typeof window !== "undefined") window.location.href = "/";
          }
          setIsLoading(false);
        });
      }, [uid]);

      useEffect(()=> {
        console.log("pas type: " + pasType);
      }, [pasType])


      /*async function getAreas() {
        const areasData = await fetch(areasJson, {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });

        const areasA = await areasData.text();

        console.log(areasA)
      }*/

      function changePasType(type) {
        setPasType(type)
        firestore.doc(`users/${uid}`).update({pasType: type})
      }

      if(isLoading) {
          return <LoadingPage/>
      }

    return (
      <>
        <Head>
          <title>Bora Pas - Prática</title>
          <meta
            name="description"
            content="Ganhe pontos respondendo perguntas sobre portugês, física, história, etc - prepare-se para o pas"
          ></meta>
        </Head>
        <div className={styles["game-menu-container"]}>
          <section className={styles["pas-type-conatiner"]}>
            <div onClick={() => changePasType(1)}>
              <Snippet
                textColor={pasType === 1 ? "white" : "rgb(58, 58, 58)"}
                color={pasType === 1 ? "green" : "white"}
                classList="pas-type"
                size="tiny"
                text="Etapa 1"
              />
            </div>
            <div onClick={() => changePasType(2)}>
              <Snippet
                textColor={pasType === 2 ? "white" : "rgb(58, 58, 58)"}
                color={pasType === 2 ? "green" : "white"}
                classList="pas-type"
                size="tiny"
                text="Etapa 2"
              />
            </div>
            <div onClick={() => changePasType(3)}>
              <Snippet
                textColor={pasType === 3 ? "white" : "rgb(58, 58, 58)"}
                color={pasType === 3 ? "green" : "white"}
                classList="pas-type"
                size="tiny"
                text="Etapa 3"
              />
            </div>
          </section>
          <Link href="/game/geral">
            <a>
              <section className={styles["area"]}>
                <div className={styles["subjects-container"]}>
                  <Snippet
                    classList="full-text"
                    size="small"
                    color="green"
                    text="Geral"
                  />
                </div>
              </section>
            </a>
          </Link>

          <section className={styles["area"]}>
            <h2 className={styles["area-title"]}>Linguagens e códigos:</h2>
            <div className={styles["subjects-container"]}>
              <Link href="/game/portugues">
                <a>
                  <Snippet size="small" color="white" text="Português" />
                </a>
              </Link>
              <Link href="/game/literatura">
                <a>
                  <Snippet size="small" color="white" text="Literatura" />
                </a>
              </Link>
              <Link href="/game/ingles">
                <a>
                  <Snippet size="small" color="white" text="Inglês" />
                </a>
              </Link>
              <Link href="/game/artes">
                <a>
                  <Snippet size="small" color="white" text="Artes" />
                </a>
              </Link>
            </div>
          </section>

          <section className={styles["area"]}>
            <h2 className={styles["area-title"]}>Ciências humanas:</h2>
            <div className={styles["subjects-container"]}>
              <Link href="/game/historia">
                <a>
                  <Snippet size="small" color="white" text="História" />
                </a>
              </Link>
              <Link href="/game/geografia">
                <a>
                  <Snippet size="small" color="white" text="Geografia" />
                </a>
              </Link>
              <Link href="/game/filosofia">
                <a>
                  <Snippet size="small" color="white" text="Filosofia" />
                </a>
              </Link>
              <Link href="/game/sociologia">
                <a>
                  <Snippet size="small" color="white" text="Sociologia" />
                </a>
              </Link>
            </div>
          </section>

          <section className={styles["area"]}>
            <h2 className={styles["area-title"]}>Ciências da natureza:</h2>
            <div className={styles["subjects-container"]}>
              <Link href="/game/fisica">
                <a>
                  <Snippet size="small" color="white" text="Física" />
                </a>
              </Link>
              <Link href="/game/quimica">
                <a>
                  <Snippet size="small" color="white" text="Química" />
                </a>
              </Link>
              <Link href="/game/biologia">
                <a>
                  <Snippet size="small" color="white" text="Biologia" />
                </a>
              </Link>
            </div>
          </section>

          <section className={styles["area"]}>
            <h2 className={styles["area-title"]}>Matemática:</h2>
            <div className={styles["subjects-container"]}>
              <Link href="/game/matematica">
                <a>
                  <Snippet size="small" color="white" text="Matemática" />
                </a>
              </Link>
            </div>
          </section>

          <section className={styles["area"]}>
            <h2 className={styles["area-title"]}>Obras do PAS:</h2>
            <div className={styles["subjects-container"]}>
              <Link href="/game/audiovisuais">
                <a>
                  <Snippet size="small" color="white" text="Audiovisuais" />
                </a>
              </Link>
              <Link href="/game/leitura">
                <a>
                  <Snippet size="small" color="white" text="Leitura" />
                </a>
              </Link>
              <Link href="/game/musicais">
                <a>
                  <Snippet size="small" color="white" text="Musicais" />
                </a>
              </Link>
              <Link href="/game/artisticas">
                <a>
                  <Snippet size="small" color="white" text="Artísticas" />
                </a>
              </Link>
              <Link href="/game/teatrais">
                <a>
                  <Snippet size="small" color="white" text="Teatrais" />
                </a>
              </Link>
            </div>
          </section>
        </div>
      </>
    );
}
