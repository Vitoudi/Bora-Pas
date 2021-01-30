import Link from 'next/link';
import React, { useContext, useEffect, useState } from 'react'
import { GlobalContext } from '../../context/GlobalContext';
import { auth, firestore, storage } from '../../firebase/firebaseContext';
import { useSetPage } from '../../Hooks/useSetPage';
import LoadingPage from '../LoadingPage';
import styles from './notifications.module.css'
import LoadingIcon2 from '../../public/images/loading-icon-2.svg'
import UserDefaultImage from '../../public/images/user-default-image.png'
import Head from 'next/head';

export default function NotificationPage() {
    
    const [isLoading, setIsLoading] = useState(false);
    const [globalState, setGlobalState] = useContext(GlobalContext);
    const { user } = globalState;
    const [uid, setUid] = useState(user.id);
    const [currentUser, setCurrentUser] = useState(null)
    const [notifications, setNotifications] = useState([])
    const [isLoadingData, setIsLoadingData] = useState(false)

    useSetPage({ page: "Notificações" });

    

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
      });
    }, [uid]);

    useEffect(()=> {
        if(!uid || currentUser) return
        function getCurrentUser() {
            firestore.collection("users").doc(uid).get()
                .then(userCred => {
                    setCurrentUser({...userCred.data(), id: userCred.id})
                })
        }
        getCurrentUser()
    }, [uid])

    useEffect(()=> {
        if(!uid) return
        function updatePandingNotifiations() {
            firestore.collection("users").doc(uid).update({
              pendingNotifications: false,
            });
        }

        updatePandingNotifiations()
    }, [uid])

    useEffect(() => {
        setIsLoadingData(true)
      if (!currentUser) return;

      if (currentUser.notifications?.length) {
        fetchNotifications();
      } else {
        setIsLoadingData(false);
      }

      function fetchNotifications() {
        currentUser.notifications.forEach((notification) => {
            console.log(notification)
          firestore
            .collection("users")
            .doc(notification.uid)
            .get()
            .then((userCred) => {
              const value = {
                ...notification,
                user: { ...userCred.data(), id: userCred.id },
              };

              if (value.user.hasImage) {
                getUserImage(value, notification.uid, setNotifications);
              } else {
                setNotifications((notifications) => {
                  return [...notifications, value];
                });
              }

              setIsLoadingData(false);
            })
            .catch((err) => {
              setIsLoadingData(false);
              console.log(err);
            });
        });

        function getUserImage(notification, id, callback) {
          storage
            .ref(`/users/${id}/profileImage`)
            .getDownloadURL()
            .then((url) => {
              notification = {
                ...notification,
                user: { ...notification.user, image: url },
              };
              callback((notifications) => {
                return [...notifications, notification].sort((a, b) => {
                  return (b.time || 0) - (a.time || 0);
                });
              });
            });
        }
      }
    }, [currentUser]);

    function handleClick() {
      setNotifications([]);
      firestore.collection("users").doc(uid).update({
        notifications: [],
      });
    }

    if (isLoading) {
      return <LoadingPage />;
    }

    if(isLoadingData) {
        return (
          <>
            <Head>
              <title>BORA PAS - Notificações</title>
            </Head>
            <div
              style={{
                justifyContent: "center",
                alignContent: "center",
                height: "80vh",
                width: "100%",
                display: "grid",
              }}
            >
              <img
                style={{
                  width: "60px",
                  height: "60px",
                  justifySelf: "center",
                  alignSelf: "center",
                }}
                src={LoadingIcon2}
                alt="carregando..."
              />
            </div>
          </>
        );
    }

    if(!notifications.length) {
        return (
          <>
            <Head>
              <title>BORA PAS - Notificações</title>
            </Head>
            <div
              style={{
                justifyContent: "center",
                alignContent: "center",
                height: "80vh",
                width: "100%",
                display: "grid",
              }}
            >
              <h2
                style={{
                  color: "rgb(180, 180, 180)",
                  fontWeight: "bold",
                  textAlign: "center",
                }}
              >
                Sem novas notificações
              </h2>
            </div>
          </>
        );
    }

    return (
      <>
        <Head>
          <title>BORA PAS - Notificações</title>
        </Head>
        <div className={styles["container"]}>
          <h2 style={{ textAlign: "center", marginBottom: "10px" }}>
            Notificações:
          </h2>
          <button className="btn" style={{width: '70px', justifySelf: 'center', backgroundColor: 'rgb(150, 150, 150)'}} onClick={handleClick}>Limpar</button>
          {notifications.map((notification) => {
            return (
              <Link
                href={`user/${notification.user.id}`}
                key={notification.user.id}
              >
                <a href="">
                  <div className={styles["notification"]}>
                    <img
                      className={styles["notification-image"]}
                      src={
                        notification.user.image
                          ? notification.user.image
                          : UserDefaultImage
                      }
                      alt="imagem notificação"
                    />
                    <p className={styles["notification-title"]}>
                      {notification.title}
                    </p>
                  </div>
                </a>
              </Link>
            );
          })}
        </div>
      </>
    );
}

