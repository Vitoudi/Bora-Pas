import React, { useEffect, useState } from "react";
import { auth, firestore } from "../firebase/firebaseContext";

export default function checkAchivs(gameInfo) {
  let newAchivs = []
  let subjectsArray = []
  const {
    uid,
    subject,
    pointsInThisGame,
    numberOfCorrectAnswers,
    MAX_NUMBER_OF_QUESTIONS,
    userPoints,
    userAchivs,
    userSubjects
  } = gameInfo;

  console.log(numberOfCorrectAnswers)
    
  if (
    numberOfCorrectAnswers > MAX_NUMBER_OF_QUESTIONS
    && !userAchivs.includes('Rodada perfeita')
  ) {
    newAchivs = [...newAchivs, "Rodada perfeita"];
  }

  if (userPoints > 10 && !userAchivs.includes("Conquistou 10 pontos")) {
    newAchivs = [...newAchivs, "Conquistou 10 pontos"];
  }

  if (userPoints > 50 && !userAchivs.includes("Conquistou 50 pontos")) {
    newAchivs = [...newAchivs, "Conquistou 50 pontos"];
  }

  if (userPoints > 100 && !userAchivs.includes("Conquistou 100 pontos")) {
    newAchivs = [...newAchivs, "Conquistou 100 pontos"];
  }

  if (userPoints > 1000 && !userAchivs.includes("Conquistou 1000 pontos")) {
    newAchivs = [...newAchivs, "Conquistou 1000 pontos"];
  }

  const currentSubjectObj = userSubjects.filter(subjectObj => {
    return subjectObj.subject === subject
  })

  if(currentSubjectObj.length && currentSubjectObj[0].points >= 15) {
    let achivName;

    switch(subject) {
      case 'geral' : achivName = 'Mestre do geral'
      break
      case 'portugues': achivName = 'Gramático'
      break
      case 'literatura': achivName = 'Descendente de Machado'
      break
      case 'ingles': achivName = 'Bilíngue'
      break
      case 'artes': achivName = 'Pintor'
      break
      case 'historia': achivName = 'César'
      break
      case 'geografia': achivName = 'Geógrafo'
      break
      case 'filosofia': achivName = 'Grego'
      break
      case 'sociologia': achivName = 'Próximo Marx'
      break
      case 'quimica': achivName = 'Ligação covalente'
      break
      case 'fisica': achivName = 'Próximo Newton'
      break
      case 'biologia': achivName = 'Darwin. Jr'
      break
      case 'matematica': achivName = 'Calculadora humana'
      break
      default: achivName = 'Mestre de obras'
    }

    if(!userAchivs.includes(achivName)) {
      newAchivs = [...newAchivs, achivName];
    }
  }

  firestore.doc(`users/${uid}`).update({ achivs: [...userAchivs, ...newAchivs]});

  function updateSubjectReference() {
    if(userSubjects.filter(subjectObj => subjectObj.subject === subject ).length > 0) {
      console.log('subject alredy exists')
      let subjectToUpdate = userSubjects.filter(subjectObj => subjectObj.subject === subject)
      subjectToUpdate[0].points = subjectToUpdate[0].points + pointsInThisGame;

      const subjectsWithoutSubjectToUpdate = userSubjects.filter(subjectObj => subjectObj.subject !== subject)
      const referenceArray = [...userSubjects, subjectToUpdate];
      console.log(subjectToUpdate)
      subjectsArray = [...subjectsWithoutSubjectToUpdate, ...subjectToUpdate]
    } else {
      console.log("new subject");
      subjectsArray = [...userSubjects, { subject, points: pointsInThisGame }];
    }

    console.log(newAchivs)
    console.log(subjectsArray)

    firestore.doc(`users/${uid}`).update({subjects: subjectsArray})
  }
  
  updateSubjectReference()
  return newAchivs.length? newAchivs : null
}
