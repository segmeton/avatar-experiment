//https://codesource.io/understanding-firebase-realtime-database-using-react/
import firebase from "firebase";

const config = {
    apiKey: "AIzaSyDiC6tj1vXZLzhLCANcI6YdNfg1vedGMPI",
    authDomain: "justin-testing-1da07.firebaseapp.com",
    projectId: "justin-testing-1da07",
    storageBucket: "justin-testing-1da07.appspot.com",
    messagingSenderId: "154393708754",
    appId: "1:154393708754:web:19d94cda5411fb4314450b",
    measurementId: "G-YD55Z6FYCG",
    databaseURL: "https://justin-testing-1da07-default-rtdb.asia-southeast1.firebasedatabase.app/"
};

firebase.initializeApp(config);

export const db = firebase.database();
