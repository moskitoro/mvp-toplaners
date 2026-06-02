'use client'
import { useState } from 'react';
import { registrarJugador, actualizarJugador } from '@/lib/actions';

export default function FormularioJugador({ jugadorEditando, alTerminar }: any) {
  // Si recibimos un 'jugadorEditando', el formulario se llena con sus datos
  const [editMode, setEditMode] = useState(!!jugadorEditando);

  async function handleSubmit(formData: FormData) {
    if (jugadorEditando) {
      await actualizarJugador(jugadorEditando.id, formData);
      alTerminar(); // Función para limpiar el estado de edición en el padre
    } else {
      await registrarJugador(formData);
    }
    (document.getElementById('jugador-form') as HTMLFormElement).reset();
  }

  return (
    <form id="jugador-form" action={handleSubmit} className="grid gap-4">
      <h2 className="text-2xl font-semibold mb-2">
        {jugadorEditando ? 'Editando a ' + jugadorEditando.game_name : 'Registrar nuevo'}
      </h2>
      
      <input 
        name="nombre" 
        defaultValue={jugadorEditando?.game_name || ''} 
        placeholder="Nombre" 
        className="rounded-xl bg-zinc-950 border border-zinc-700 px-4 py-3"
      />
      
      <div className="grid grid-cols-2 gap-4">
        <input name="kda" defaultValue={jugadorEditando?.kda || ''} type="number" step="0.01" placeholder="KDA" className="rounded-xl bg-zinc-950 border border-zinc-700 px-4 py-3" />
        <input name="cs" defaultValue={jugadorEditando?.cs || ''} type="number" placeholder="CS" className="rounded-xl bg-zinc-950 border border-zinc-700 px-4 py-3" />
        <input name="oro" defaultValue={jugadorEditando?.oro || ''} type="number" placeholder="Oro" className="rounded-xl bg-zinc-950 border border-zinc-700 px-4 py-3" />
      </div>

      <button type="submit" className={`rounded-xl font-semibold px-4 py-3 transition ${jugadorEditando ? 'bg-yellow-600' : 'bg-blue-600'}`}>
        {jugadorEditando ? 'Guardar Cambios' : 'Registrar Jugador'}
      </button>
      
      {jugadorEditando && (
        <button type="button" onClick={alTerminar} className="text-zinc-500 text-sm underline">
          Cancelar edición
        </button>
      )}
    </form>
  );
}