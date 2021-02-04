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
import UserDefaultImage from "../../public/images/user-default-image.png";
import Head from "next/head";

export default function Ranking({ user }) {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [followingUsers, setFollowingUsers] = useState([]);
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
  const [isCurrentUserFollowingPage, setIsCurrentUserFollowingPage] = useState(
    false
  );
  const [username, setUsername] = useState("");

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

      if (router.query.type === "following") {
        const id = router.query.id;
        firestore
          .doc("users/" + id)
          .get()
          .then((userCred) => setUsername(userCred.data().username));

        if (id === uid) setIsCurrentUserFollowingPage(true);

        setIsFollowinPage(true);
        loadFollowingUsers(id);
      } else if (router.query.type === "default") {
        setIsFollowinPage(false);
        loadContent();
      } else {
        return;
      }
    });
  }, [uid, router]);

  useEffect(() => {
    if (lastFetchUser) console.log(lastFetchUser.data());
  }, [lastFetchUser]);

  useEffect(() => {}, [uid]);

  async function loadContent() {
    setIsLoadingData(true);
    let position = globalPosition;

    const ref = firestore
      .collection("users")
      .where("privateInfo", "==", false)
      .orderBy("points", "desc")
      .startAfter(lastFetchUser || 3000)
      .limit(15);

    const data = await ref.get();

    if (data.empty) {
      setIsDataEmpty(true);
    }

    data.forEach((user) => {
      position++;
      setGlobalPosition(position);
      let aUser = { ...user.data(), position, id: user.id };

      if (aUser.hasImage) {
        useGetUserImages(aUser, user.id, setUsers);
      } else {
        setUsers((users) => {
          return [...users, aUser];
        });
      }
    });

    setLastFetchUser(data.docs[data.docs.length - 1]);
  }

  async function loadFollowingUsers(uid) {
    setIsLoadingData(true);
    let position = globalPosition;

    const dataCurrentUser = await firestore.collection("users").doc(uid).get();

    const currentUser = dataCurrentUser.data();
    console.log(lastFetchUser);
    setCurrentUser({ ...currentUser, id: uid });

    const following = currentUser.following;
    following.forEach((id) => {
      console.log(id);
      firestore
        .collection("users")
        .doc(id)
        .get()
        .then((userCred) => {
          const user = { ...userCred.data(), id: userCred.id };
          console.log(user);
          if (user.hasImage) {
            getUserImages(user, userCred.id, setUsers);
          } else {
            setUsers((users) => {
              return [...users, user].sort((a, b) => {
                return b.points - a.points;
              });
            });
          }
          setIsLoadingData(false);
        })
        .catch((err) => console.log(err));

      function getUserImages(user, id, callback) {
        storage
          .ref(`/users/${id}/profileImage`)
          .getDownloadURL()
          .then((url) => {
            user = { ...user, image: url };
            callback((users) => {
              const sorted = [...users, user].sort((a, b) => {
                return b.points - a.points;
              });
              let position = 0;
              return sorted.map((user) => {
                position++;
                return { ...user, position };
              });
            });
          });

        return null;
      }
    });

    /*const followingUsers = await firestore
      .collection("users")
      .orderBy("points", "desc")
      .startAfter(lastFetchUser || 3000)
      .limit(100)
      .get();

    if (followingUsers.empty) {
      console.log('EMPTY')
      setIsLoadingData(false)
      setIsDataEmpty(true);
    }*/

    /*followingUsers.forEach((userCred) => {
      position++;
      setGlobalPosition(position)
      let user = userCred.data();

      if (!currentUser.following.includes(userCred.id)) return;

      let aUser = { ...user, id: userCred.id, position };

      useGetUserImages(aUser, userCred.id, setUsers);
    });*/

    setIsLoadingData(false);
    //setLastFetchUser(followingUsers.docs[followingUsers.docs.length - 1]);
  }

  function handleScroll(e) {
    if (isDataEmpty || isFollowingPage) return;
    const container = refContainer.current;
    let triggerHeight = container.scrollTop + container.offsetHeight;
    if (triggerHeight >= container.scrollHeight) {
      if (!isFollowingPage) {
        loadContent();
      }
    }
  }

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <>
      <Head>
        <title>BORA PAS - Ranking</title>
      </Head>
      <div
        ref={refContainer}
        className={styles["ranking-page-container"]}
        onScroll={handleScroll}
      >
        <h1 style={{ margin: "25px 0px 20px 0", justifySelf: "center" }}>
          {isFollowingPage
            ? isCurrentUserFollowingPage
              ? "Você segue"
              : `${username} segue:`
            : "Ranking Geral:"}
        </h1>
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
