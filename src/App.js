import React, { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  setDoc,
  doc,
  onSnapshot
} from "firebase/firestore";

// 🔹 CONFIGURACIÓN FIREBASE (reemplaza con tus credenciales)
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_DOMINIO.firebaseapp.com",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_BUCKET.appspot.com",
  messagingSenderId: "TU_MESSAGING_ID",
  appId: "TU_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default function App() {
  const [numeros, setNumeros] = useState([]);

  // Cargar números desde Firebase
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "rifa"), (snapshot) => {
      if (snapshot.empty) {
        // Si no existen datos, crear números iniciales
        const iniciales = Array.from({ length: 1000 }, (_, i) => ({
          numero: i.toString().padStart(3, "0"),
          vendido: false,
          comprador: ""
        }));
        iniciales.forEach(async (n) => {
          await setDoc(doc(db, "rifa", n.numero), n);
        });
      } else {
        const data = snapshot.docs.map((d) => d.data());
        setNumeros(data.sort((a, b) => a.numero.localeCompare(b.numero)));
      }
    });
    return () => unsub();
  }, []);

  // Marcar número como vendido
  const venderNumero = async (n) => {
    const nombre = prompt(`¿Quién compró el número ${n.numero}?`);
    if (!nombre) return;
    await setDoc(doc(db, "rifa", n.numero), {
      ...n,
      vendido: true,
      comprador: nombre
    });
  };

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      <h1>📱 Rifa iPhone 16 Pro</h1>
      <p>Total números: {numeros.length}</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: 5 }}>
        {numeros.map((n) => (
          <button
            key={n.numero}
            style={{
              padding: "10px",
              background: n.vendido ? "tomato" : "lightgreen",
              border: "none",
              borderRadius: 5,
              cursor: n.vendido ? "not-allowed" : "pointer"
            }}
            onClick={() => !n.vendido && venderNumero(n)}
          >
            {n.numero}
          </button>
        ))}
      </div>
    </div>
  );
}
