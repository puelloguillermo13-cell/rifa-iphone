import React, { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  onSnapshot,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";

// --- REEMPLAZA ESTO CON TU CONFIGURACIÓN FIREBASE ---
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_AUTH_DOMAIN",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_STORAGE_BUCKET",
  messagingSenderId: "TU_MESSAGING_SENDER_ID",
  appId: "TU_APP_ID",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const ADMIN_PASSWORD = "guille123"; // Cambia para producción

export default function App() {
  const [numeros, setNumeros] = useState([]);
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminAuth, setAdminAuth] = useState("");
  const [filter, setFilter] = useState("");

  // Cargar números desde Firebase y crear si no existen
  useEffect(() => {
    const initData = async () => {
      const snapshot = await getDocs(collection(db, "rifa"));
      if (snapshot.empty) {
        // Crear 1000 números
        const iniciales = Array.from({ length: 1000 }, (_, i) => ({
          numero: i.toString().padStart(3, "0"),
          vendido: false,
          comprador: "",
          contacto: "",
          pagado: false,
          timestamp: "",
        }));
        for (const n of iniciales) {
          await setDoc(doc(db, "rifa", n.numero), n);
        }
      }
    };
    initData();

    // Escuchar cambios en tiempo real
    const unsub = onSnapshot(collection(db, "rifa"), (snapshot) => {
      const data = snapshot.docs.map((d) => d.data());
      setNumeros(data.sort((a, b) => a.numero.localeCompare(b.numero)));
    });

    return () => unsub();
  }, []);

  // Función para marcar vendido (con datos)
  const venderNumero = async (n) => {
    if (n.vendido) return;
    const comprador = prompt(`¿Quién compró el número ${n.numero}?`);
    if (!comprador) return alert("Debe ingresar el nombre del comprador");
    const contacto = prompt("Ingrese contacto (WhatsApp o email):") || "";
    const pagado = window.confirm("¿Está pagado? (Aceptar = Sí, Cancelar = No)");
    const timestamp = new Date().toISOString();

    await setDoc(doc(db, "rifa", n.numero), {
      ...n,
      vendido: true,
      comprador,
      contacto,
      pagado,
      timestamp,
    });
  };

  // Marcar pago para número (solo admin)
  const marcarPagado = async (n) => {
    await updateDoc(doc(db, "rifa", n.numero), {
      pagado: true,
    });
  };

  // Exportar CSV
  const exportCSV = () => {
    const header = ["Número", "Comprador", "Contacto", "Pagado", "Timestamp"];
    const rows = numeros
      .filter((n) => n.vendido)
      .map((n) => [
        n.numero,
        n.comprador,
        n.contacto,
        n.pagado ? "Sí" : "No",
        n.timestamp,
      ]);
    const csvContent =
      [header, ...rows]
        .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
        .join("\n") + "\n";

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "rifa_ventas.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Resetear datos (admin)
  const resetearDatos = async () => {
    if (!window.confirm("¿Seguro que quieres resetear todos los datos?")) return;
    for (const n of numeros) {
      await setDoc(doc(db, "rifa", n.numero), {
        numero: n.numero,
        vendido: false,
        comprador: "",
        contacto: "",
        pagado: false,
        timestamp: "",
      });
    }
  };

  const totalVendidos = numeros.filter((n) => n.vendido).length;
  const totalDisponibles = numeros.length - totalVendidos;

  // Filtrar números y compradores por texto
  const filtrados = numeros.filter(
    (n) =>
      !filter ||
      n.numero.includes(filter) ||
      n.comprador.toLowerCase().includes(filter.toLowerCase())
  );

  // Autenticación admin sencilla
  const abrirAdmin = () => {
    const pass = prompt("Contraseña de administrador");
    if (pass === ADMIN_PASSWORD) {
      setAdminOpen(true);
    } else {
      alert("Contraseña incorrecta");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow p-6">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">📱 Rifa iPhone 16 Pro</h1>
          <div className="text-right">
            <div>Disponibles: <strong>{totalDisponibles}</strong></div>
            <div>Vendidos: <strong>{totalVendidos}</strong></div>
          </div>
        </header>

        <section className="mb-6">
          <input
            type="text"
            placeholder="Buscar número o comprador"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </section>

        <section className="grid grid-cols-10 gap-2 text-xs font-mono mb-6">
          {filtrados.map((n) => (
            <button
              key={n.numero}
              className={`p-2 rounded ${
                n.vendido
                  ? "bg-red-500 text-white cursor-not-allowed"
                  : "bg-green-300 hover:bg-green-400"
              }`}
              disabled={n.vendido}
              onClick={() => venderNumero(n)}
              title={
                n.vendido
                  ? `${n.numero} - Vendido por ${n.comprador}`
                  : n.numero
              }
            >
              {n.numero}
            </button>
          ))}
        </section>

        <button
          onClick={abrirAdmin}
          className="mb-6 px-4 py-2 bg-gray-800 text-white rounded"
        >
          Abrir Panel Admin
        </button>

        {/* Panel Admin */}
        {adminOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl w-full max-w-4xl shadow p-6 relative">
              <button
                onClick={() => setAdminOpen(false)}
                className="absolute top-3 right-3 px-3 py-1 bg-gray-200 rounded"
              >
                Cerrar
              </button>

              <h2 className="text-2xl font-bold mb-4">Panel Admin</h2>

              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-left text-sm border-collapse border border-gray-300">
                  <thead>
                    <tr>
                      <th className="border border-gray-300 p-2">Número</th>
                      <th className="border border-gray-300 p-2">Comprador</th>
                      <th className="border border-gray-300 p-2">Contacto</th>
                      <th className="border border-gray-300 p-2">Pagado</th>
                      <th className="border border-gray-300 p-2">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {numeros.filter(n => n.vendido).length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-4 text-center text-gray-500">
                          Sin ventas aún
                        </td>
                      </tr>
                    )}
                    {numeros
                      .filter((n) => n.vendido)
                      .sort((a, b) => a.numero.localeCompare(b.numero))
                      .map((n) => (
                        <tr key={n.numero}>
                          <td className="border border-gray-300 p-2 font-mono">{n.numero}</td>
                          <td className="border border-gray-300 p-2">{n.comprador}</td>
                          <td className="border border-gray-300 p-2">{n.contacto}</td>
                          <td className="border border-gray-300 p-2 text-center">
                            {n.pagado ? "✅" : "—"}
                          </td>
                          <td className="border border-gray-300 p-2">
                            {!n.pagado && (
                              <button
                                onClick={() => marcarPagado(n)}
                                className="px-2 py-1 bg-green-600 text-white rounded"
                              >
                                Marcar pagado
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={exportCSV}
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  Exportar CSV
                </button>
                <button
                  onClick={resetearDatos}
                  className="px-4 py-2 bg-red-600 text-white rounded"
                >
                  Resetear datos
                </button>
              </div>
            </div>
          </div>
        )}

        <footer className="mt-6 text-center text-xs text-gray-500">
          Prototipo creado por Guille. Cambia contraseña admin y configura pagos antes de producción.
        </footer>
      </div>
    </div>
  );
}
