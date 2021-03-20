import firebase from 'firebase'

//Initialize firebase
var firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: 'deeviral-c24fe.firebaseapp.com',
  databaseURL: 'https://deeviral-c24fe.firebaseio.com',
  projectId: 'deeviral-c24fe',
  storageBucket: 'deeviral-c24fe.appspot.com',
  messagingSenderId: '302883626344',
  appId: '1:302883626344:web:7f0b91b469a8dca6430add',
}
// Initialize Firebase
firebase.initializeApp(firebaseConfig)

const db = firebase.firestore()

export { db }
