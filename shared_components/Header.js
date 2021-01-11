import React, { useEffect, useState, useContext, useRef } from "react";
import { GlobalContext } from "../context/GlobalContext";
import Nav from "./Nav";
import { auth, firestore, storage } from "../firebase/firebaseContext";
import Link from 'next/link';
import searchIcon from '../public/images/search-icon.svg'
import closeIcon from '../public/images/close-icon.svg'
import User from "./User";
import userDefaultImage from '../public/images/user-default-image.png'
import { loadGetInitialProps } from "next/dist/next-server/lib/utils";

export default function Header() {
  const refContainer = useRef('')
  const [username, setUsername] = useState("");
  const [userImage, setUserimage] = useState("");
  const [isAdmin, setIsAdmin] = useState(false)
  const [searchMode, setSearchMode] = useState(false)
  const [searchInputValue, setSearchInputValue] = useState('')
  const [results, setResults] = useState([])
  const [queryReturnEmptyResults, setQueryReturnEmptyResults] = useState(false)
  const [endAnimation, setEndAnimation] = useState(false)

  const [globalState, seGlobalState] = useContext(GlobalContext);
  const { user } = globalState;

  const uid = user.uid;
  const id = user.uid;

  useEffect(() => {
    if(!uid) return
    function getUsername() {
      try {
        firestore
          .collection("users")
          .doc(uid)
          .get()
          .then((user) => setUsername(user.data()? user.data().username : 'username'));
      }
      catch {
        setUsername('username')
      }
      
    }

    function getUserImage() {
      setUserimage(userDefaultImage);
        const storageRef = storage.ref(`users/${uid}/profileImage`)
        storageRef.getDownloadURL()
            .then((url=> {
                setUserimage(url)
            }))
      
        
    }

    function checkIfUserIsAdmin() {
      auth.currentUser.getIdTokenResult().then((result) => {
        if (result.claims.admin) {
          setIsAdmin(true);
        }
      });
    }
    

    checkIfUserIsAdmin()
    getUsername();
    getUserImage()
  }, [uid]);

  useEffect(()=> {
    if(!endAnimation) return
    setTimeout(()=> {
      setSearchMode(false)
      setEndAnimation(false);
    }, 220)
  }, [endAnimation])


  useEffect(() => {
    const input = document.querySelector("header #search-input");
    if(!input) return

    setTimeout(()=> {
      input.focus();
    }, 310)
    

  }, [searchMode]);


  async function handleSearch() {
    const data = await firestore.collection('users')
      .where('username', '==', searchInputValue)
      .get()

    if(data.empty) {
      setQueryReturnEmptyResults(true)
      return
    }

    data.forEach(doc => {
      const user = {...doc.data(), id: doc.id}
      getUserImages(user, doc.id, setResults)
    })

    function getUserImages(user, id, callback) {
      storage
        .ref(`/users/${id}/profileImage`)
        .getDownloadURL()
        .then((url) => {
          user = { ...user, image: url };

          callback((users) => {
            return [...users, user]
              .sort((a, b) => {
                return b.points - a.points;
              })
              .filter((user) => {
                return user.points !== 0;
              });
          });
        });
    }
  }



  if(uid && !searchMode) {
    return (
      <header>
        <div className="wrapper">
          <h1 className="logo-2">
            bora <span>pas</span>
          </h1>
          <Nav isAdmin={isAdmin} />

          <section className="search-place-container" onClick={()=> {
            setSearchMode(true)
            }}>
            <img className="search-icon" src={searchIcon} alt="busca" />
          </section>

          <Link
            className="link"
            href="https://google.com"
            href={`/user/${uid}`}
            id={uid}
          >
            <div
              style={{ cursor: "pointer" }}
              className="header-user-info-container"
            >
              <p>{username}</p>
              <img src={userImage} alt="user usuário imagem-usuário" />
            </div>
          </Link>
        </div>
      </header>
    );
  } else if(uid && searchMode) {
    return (
      <>
        <header className={`${endAnimation ? "slide-out" : "search-mode"}`}>
          <input
            onChange={(e) => {
              setSearchInputValue(e.target.value);
              setResults([]);
              setQueryReturnEmptyResults(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
            value={searchInputValue}
            type="text"
            placeholder="Buscar usuário... (É preciso digitar o nome de usuário perfeitamente)"
            name="search-input"
            id="search-input"
            ref={refContainer}
          />

          <div className="search-actions">
            <img onClick={handleSearch} src={searchIcon} alt="buscar" />
            <img
              onClick={() => {
                setEndAnimation(true);
                setQueryReturnEmptyResults(false);
                setSearchInputValue("");
                setResults([]);
              }}
              src={closeIcon}
              alt="fechar"
              className="close-icon"
            />
          </div>
        </header>

        {(results.length !== 0 || queryReturnEmptyResults) && (
          <section
          onClick={()=> {
            setSearchMode(false)
          }}
            className={` ${
              results.length === 0 ? "display-none" : "slide-down"
            } search-results-container`}
          >
            {!queryReturnEmptyResults ? (
              results.map((user) => {
                return (
                  <Link href={`/user/${user.id}`} replace>
                    <a>
                      <User user={user} />
                    </a>
                  </Link>
                );
              })
            ) : (
              <p className="empty-results-msg">
                Nenhum resultado... (verifique se digitou o nome do usuário
                corretamente)
              </p>
            )}
          </section>
        )}
      </>
    );
  }

  return null


  
}
