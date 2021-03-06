import React, { useEffect, useState } from "react";
import { auth, firestore, storage } from "../firebase/firebaseContext";
import Snippet from "../shared_components/Snippet";
import User from "../shared_components/User";
import Link from "next/link";
import { useGetUserImages } from "../Hooks/useGetUserImages";
import LoadingIcon2 from "../public/images/loading-icon-2.svg";
//import { loadGetInitialProps } from "next/dist/next-server/lib/utils";

export default function HomePage() {
  const [users, setUsers] = useState([]);
  const [followingUsers, setFollowingUsers] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [currentUser, setCurrentUser] = useState('')

  useEffect(() => {
    function getUsersWithHigherPontuations() {
      let position = 0;
      firestore
        .collection("users")
        .where('privateInfo', '==', false)
        .orderBy("points", "desc")
        .limit(10)
        .get()
        .then((users) => {
          users.forEach((user) => {
            position++;
            let aUser = { ...user.data(), position, id: user.id };

            if(aUser.hasImage) {
              useGetUserImages(aUser, user.id, setUsers);
            } else {
              setUsers(users => {
                return [...users, user]
              })
            }
            
          });
        });
    }

    function getFollowingUsers() {
      setIsLoadingData(true);

      firestore
        .collection("users")
        .doc(auth.currentUser.uid)
        .get()
        .then((userCred) => {
          const currentUser = userCred.data();
          const user = {
            ...userCred.data(),
            id: userCred.id,
          };
          console.log(user)
          setCurrentUser({ ...currentUser, id: userCred.id });

          const following = user.following;
          console.log(following.length)
          if(following.length === 0 || !following) {
            setIsLoadingData(false)
            return
          }

          following.forEach((id) => {
            firestore
              .collection("users")
              .doc(id)
              .get()
              .then((userCred) => {
                const user = { ...userCred.data(), id: userCred.id };
                if (user.hasImage) {
                  getUserImages(user, userCred.id, setFollowingUsers);
                } else {
                  setFollowingUsers((users) => {
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
        }).catch(err => {
          console.log(err)
          setIsLoadingData(false)
        })
    }

    /*function getFollowingUsers() {
      setIsLoadingData(true)
      let position = 0;

      firestore
        .collection("users")
        .doc(auth.currentUser.uid)
        .get()
        .then((userCred) => {
          const currentUser = userCred.data();
          setCurrentUser({...currentUser, id: userCred.id})

          firestore
            .collection("users")
            .orderBy("points", "desc")
            .limit(10)
            .get()
            .then((users) => {
              setIsLoadingData(false);
              users.forEach((userCred) => {
                position++;
                console.log(userCred)

                let user = userCred.data();
                if (!currentUser.following.includes(userCred.id)) return;
                let aUser = { ...user, id: userCred.id, position };

                useGetUserImages(aUser, userCred.id, setFollowingUsers);         
              })
            });
        });
    }*/

    getUsersWithHigherPontuations();
    getFollowingUsers();
  }, []);

  return (
    <div className="home-page-container">
      <Link href="/game">
        <a className="anchor-from-big">
          <Snippet
            classList="main-snippet"
            text="Testar meus conhecimentos"
            size="big"
            icon="book"
            color="green"
            ok
          />
        </a>
      </Link>

      <Snippet classList="rank-1-snippet" color="white" size="normal">
        {/*<SimpleBar style={{ maxHeight: 210 }} forceVisible="y" autoHide={true}>*/}
        <Link href="/ranking?type=default">
          <div className={`rank-snippet ${isLoadingData && "grid"}`}>
            <h2>Ranking geral:</h2>
            {!isLoadingData ? (
              users.map((user) => {
                return (
                  <Link href={`user/${user.id}`} key={user.id}>
                    <a href="">
                      <User user={user} />
                    </a>
                  </Link>
                );
              })
            ) : (
              <img
                style={{
                  width: 55,
                  justifySelf: "center",
                }}
                src={LoadingIcon2}
                alt="carregando..."
              />
            )}
            {!isLoadingData && (
              <p
                style={{
                  textAlign: "center",
                  fontWeight: "bold",
                  margin: 10,
                  color: "rgb(45, 156, 73)",
                }}
              >
                Ver mais
              </p>
            )}
          </div>
        </Link>
        {/*</SimpleBar>*/}
      </Snippet>

      <Snippet classList="rank-2-snippet" color="white" size="normal">
        {/*<SimpleBar style={{ maxHeight: 210 }} forceVisible="y" autoHide={true}>*/}
        <Link href={`/ranking?type=following&id=${currentUser.id}`}>
          <div className={`rank-snippet ${isLoadingData && "grid"}`}>
            <h2>Você segue:</h2>
            {!isLoadingData ? (
              followingUsers.length ? (
                followingUsers.map((user) => {
                  return (
                    <Link href={`user/${user.id}`} key={user.id}>
                      <a>
                        <User user={user} />
                      </a>
                    </Link>
                  );
                })
              ) : (
                <div className="snippet-msg">
                  <p>Você ainda não segue ninguém</p>
                </div>
              )
            ) : (
              <img
                style={{
                  width: 55,
                  justifySelf: "center",
                }}
                src={LoadingIcon2}
                alt="carregando..."
              />
            )}
          </div>
        </Link>
        {/*</SimpleBar>*/}
      </Snippet>

      <Link href={currentUser ? `user/${currentUser.id}` : "/"}>
        <a className="info-snippet long">
          <Snippet classList="info-snippet" size="long" color="white">
            <section className="points-section">
              <h2>Seus pontos:</h2>
              <h3 className="points">
                {currentUser ? currentUser.points : "..."}
              </h3>
            </section>

            <section className="achivs-section">
              <h4>Suas conquistas:</h4>
              {!isLoadingData && currentUser
                ? currentUser?.achivs?.length
                  ? currentUser.achivs.slice(0, 3).map((achiv) => {
                      return <p style={{ margin: "10px 0" }}>{achiv}</p>;
                    }, <p>...</p>)
                  : "você ainda não tem conquistas"
                : "..."}
            </section>
          </Snippet>
        </a>
      </Link>
    </div>
  );
}
