// For Firebase JS SDK v7.20.0 and later, measurementId is optional
import firebase from 'firebase'
import 'firebase/storage'



const firebaseConfig = {
    apiKey: "AIzaSyB_WUmsY7loSlbG6WHbVms1moAogZGwvIQ",
    authDomain: "slack-adv.firebaseapp.com",
    databaseURL: "https://slack-adv.firebaseio.com",
    projectId: "slack-adv",
    storageBucket: "slack-adv.appspot.com",
    messagingSenderId: "65963802588",
    appId: "1:65963802588:web:285ec6bec6d16046951919",
    measurementId: "G-H6PP4DPKWH"
};

const firebaseApp = firebase.initializeApp(firebaseConfig);
const db = firebaseApp.firestore();
const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();

export { auth, provider, firebaseApp};
export default db;
