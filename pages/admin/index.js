import Head from "next/head";
import React, { useContext, useEffect, useState } from "react";
import { GlobalContext } from "../../context/GlobalContext";
import {
  auth,
  firestore,
  functions,
  storage,
} from "../../firebase/firebaseContext";
import { useSetPage } from "../../Hooks/useSetPage";
import LoadingPage from "../LoadingPage";
import styles from "./admin.module.css";

export default function index() {
  const [globalState, setGlobalState] = useContext(GlobalContext);
  const [numberOfQuestions, setNumberOfQuestions] = useState(0);
  const [uid, setUid] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [addAdminMsg, setAddAdminMsg] = useState("");
  const [addQuestionMsg, setAddQuestionMsg] = useState("");

  const [questionData, setQuestionData] = useState({
    question: "",
    type: "a",
    subject: "portugues",
    answer: "truly",
    pasType: 1,
    hasImage: false,
    alternatives: {
      alternative1: "",
      alternative2: "",
      alternative3: "",
      alternative4: "",
      alternative5: "",
    },
  });

  const [questionImageFile, setQuestionImageFile] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useSetPage({ page: "Admin" });

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

        function checkIfUserIsAdmin() {
          auth.currentUser.getIdTokenResult().then((result) => {
            if (!result.claims.admin) {
              if (window) {
                setIsLoading(true);
                window.location =
                  "https://www.youtube.com/watch?v=1svA2sGhDEE&t=1s";
              }
            }
          });
        }

        async function getNumberOfQuestions() {
          const ref = await firestore
            .doc("numberOfQuestions/numberOfQuestions")
            .get();
          setNumberOfQuestions(ref.data().number);
        }

        getNumberOfQuestions();
        checkIfUserIsAdmin();
        setUid(auth.currentUser.uid);
      } else {
        if (typeof window !== "undefined") window.location.href = "/";
      }
      setIsLoading(false);
    });
  }, [uid]);

  useEffect(() => {
    console.log(questionData);
  }, [questionData]);

  function handleSubmit(e) {
    e.preventDefault();
    const addAdminRole = functions.httpsCallable("addAdminRole");
    addAdminRole({ email }).then((result) => {
      setAddAdminMsg(result.data.message);
    });
  }

  function handlePasTypeChange(e) {
    const index = e.nativeEvent.target.selectedIndex;
    if (Number(e.nativeEvent.target[index].text) !== questionData.pasType) {
      setQuestionData(data => {
        return {...data, pasType: Number(e.nativeEvent.target[index].text)}
      })
    }
  }

  function handleTypeChange(e) {
    const index = e.nativeEvent.target.selectedIndex;
    if (e.nativeEvent.target[index].text !== questionData.type) {
      if (
        e.nativeEvent.target[index].text === "c" &&
        questionData.answer === "truly"
      ) {
        setQuestionData((data) => {
          return {
            ...data,
            answer: 1
          };
        });
      } else {
        setQuestionData((data) => {
          return {
            ...data,
            answer: 'truly',
          };
        });
      }
      setQuestionData((data) => {
        return { ...data, type: e.nativeEvent.target[index].text };
      });
    }
  }

  function handleSubjectChange(e) {
    const index = e.nativeEvent.target.selectedIndex;
    if (e.nativeEvent.target[index].text !== questionData.subject) {
      setQuestionData((data) => {
        return {
          ...data,
          subject: e.nativeEvent.target[index].text
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase(),
        };
      });
    }
  }

  function handleAnswerChange(e) {
    const index = e.nativeEvent.target.selectedIndex;
    if (e.nativeEvent.target[index].text !== questionData.answer) {
      if (
        e.nativeEvent.target[index].text === "Falsa" ||
        e.nativeEvent.target[index].text === "Verdadeira"
      ) {
        setQuestionData((data) => {
          return {
            ...data,
            answer:
              e.nativeEvent.target[index].text === "Falsa" ? "falsy" : "truly",
          };
        });
      } else {
        setQuestionData((data) => {
          return {
            ...data,
            answer:
              Number(e.nativeEvent.target[index].text)
          };
        });
      }
    }
  }

  function handleAlternativeChange(alternative) {
    setQuestionData((data) => {
      return {
        ...data,
        alternatives: { ...data.alternatives, ...alternative },
      };
    });
  }

  function handleClick() {
    checkFormFields();
    let documentId;

    function createQuestionReference() {
      if (questionData.type === "a") {
        firestore
          .collection("questions")
          .doc(documentId)
          .set({
            ...questionData,
            random: numberOfQuestions + 1,
            alternatives: false,
          })
          .then((result) => {
            console.log(result);
          });
      } else {
        firestore
          .collection("questions")
          .add({ ...questionData, random: numberOfQuestions + 1 })
          .then((result) => {
            console.log(result);
          });
      }
    }

    function checkFormFields() {
      const MIN_QUESTION_LENGTH = 6;
      const MAX_QUESTION_LENGTH = 30;
      const MAX_ALTERNATIVE_LENGTH = 20;

      if (questionData.question.length > MAX_QUESTION_LENGTH) {
        setAddQuestionMsg(
          `O Enunciado deve conter no máximo ${MAX_QUESTION_LENGTH} caractéres`
        );
      } else if (questionData.question.length < MIN_QUESTION_LENGTH) {
        setAddQuestionMsg(
          `O enunciado deve conter no mínimo ${MIN_QUESTION_LENGTH} caractéres`
        );
      } else if (questionData.type === "c") {
        const fields = questionData.alternatives;
        for (let alternative in fields) {
          if (fields[alternative].length < MIN_QUESTION_LENGTH) {
            setAddQuestionMsg(
              `Verifique se cada alternativa tem pelo menos ${MIN_QUESTION_LENGTH} caractéres`
            );
            return;
          } else if (fields[alternative].length > MAX_ALTERNATIVE_LENGTH) {
            setAddQuestionMsg(
              `Verifique se cada alternativa tem no mínimo ${MI_LENGTH} caractéres`
            );
            return;
          }
        }
        documentId = firestore.collection("questions").doc().id;
        createQuestionReference();
        createQuestionImageReference();
      } else {
        documentId = firestore.collection("questions").doc().id;
        createQuestionReference();
        createQuestionImageReference();
      }
    }

    function createQuestionImageReference() {
      if (!questionImageFile) return;
      storage
        .ref(`questions/${documentId}/questionImage`)
        .put(questionImageFile ? questionImageFile : "");
    }
  }

  function handleFile(e) {
    if (e.target.files[0]) {
      setQuestionImageFile(e.target.files[0]);
      setQuestionData((data) => {
        return { ...data, hasImage: true };
      });
    } else {
      setQuestionImageFile(false);
      setQuestionData((data) => {
        return { ...data, hasImage: false };
      });
    }
  }

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <>
      <Head>
        <title>BORA PAS - Admin</title>
      </Head>
      <div className={styles["admin-painel-container"]}>
        <section className={styles["add-admin-area"]}>
          <h2>Tornar administrador:</h2>
          <form onSubmit={handleSubmit}>
            <label>
              email:
              <input
                onChange={(e) => setEmail(e.target.value)}
                type="text"
                name=""
                id=""
                value={email}
              />
            </label>
            <label>
              senha do sistema:
              <input
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                name=""
                id=""
                value={password}
              />
            </label>
            <button className="btn">Tornar admin</button>
          </form>
          <p className="msg">{addAdminMsg}</p>
        </section>

        <section className={styles["add-question-container"]}>
          <h2>Submeter nova pergunta:</h2>
          <label>
            Enunciado
            <input
              onChange={(e) => {
                setQuestionData((data) => {
                  return { ...data, question: e.target.value };
                });
              }}
              type="text"
              id="enunciado"
            />
          </label>
          <label>
            Imagem (Opcional): <br />
            <input
              style={{ marginTop: 10 }}
              onChange={handleFile}
              type="file"
              name="image-file-input"
              id="image-file-input"
            />
          </label>

          <label>
            Etapapa do PAS:
            <select
              onChange={handlePasTypeChange}
              name="select-type"
              id="select-type"
            >
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
            </select>
          </label>

          <label>
            Tipo de questão:
            <select
              onChange={handleTypeChange}
              name="select-type"
              id="select-type"
            >
              <option value="a">a</option>
              <option value="c">c</option>
            </select>
          </label>
          <label>
            Matéria:
            <select
              onChange={handleSubjectChange}
              name="select-subject"
              id="select-subject"
            >
              <option value="portugues">Portugûes</option>
              <option value="literatura">Literatura</option>
              <option value="literatura">Inglês</option>
              <option value="literatura">Artes</option>
              <option value="literatura">História</option>
              <option value="literatura">Filosofia</option>
              <option value="literatura">Sociologia</option>
              <option value="literatura">Física</option>
              <option value="literatura">Química</option>
              <option value="literatura">Biologia</option>
              <option value="literatura">Matemática</option>
              <option value="literatura">Audiovisuais</option>
              <option value="literatura">Leitura</option>
              <option value="literatura">Musicais</option>
              <option value="literatura">Artísticas</option>
              <option value="literatura">Teatrais</option>
            </select>
          </label>

          {questionData && questionData.type === "a" ? (
            <label>
              Resposta:
              <select onChange={handleAnswerChange} name="" id="">
                <option value="truly">Verdadeira</option>
                <option value="falsy">Falsa</option>
              </select>
            </label>
          ) : (
            <>
              <section className={styles["alternatives-container"]}>
                <label>
                  Alternativa 1:
                  <input
                    onChange={(e) => {
                      handleAlternativeChange({ alternative1: e.target.value });
                    }}
                    type="text"
                    id="alter1"
                  />
                </label>
                <label>
                  Alternativa 2:
                  <input
                    onChange={(e) => {
                      handleAlternativeChange({ alternative2: e.target.value });
                    }}
                    type="text"
                    id="alter2"
                  />
                </label>
                <label>
                  Alternativa 3:
                  <input
                    onChange={(e) => {
                      handleAlternativeChange({ alternative3: e.target.value });
                    }}
                    type="text"
                    id="alter3"
                  />
                </label>
                <label>
                  Alternativa 4:
                  <input
                    onChange={(e) => {
                      handleAlternativeChange({ alternative4: e.target.value });
                    }}
                    type="text"
                    id="alter4"
                  />
                </label>
                <label>
                  Alternativa 5:
                  <input
                    onChange={(e) => {
                      handleAlternativeChange({ alternative5: e.target.value });
                    }}
                    type="text"
                    id="alter5"
                  />
                </label>
              </section>
              <label>
                Alternativa correta:
                <select
                  onChange={handleAnswerChange}
                  name="alternative-select"
                  id="alternative-select"
                >
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="3">4</option>
                  <option value="5">5</option>
                </select>
              </label>
            </>
          )}
          <button onClick={handleClick} className="btn">
            Submeter pergunta
          </button>
          <p>{addQuestionMsg}</p>
        </section>
      </div>
    </>
  );
}
