import React, { useEffect, useState, useRef } from "react";
import { auth, storage, firestore } from "../../../firebase/firebaseContext";
import userDefaultImage from "../../../public/images/user-default-image.png";
import styles from "./userInfoPage.module.css";
import UserOptions from "./compoenents/UsersOptions";
//import {functions} from '../../../firebase'
import { useRouter } from "next/router";

import firebase from "firebase/app";
import "firebase/functions";

export default function UserInfoPage(match) {
  const id = match.match.params.id;

  //Estados que serão usados em todos os casos:
  const [userInfo, setUserInfo] = useState({
    image: userDefaultImage,
    username: "...",
    bio: "",
    points: "...",
    achivs: [],
    following: [],
  });

  //Estados no caso do usário estar na página de seu próprio perfil:
  const refContainer = useRef();
  const [isCurrentUserPage, setIsCurrentUserPage] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [newImage, setNewImage] = useState("");

  const [usernameInputValue, setUsernameInputValue] = useState(
    userInfo.username
  );
  const [bioInputValue, setBioInputValue] = useState(userInfo.bio);

  //Estados no caso do usuário estar na página de outro perfil:
  const [isBeeigFollowed, setIsBeingFollowed] = useState(false);
  const [currentUserFollowing, setCurrentUserFollowing] = useState([]);

  useEffect(() => {
    if (id === auth.currentUser.uid) {
      setIsCurrentUserPage(true);
    }
  }, [id]);

  useEffect(() => {
    function getUserImage() {
      const storageRef = storage.ref(`users/${id}/profileImage`);
      storageRef.getDownloadURL().then((image) => {
        setUserInfo((userInfo) => {
          return { ...userInfo, image };
        });
      });
    }

    function getUserInfo() {
      firestore
        .collection("users")
        .doc(id)
        .get()
        .then((userCred) => {
            console.log(userCred)
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
          .doc(auth.currentUser.uid)
          .get()
          .then((userCred) => {
            const user = userCred.data();

            setCurrentUserFollowing(user.following);

            if (user.following.includes(id)) {
              setIsBeingFollowed(true);
            }
          });
        //console.log(currentUserFollowig)
        /*if(currentUserFollowig.includes(id)) {
                setIsBeingFollowed(true)
            }*/
      }
    }
  }, [isCurrentUserPage]);

  function handleClick() {
    //Caso da página ser do próprio usuário:

    if (isCurrentUserPage) {
      if (editMode) {
        updateUIwithInfoChanges();
        submitUserInfoChanges();
        setEditMode(false);

        if (newImage) {
          const storageRef = storage.ref(`users/${id}/profileImage`);
          storageRef.put(newImage);
        }
      } else {
        setEditMode(true);
      }

      function submitUserInfoChanges() {
        firestore
          .collection("users")
          .doc(id)
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

      submitFollowingUpdate(update)
      setIsBeingFollowed(false);
    } else {
      update = [...currentUserFollowing, id];

      submitFollowingUpdate(update);
      setIsBeingFollowed(true);
    }

    function submitFollowingUpdate(update) {
      firestore
        .collection("users")
        .doc(auth.currentUser.uid)
        .update({ following: update });
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

  return (
    <>
      <div className="user-info-page-container">
        <section className="user-basic-info-container">
          <div className="image-container">
            <img
              className={`user-image ${editMode && "clickable-img"}`}
              src={userInfo.image}
              alt="user imagem-usuário usuário"
              onClick={openFileWindow}
            />
            {editMode && <h3 className={``}>Change</h3>}
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

          {isCurrentUserPage && <UserOptions />}
        </section>

        <section className="user-extra-info-container">
          <div className="points-container">
            <h3>
              Points: <span>{userInfo.points}</span>
            </h3>
          </div>
          <p>
            Achivs: <span>{userInfo.achivs.length === 0 && "Nothing yet"}</span>
          </p>
        </section>
      </div>
    </>
  );
}
