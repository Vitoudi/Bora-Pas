import React, { useEffect, useState, useRef, useContext } from "react";
import {
  auth,
  storage,
  firestore,
  functions,
} from "../../firebase/firebaseContext";
import userDefaultImage from "../../public/images/user-default-image.png";
import styles from "./userInfoPage.module.css";
import UserOptions from "./compoenents/UsersOptions";
import { GlobalContext } from "../../context/GlobalContext";
import { useRouter } from "next/router";
import LoadingPage from "../LoadingPage";
import { useSetPage } from "../../Hooks/useSetPage";
import convertSubjectNameToUTF8 from "../../Hooks/convertSubjectNameToUTF8";
import Head from "next/head";
import Link from "next/link";

export default function UserInfoPage() {
  const router = useRouter()
  const [globalState, setGlobalState] = useContext(GlobalContext);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = globalState;
  const [uid, setUid] = useState(user.id);
  const [isFollowing, setIsFollowing] = useState([])
  const id = useRouter().asPath.split("/")[2];

  useSetPage({ page: "User" });

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

  //Estados que serão usados em todos os casos:
  const [userInfo, setUserInfo] = useState({
    image: userDefaultImage,
    username: "...",
    bio: "",
    points: "...",
    subjects: [],
    achivs: [],
    following: [],
    privateInfo: false
  });

  //Estados no caso do usário estar na página de seu próprio perfil:
  const refContainer = useRef();
  const [isCurrentUserPage, setIsCurrentUserPage] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [newImage, setNewImage] = useState("");
  const [checkPrivateInfoCheckbox, setCheckPrivateInfoCheckbox] = useState(false)

  const [usernameInputValue, setUsernameInputValue] = useState(
    userInfo.username
  );
  const [bioInputValue, setBioInputValue] = useState(userInfo.bio);

  //Estados no caso do usuário estar na página de outro perfil:
  const [isBeeigFollowed, setIsBeingFollowed] = useState(false);
  const [currentUserFollowing, setCurrentUserFollowing] = useState([]);

  useEffect(() => {
    if (id === uid) {
      setIsCurrentUserPage(true);
    }
  }, [id, uid]);

  useEffect(() => {
    if (!uid) return;
    function getUserImage() {
      const storageRef = storage.ref(`users/${id}/profileImage`); //just id
      storageRef.getDownloadURL().then((image) => {
        setUserInfo((userInfo) => {
          return { ...userInfo, image };
        });
      });
    }

    function getUserInfo() {
      firestore
        .collection("users")
        .doc(id) //just id
        .get()
        .then((userCred) => {
          const user = userCred.data();

          setUserInfo((userInfo) => {
            return { ...userInfo, ...user };
          });

          setUsernameInputValue(user.username);
          setBioInputValue(user.bio);
        });
    }

    getUserImage();
    getUserInfo();

    //Configuração inicial no caso da página ser de outro usuário
    if (!isCurrentUserPage) {
      checkIfUserIsBeeigFollowed();
      function checkIfUserIsBeeigFollowed() {
        firestore
          .collection("users")
          .doc(uid)
          .get()
          .then((userCred) => {
            const user = userCred.data();

            setCurrentUserFollowing(user.following);

            if (user.following.includes(id)) {
              //just id
              setIsBeingFollowed(true);
            }
          });
      }

    }
  }, [isCurrentUserPage, uid]);

  useEffect(()=> {
    if(!userInfo.username) return
    function getFollowingUsers() {
      const following = userInfo.following
      following.forEach(id => {
        firestore.doc('users/' + id).get()
          .then(userCred => {
            if(!userCred.data()) return
            const user = {
              username: userCred.data().username,
              id: userCred.id
            };
            setIsFollowing(users => {
              return [...users, user]
            })
          })
      })
    
      
    }

    getFollowingUsers()

    if(!isCurrentUserPage || !userInfo.username) return
    function verifyCheckbox() {
      if (userInfo.privateInfo) {
        setCheckPrivateInfoCheckbox(true);
      } else {
        setCheckPrivateInfoCheckbox(false);
      }
    }
  
    verifyCheckbox();
  }, [userInfo])

  function handleClick() {
    //Caso da página ser do próprio usuário:

    if (isCurrentUserPage) {
      if (!uid) return;
      if (editMode) {
        updateUIwithInfoChanges();
        submitUserInfoChanges();
        setEditMode(false);

        if (newImage) {
          const storageRef = storage.ref(`users/${uid}/profileImage`);
          storageRef.put(newImage);
        }
      } else {
        setEditMode(true);
      }

      function submitUserInfoChanges() {
        firestore
          .collection("users")
          .doc(uid)
          .update({ username: usernameInputValue, bio: bioInputValue });
      }

      function updateUIwithInfoChanges() {
        setUserInfo((userInfo) => {
          return {
            ...userInfo,
            username: usernameInputValue,
            bio: bioInputValue,
          };
        });
      }
      return;
    }

    //Caso a página seja de outro usuário

    let update;

    if (isBeeigFollowed) {
      update = currentUserFollowing.filter((user) => {
        return user !== id;
      });

      submitFollowingUpdate(update);
      setIsBeingFollowed(false);
    } else {
      update = [...currentUserFollowing, id];
      submitFollowingUpdate(update);
      setIsBeingFollowed(true);
    }

    function submitFollowingUpdate(update) {
      firestore.collection("users").doc(uid).update({ following: update });
    }
  }

  function openFileWindow() {
    if (!editMode) return;
    const fileInput = refContainer.current;
    fileInput.click();
  }

  function changeUserImage(e) {
    const imageFile = e.target.files[0];
    const image = URL.createObjectURL(imageFile);

    setNewImage(imageFile);
    setUserInfo((userInfo) => {
      return { ...userInfo, image };
    });
  }

  function handleCheck(e) {
    const checked = checkPrivateInfoCheckbox

    checked? setCheckPrivateInfoCheckbox(false) : setCheckPrivateInfoCheckbox(true)

    firestore
      .collection("users")
      .doc(uid)
      .update({ privateInfo: checked? false : true });
  }

  function getSubjects(userSubjects) {
    return userSubjects
      .filter((subject) => {
        return subject.points > 15 && subject.subject !== "geral";
      })
      .slice(0, 3)
      .map((subject) => convertSubjectNameToUTF8(subject.subject).toLowerCase())
      .join(", ")
      .toString();
  }

  function redirectToUserPage(id) {
    let userId = id
    /*if(typeof(id) !== 'object') router.push('/user/' + userId).then(() => {
      //router.reload()
    })*/
    if(window && typeof(id) !== 'object') window.location.href = '/user/' + userId
  }

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <>
      <Head>
        <title>BORA PAS - {userInfo.username}</title>
      </Head>
      <div className={styles["user-info-page-container"]}>
        <div className={styles["wrapper"]}>
          <section className={styles["user-basic-info-container"]}>
            <div className={styles["image-container"]}>
              <img
                className={`${styles["user-image"]} user-image ${
                  editMode && "clickable-img"
                }`}
                src={userInfo.image}
                alt="user user-info usuário"
                onClick={openFileWindow}
              />
              {editMode && <h3 className={``}>Mudar</h3>}
            </div>
            <input
              ref={refContainer}
              onChange={changeUserImage}
              className="display-none"
              type="file"
              name=""
              id=""
            />

            {editMode ? (
              <input
                className="input-2 user-info-username-input"
                type="text"
                name="bio"
                id="username"
                onChange={(e) => setUsernameInputValue(e.target.value)}
                value={usernameInputValue}
              />
            ) : (
              <h2 className="user-info-username">{userInfo.username}</h2>
            )}

            {editMode ? (
              <input
                placeholder="bio..."
                className="input-2"
                type="text"
                name="bio"
                id="bio"
                onChange={(e) => setBioInputValue(e.target.value)}
                value={bioInputValue}
              />
            ) : (
              <p className="user-info-bio">
                {isCurrentUserPage
                  ? userInfo.bio
                    ? userInfo.bio
                    : "Sua bio..."
                  : userInfo.bio
                  ? userInfo.bio
                  : "..."}
              </p>
            )}
            <button
              onClick={handleClick}
              className={`btn ${
                !isCurrentUserPage && isBeeigFollowed && "btn-changed"
              }`}
            >
              {isCurrentUserPage
                ? editMode
                  ? "Salvar mudanças"
                  : "Editar perfil"
                : isBeeigFollowed
                ? "Parar de sequir"
                : "Seguir"}
            </button>

            {isCurrentUserPage && (
              <>
                <div className={styles["private-area"]}>
                  <label
                    className={styles["check-private-container"]}
                    htmlFor="check-private"
                  >
                    <input
                      onClick={handleCheck}
                      checked={checkPrivateInfoCheckbox}
                      className={styles["check-private-input"]}
                      type="checkbox"
                      id="check-private"
                      name="check-private"
                    ></input>
                    <div className={styles["check-ptivete-fill"]}></div>
                  </label>
                  <p>Manter pontuação privada</p>
                </div>
              </>
            )}
          </section>
          {isCurrentUserPage && <UserOptions />}

          {isCurrentUserPage || !userInfo.privateInfo ? (
            <section
              style={{ maxWidth: 400 }}
              className={styles["user-extra-info-container"]}
            >
              <div className={styles["points-container"]}>
                <h3>
                  Pontos: <span>{userInfo.points}</span>
                </h3>
              </div>
              {isFollowing && isFollowing.length !== 0 && (
                <div className={styles["following-container"]}>
                  <p>
                    Segue{" "}
                    <span
                      style={{ cursor: "pointer" }}
                      onClick={redirectToUserPage}
                    >
                      {isFollowing.slice(0, 3).map((user) => {
                        return (
                          <span onClick={() => redirectToUserPage(user.id)}>
                            {user.username},{" "}
                          </span>
                        );
                      })}
                      {isFollowing.length > 3 && (
                        <span style={{ color: "var(--main-color)" }}>
                          <Link href={`/ranking?type=following&id=${id}`} replace>
                            <a>
                              <span>mais...</span>
                            </a>
                          </Link>
                        </span>
                      )}
                    </span>
                  </p>
                </div>
              )}
              <p>
                Se dá melhor em:{" "}
                <span>
                  {userInfo.subjects.length
                    ? getSubjects(userInfo.subjects) || "sem dados o suficiente"
                    : "sem dados o sufiiente"}
                </span>
              </p>
              <p>
                Conquistas:{" "}
                <span>
                  {userInfo.achivs.length === 0
                    ? "Ainda nada..."
                    : userInfo.achivs.join(", ")}
                </span>
              </p>
            </section>
          ) : (
            <section className={styles["user-extra-info-container"]}>
              <h2>Pontuação privada</h2>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
