import React, { useState, useEffect, useRef, useContext } from "react";
import { auth, storage, firestore } from "../../../firebase/firebaseContext";
import userDefaultImage from "../../../public/images/user-default-image.png";
import {GlobalContext} from '../../../context/GlobalContext'

export default function SignInModal({ setModalState }) {
    const refContainer = useRef('')
    const [globalState, setGlobalState] = useContext(GlobalContext)

  const [errorMsg, setErrorMsg] = useState("");
  const [imageFile, setImageFile] = useState('');
  const [defaultImageFile, setDefaultImageFile] = useState('')
  const [userImagePreview, setUserImagePreview] = useState(userDefaultImage);
  const [inputFieldValues, setInputFieldValues] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  function handleClick() {
    checkInputFields();
  }

  useEffect(()=> {
    let metadata = {
      type: 'image/png'
    }

    fetch(userDefaultImage)
      .then((response)=> {
        return response.blob()
      }).then((blob)=> {
        const file = new File([blob], "default.png", metadata);
        setDefaultImageFile(file)
      })
  }, [])

  function checkInputFields() {
    const MIN_LENGTH = 6;
    for (let prop in inputFieldValues) {
      if (inputFieldValues[prop].length === 0) {
        setErrorMsg(`please enter a ${prop} value`);
        return;
      }

      if (inputFieldValues[prop].length < MIN_LENGTH) {
        setErrorMsg(`${prop} is too short`);
        return;
      }

      if(inputFieldValues.password !== inputFieldValues.confirmPassword) {
          setErrorMsg('passwords are different')
          return
      }

      signInUser()
    }
  }

  function signInUser() {
      const {email, password} = inputFieldValues
      auth
        .createUserWithEmailAndPassword(email, password)
            .then(() => {
                uploadImageFile()
                createUserReferences()

                setGlobalState((globalState) => {
                  return {
                    ...globalState,
                    user: { ...globalState.user, isLoggedIn: true },
                  };
                });
            })
            .catch(err => {
                setErrorMsg(err.message)
            })


    function uploadImageFile() {
        console.log(imageFile)
        storage.ref(`users/${auth.currentUser.uid}/profileImage`).put(imageFile? imageFile : defaultImageFile)
    }

    function createUserReferences() {
        const {username} = inputFieldValues
        firestore.collection('users').doc(auth.currentUser.uid).set({
            username,
            bio: '',
            points: 0,
            pasType: 1,
            achivs: [],
            following: [],
            subjects: [],
            privateInfo: false
        }).then(output => {
          console.log(output)
        })
    }
  }


  function openFileWindow() {
      const fileInput = refContainer.current
      fileInput.click();
  }

  function setPreviewImage(e) {
      if (!e.target || !e.target.files[0]) return;
        setImageFile(e.target.files[0]);

      const imagePreview = e.target.files[0];
    /*const reader = new FileReader()
    reader.readAsDataURL();*/

    setUserImagePreview(URL.createObjectURL(imagePreview));
    /*reader.onload= ()=> {
        setUserImagePreview(reader.result)
    }*/

  }

  return (
    <div className="modal sign-up-modal">
      <h2>Criar conta:</h2>
      <section className="modal-user-info-container">
        <div className="modal-user-info">
          <div className="modal-user-image-place">
            <img onClick={openFileWindow} src={userImagePreview} alt="" />
            <input
              ref={refContainer}
              onChange={setPreviewImage}
              className="display-none"
              type="file"
              name=""
              id=""
            />
          </div>
          <h2 className="modal-user-current-name"></h2>
        </div>

        <form action="" className="form sign-in-form">
          <label className="input-label">
            Username:
            <input
              className="input-1"
              onChange={(e) =>
                setInputFieldValues((values) => {
                  return { ...values, username: e.target.value };
                })
              }
              type="text"
              name="username"
              id="username"
            />
          </label>
          <label className="input-label">
            Email:
            <input
              className="input-1"
              onChange={(e) =>
                setInputFieldValues((values) => {
                  return { ...values, email: e.target.value };
                })
              }
              type="text"
              name="email"
              id="email"
            />
          </label>
          <label className="input-label">
            Senha:
            <input
              className="input-1"
              onChange={(e) =>
                setInputFieldValues((values) => {
                  return { ...values, password: e.target.value };
                })
              }
              type="text"
              name="password"
              id="password"
            />
          </label>
          <label className="input-lavel">
            Confirmar senha:
            <input
              className="input-1"
              onChange={(e) =>
                setInputFieldValues((values) => {
                  return { ...values, confirmPassword: e.target.value };
                })
              }
              type="text"
              name="confirm-password"
              id="confirm-password"
            />
          </label>
        </form>
      </section>
      <button onClick={handleClick} className="btn">
        Sign in
      </button>

      {errorMsg && <div className="error-msg-place">{errorMsg}</div>}
    </div>
  );
}
