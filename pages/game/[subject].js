import { useRouter } from "next/router";
import React, { useContext, useEffect, useState } from "react";
import { GlobalContext } from "../../context/GlobalContext";
import { auth, firestore, storage } from "../../firebase/firebaseContext";
import checkAchivs from "../../Hooks/checkAchivs";
import convertSubjectNameToUTF8 from "../../Hooks/convertSubjectNameToUTF8";
import { useSetPage } from "../../Hooks/useSetPage";
import LoadingPage from "../LoadingPage";
import styles from "./game.module.css";

export default function SubjectGamePage() {
  const possibleSubjects = ['geral', 'portugues', 'literatura', 'ingles',  'artes', 'historia', 'geografia', 'filosofia', 'sociologia', 'fisica', 'quimica', 'biologia', 'matematica', 'audiovisuais', 'leitura', 'musicais', 'artisticas', 'teatrais']
  const router = useRouter()
  const href = router.asPath.split("/")[2];
  const [subject, setSubject] = useState('')
  const [globalState, setGlobalState] = useContext(GlobalContext);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = globalState;
  const [uid, setUid] = useState(user.id);

  const [gameHasStarted, setGameHasStarted] = useState(false);
  const [numberOfQuestions, setNumberOfQuestions] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(
    questions && currentIndex ? questions[currentIndex] : ""
  );
  const [gameIsRunning, setGameIsRunning] = useState(false);
  const [currentUser, setCurrentUser] = useState("");
  const [pointsInThisGame, setPointsInThisGame] = useState(0);
  const [numberOfCorrectAnswers, setNumberOfCorrectAnswers] = useState(0)
  const [turnResult, setTurnResult] = useState();
  const [gameHasEnded, setGameHasEnded] = useState(false);
  const [isTransitionHappening, setIsTransitionHappening] = useState(false);
  const randomNumbersArray = [];
  const [gameTime, setGameTime] = useState(null)
  const [newAchiv, setNewAchiv] = useState(null)

  const questionsInThisTurn = [0];
  const MAX_NUMBER_OF_QUESTIONS = 10;

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

        async function getCurrentUser() {
          const user = await firestore
            .doc(`users/${auth.currentUser.uid}`)
            .get();
          setCurrentUser(user.data());
        }

        async function getNumberOfQuestions() {
          const ref = await firestore
            .doc("numberOfQuestions/numberOfQuestions")
            .get();
          setNumberOfQuestions(ref.data().number);
        }

        getCurrentUser();
        getNumberOfQuestions();
        setUid(auth.currentUser.uid);
      } else {
        if (typeof window !== "undefined") window.location.href = "/";
      }
      setIsLoading(false);
    });
  }, [uid]);

  useEffect(()=> {
    if(!possibleSubjects.includes(href) && window) window.location.href = '/' 
    
    setSubject(convertSubjectNameToUTF8(href))
  }, [])

  useEffect(() => {
    createArrayOfRandomNumbers();
    if (gameHasStarted) {
      fetchQuestions().then(() => {
        startGameTime();
      });
    }
  }, [gameHasStarted]);

  useEffect(() => {
    console.log(questions)
    if(questions.length) {
      if (!questions[currentIndex]) {setGameHasEnded(true); console.log('game has ended from third') 
        return}
        if (questions[currentIndex].hasImage) {
          storage
            .ref(`/questions/${questions[currentIndex].id}/questionImage`)
            .getDownloadURL()
            .then((url) => {
              setCurrentQuestion({ ...questions[currentIndex], image: url });
            });
        } else {
          setCurrentQuestion(questions[currentIndex]);
        }
    }
  
  }, [questions, currentIndex]);

  useEffect(() => {
    if(!gameHasStarted) return

    const gameInfo = {
      uid,
      subject: href,
      pointsInThisGame,
      numberOfCorrectAnswers,
      MAX_NUMBER_OF_QUESTIONS,
      userPoints: currentUser.points,
      userAchivs: currentUser.achivs,
      userSubjects: currentUser.subjects
    }

    setNewAchiv(checkAchivs(gameInfo))
      firestore
        .collection("users")
        .doc(uid)
        .update({ points: currentUser.points + pointsInThisGame });

        clearTimeout(gameTime);
        setGameTime(null)
        
  }, [gameHasEnded]);

  useEffect(() => {
    if ((!currentQuestion || !currentQuestion.id) && currentIndex) setGameHasEnded(true);
    console.log(currentQuestion)
  }, [currentQuestion]);

  useEffect(()=> {
    console.log("game is running: " + gameIsRunning);
  }, [gameIsRunning])


  function createArrayOfRandomNumbers() {
    for (let i = 1; i <= numberOfQuestions; i++) {
      randomNumbersArray.push(i);
    }
  }

  async function fetchQuestions() {
    if (randomNumbersArray.length === 0) return

    for (let i = 0; i < MAX_NUMBER_OF_QUESTIONS ; i++) {
      if (randomNumbersArray.length === 0) return;
      const ref = firestore.collection("questions");
      const randomGraterThanOrLessThan =
        randomIntFromInterval(0, 1) === 0 ? "<=" : ">=";

      const randomIndex = randomIntFromInterval(
        0,
        randomNumbersArray.length - 1
      );
      const random = randomNumbersArray[randomIndex];

      console.log(questionsInThisTurn)
      let questionData;
      if(href === 'geral') {
        questionData = await ref
          .where("pasType", "==", currentUser.pasType)
          .where("random", `>=`, random)
          .where("random", "not-in", questionsInThisTurn)
          .orderBy("random")
          .limit(1)
          .get();
      } else {
        questionData = await ref
          .where("pasType", "==", currentUser.pasType)
          .where("random", ">=", random)
          .where("random", "not-in", questionsInThisTurn)
          .where("subject", "==", href)
          .orderBy("random")
          .limit(1)
          .get();

        if(questionData.docs.length === 0) {
          questionData = await ref
            .where("pasType", "==", currentUser.pasType)
            .where("random", "<=", random)
            .where("random", "not-in", questionsInThisTurn)
            .where("subject", "==", href)
            .orderBy("random")
            .limit(1)
            .get();
        }
      }

      if(!questionData) return

      questionData.forEach((question) => {
        questionsInThisTurn.push(question.data().random);
      });


      let question;
      let questionId
      randomNumbersArray.splice(randomIndex, 1);

      questionData.forEach((questionData) => {
        if(!questionData.id) return
        question = questionData.data();
        questionId = questionData.id
      });

      if (!questionId) return;
      setQuestions((questions) => {
        return [...questions, {...question, id: questionId}];
      });
    }

    function randomIntFromInterval(min, max) {
      // min and max included
      return Math.floor(Math.random() * (max - min + 1) + min);
    }
  }

  function startGameTime() {
    setGameIsRunning(true);

    if(gameTime === null || questions.length !== 0) {
      setGameIsRunning(true)
      setGameTime(setTimeout(() => {
        setCurrentIndex((value) => {
          return value + 1;
        });

        resetGame()

        
      }, 2 * 1000 * 60));
    }
  }

  function resetGame() {
    clearTimeout(gameTime);
    setGameTime(null);
    setGameIsRunning(false);
    

    setTimeout(() => {
      startGameTime()
    }, 100);
  }

  function handleClick(e) {
    const answer = e.target.getAttribute("data-command");
    evalueteTurn(answer);
  }

  function evalueteTurn(answer) {
    if (String(answer) == String(currentQuestion.answer)) {
      if(currentQuestion.type === 'a') {
        setPointsInThisGame(pointsInThisGame + 1);
        setTurnResult("+1");
      } else {
        setPointsInThisGame(pointsInThisGame + 3);
        setTurnResult("+3");
      }
      setNumberOfCorrectAnswers(numberOfCorrectAnswers +1)
    } else if (answer !== "jump") {
      if (currentQuestion.type === "a") {
        setPointsInThisGame(pointsInThisGame - 1);
        setTurnResult("-1");
      } else {
        setPointsInThisGame(pointsInThisGame - 3);
        setTurnResult("-3");
      } 
    }

    setGameIsRunning(false);
    setIsTransitionHappening(true);

    clearTimeout(gameTime);
    setGameTime(null);

    setTimeout(() => {
      startGameTime();
      setTurnResult("");
      setCurrentIndex(currentIndex + 1);
      setIsTransitionHappening(false);
    }, 799);
  }

  if (isLoading) {
    return <LoadingPage />;
  }

  if (gameHasEnded) {
    return (
      <div className={styles["game-container"]}>
        <h1 style={{justifySelf: 'center', alignText: 'center', marginBotton: 10}}>Pontuação obtida: {pointsInThisGame}</h1>
        {newAchiv && (
          <section className={styles["new-achiv-container"]}>
            <h2>
              Nova conquista: <span>{newAchiv[0]}</span>
            </h2>
          </section>
        )}
      </div>
    );
  }

  if (!gameHasStarted) {
    return (
      <div className={styles["game-container"]}>
        <h1 className={styles["subject-title"]}>{subject}</h1>
        <button
          onClick={() => setGameHasStarted(true)}
          className={`btn ${styles["start-game-btn"]}`}
        >
          Começar
        </button>
      </div>
    );
  }

  if (gameHasStarted) {
    return (
      <>
        <div
          className={`${styles["time-bar"]} ${
            gameIsRunning ? styles["start-time"] : styles["end-time"]
          }`}
        >
          <p>Tempo para a próxima pergunta</p>
        </div>
        <div className={`${styles["game-container"]} ${styles["started"]}`}>
          <h3>{subject}</h3>
          <h2
            className={`${
              turnResult ? styles["turn-result"] : styles["hide-result"]
            } ${turnResult && (turnResult[0] === "-"? styles["wrong"] : styles["rigth"])}`}
          >
            {turnResult}
          </h2>
          <div
            className={` ${styles["question-container"]} ${
              isTransitionHappening && styles["question-transtion"]
            }`}
          >
            {currentQuestion && (
              <>
              {currentQuestion.hasImage && <img className={styles['question-image']} src={currentQuestion.image} alt=""/>}
                <h1 className={styles["question-title"]}>
                  {currentQuestion.question}
                </h1>
                <section className={styles["aswer-conatiner"]}>
                  {currentQuestion.type === "a" ? (
                    <div
                      onClick={handleClick}
                      className={styles["btns-container"]}
                    >
                      <button data-command="truly" className="btn">
                        Certo
                      </button>
                      <button data-command="falsy" className="btn">
                        Errado
                      </button>
                      <button data-command="jump" className="btn btn-changed">
                        Pular
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={handleClick}
                      className={styles["btns-container-multiple"]}
                    >
                      {currentQuestion.alternatives &&
                      <><button data-command="1" className="btn">
                        {currentQuestion.alternatives.alternative1}
                      </button>
                      <button data-command="2" className="btn">
                        {currentQuestion.alternatives.alternative2}
                      </button>
                      <button data-command="3" className="btn">
                        {currentQuestion.alternatives.alternative3}
                      </button>
                      <button data-command="4" className="btn">
                        {currentQuestion.alternatives.alternative4}
                      </button>
                      <button data-command="jump" className="btn btn-changed">
                        Pular
                      </button></>}
                    </div>
                  )}
                </section>
              </>
            )}
          </div>
          <p className={styles["turn-points-container"]}>
            Pontos nessa rodada: {pointsInThisGame}
          </p>
        </div>
      </>
    );
  }
}
