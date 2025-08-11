import { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot
} from "firebase/firestore";

// 🔹 Configura con tus credenciales de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBquaPEHu0JBQIYbpBaIwo5KWyXGJBNZ10",
  authDomain: "iphone16pro-6213b.firebaseapp.com",
  projectId: "iphone16pro-6213b",
  storageBucket: "iphone16pro-6213b.firebasestorage.app",
  messagingSenderId: "659497411977",
  appId: "1:659497411977:web:e3d6b9c865372d2f8ced58",
  measurementId: "G-GEBTLSWX6Y"
};

// 🔹 Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default function App() {
  const [items, setItems] = useState([]);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "items"), (snapshot) => {
      setItems(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, []);

  const handleAddItem = async () => {
    if (inputValue.trim() === "") return;
    await addDoc(collection(db, "items"), { text: inputValue });
    setInputValue("");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold text-blue-600 mb-6">Mi App con Firebase + Tailwind</h1>

      <div className="bg-white shadow-lg rounded-lg p-4 w-full max-w-md">
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Escribe algo..."
            className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={handleAddItem}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Agregar
          </button>
        </div>

        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="bg-gray-50 p-3 rounded shadow-sm border border-gray-200"
            >
              {item.text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
