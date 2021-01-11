import React from 'react'
import firebaseClient from './firebaseClient'
import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/storage'
import 'firebase/firestore'
import 'firebase/functions'

firebaseClient()
export const auth = firebase.auth()
export const firestore = firebase.firestore()
export const storage = firebase.storage()
export const functions = firebase.functions()


