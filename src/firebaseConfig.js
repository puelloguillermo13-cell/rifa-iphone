// Importa lo que necesites de Firebase
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Configuración de tu proyecto Firebase
const firebaseConfig = {
apiKey: "AIzaSyBquaPEHu0JBQIYbpBaIwo5KWyXGJBNZ10",
  authDomain: "iphone16pro-6213b.firebaseapp.com",
  projectId: "iphone16pro-6213b",
  storageBucket: "iphone16pro-6213b.firebasestorage.app",
  messagingSenderId: "659497411977",
  appId: "1:659497411977:web:e3d6b9c865372d2f8ced58",
  measurementId: "G-GEBTLSWX6Y"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Exporta la base de datos
export const db = getFirestore(app);