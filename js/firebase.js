import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import {
    getDatabase,
    ref,
    get,
    set,
    update,
    remove
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyBD36po1KtzfE9KgyntGge2-FlTytayPlE",
    authDomain: "casa-das-baterias-fb489.firebaseapp.com",
    databaseURL: "https://casa-das-baterias-fb489-default-rtdb.firebaseio.com",
    projectId: "casa-das-baterias-fb489",
    storageBucket: "casa-das-baterias-fb489.firebasestorage.app",
    messagingSenderId: "160939952846",
    appId: "1:160939952846:web:ccdd9eab3ad6d616391e9f",
    measurementId: "G-TJDLY9WZDR"
};

const app = initializeApp(firebaseConfig);

const database = getDatabase(app);

export {
    database,
    ref,
    get,
    set,
    update,
    remove
};