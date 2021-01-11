import React, { useContext, useEffect, useRef, useState } from "react";
import { auth, firestore, storage } from "../../firebase/firebaseContext";
import Header from "../../shared_components/Header";
import { GlobalContext } from "../../context/GlobalContext";
import User from "../../shared_components/User";
import styles from "./ranking.module.css";
import LoadingPage from "../LoadingPage";
import LoadingIcon2 from "../../public/images/loading-icon-2.svg";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSetPage } from "../../Hooks/useSetPage";
import { useGetUserImages } from "../../Hooks/useGetUserImages";

export default function Ranking({ user }) {
  const router = useRouter()
  const [users, setUsers] = useState([]);
  const [followingUsers, setFollowingUsers] = useState([])
  const [currentUser, setCurrentUser] = useState("");
  const [globalState, setGlobalState] = useContext(GlobalContext);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [lastFetchUser, setLastFetchUser] = useState(false);
  const [uid, setUid] = useState(user ? user.uid : "");
  const [globalPosition, setGlobalPosition] = useState(0);
  const [isDataEmpty, setIsDataEmpty] = useState(false);
  const refContainer = useRef("");
  const [isFollowingPage, setIsFollowinPage] = useState(false);

  useSetPage({ page: "Ranking" });

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

        setUid(auth.currentUser.uid);
      } else {
        if (typeof window !== "undefined") window.location.href = "/";
      }
      setIsLoading(false);

      if (router.query.type === 'following') {
        setIsFollowinPage(true)
        loadFollowingUsers(auth.currentUser.uid);
      } else if (router.query.type === 'default'){
        setIsFollowinPage(false)
        loadContent();
      } else {
        return
      }
    });
  }, [uid, router]);

  useEffect(() => {
    if(lastFetchUser) console.log(lastFetchUser.data())
  }, [lastFetchUser]);

  useEffect(() => {
    
  }, [uid]);

  async function loadContent() {
    setIsLoadingData(true);
    let position = globalPosition;

    const ref = firestore
      .collection("users")
      .where('privateInfo', '==', false)
      .orderBy("points", "desc")
      .startAfter(lastFetchUser || 3000)
      .limit(10);

    const data = await ref.get();

    if (data.empty) {
      setIsDataEmpty(true);
    }

    data.forEach((user) => {
      position++;
      setGlobalPosition(position);
      let aUser = { ...user.data(), position, id: user.id };

      useGetUserImages(aUser, user.id, setUsers);
    });

    setLastFetchUser(data.docs[data.docs.length - 1]);
  }

  async function loadFollowingUsers(uid) {
    setIsLoadingData(true)
    let position = globalPosition

    const dataCurrentUser = await firestore.collection("users").doc(uid).get();

    const currentUser = dataCurrentUser.data();
    //console.log(currentUser)
    setCurrentUser({ ...currentUser, id: uid });

    const followingUsers = await firestore
      .collection("users")
      .orderBy("points", "desc")
      .startAfter(lastFetchUser || 3000)
      .limit(10)
      .get();

    if (followingUsers.empty) {
      setIsLoadingData(false)
      setIsDataEmpty(true);
    }

    followingUsers.forEach((userCred) => {
      position++;
      setGlobalPosition(position)
      let user = userCred.data();

      if (!currentUser.following.includes(userCred.id)) return;

      let aUser = { ...user, id: userCred.id, position };

      useGetUserImages(aUser, userCred.id, setUsers);
    });

    setLastFetchUser(followingUsers.docs[followingUsers.docs.length - 1]);
  }

  function handleScroll(e) {
    if (isDataEmpty) return;
    const container = refContainer.current;
    let triggerHeight = container.scrollTop + container.offsetHeight;
    if (triggerHeight >= container.scrollHeight) {
      if(isFollowingPage) {
        loadFollowingUsers(uid)
      } else {
        loadContent()
      }
    }
  }

  

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <>
      <div
        ref={refContainer}
        className={styles["ranking-page-container"]}
        onScroll={handleScroll}
      >
        <h1 style={{margin: '25px 0px 20px 0', justifySelf: 'center'}}>{isFollowingPage ? "Você segue:" : "Ranking Geral:"}</h1>
        <section className={styles["users"]}>
          {users.map((user) => {
            return (
              <Link href={`user/${user.id}`}>
                <a>
                  <User user={user} classList="user-in-list" />
                </a>
              </Link>
            );
          })}
          {isLoadingData && !isDataEmpty ? (
            <img
              className={styles["loading-icon-2"]}
              src={LoadingIcon2}
              alt="carregando..."
            />
          ) : (
            ""
          )}
        </section>
      </div>
    </>
  );
}
