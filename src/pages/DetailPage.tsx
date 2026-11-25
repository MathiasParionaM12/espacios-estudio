import { useEffect, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import api, { apiError } from '../api'
import Field from '../components/Field'
import type { Detail } from '../types'

export default function DetailPage() {
  const { id } = useParams()
  const [item, setItem] = useState<Detail | null>(null)
  // ZONA A: un estado por campo del formulario
  const [slotId, setSlotId] = useState('')
  const [attendees, setAttendees] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [message, setMessage] = useState('')

  async function load() {
    try {
      const { data } = await api.get(`/spaces/${id}`)
      setItem(data)
    } catch (err) {
      setMessage(apiError(err).message)
    }
  }

  useEffect(() => {
    load()
  }, [id])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setMessage('')
    const newErrors: Record<string, string> = {}
    // ZONA B: validaciones del enunciado
    const n = Number(attendees)
    if (!slotId) newErrors.slotId = 'Elige un turno'
    if (!Number.isInteger(n) || n < 1 || n > item!.capacity) newErrors.attendees = `Entre 1 y ${item!.capacity}`
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    try {
      // ZONA C: envío y qué hacer después del éxito
      await api.post(`/spaces/${id}/reservations`, { slotId: Number(slotId), attendees: n })
      setMessage('Reserva creada')
      load()
    } catch (err) {
      // ZONA D: conflicto con el mensaje EXACTO del enunciado
      const { code, message } = apiError(err)
      setMessage(code === 'SLOT_TAKEN' ? 'El turno ya no está disponible.' : message)
    }
  }

  if (!item) return <p className="text-slate-500">{message || 'Cargando...'}</p>

  // ZONA E: lo que se ve
  return (
    <div className="flex flex-col gap-6">
      <Link to="/spaces" className="text-sm font-medium text-emerald-700 hover:underline">← Volver al listado</Link>
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">{item.name}</h1>
      <p className="text-slate-600">Sede: {item.campus} · Aforo: {item.capacity} · Turnos libres: {item.availableSlots}</p>
      <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white text-sm">
        {item.slots.map((s) => (
          <li className="px-4 py-2" key={s.id}>Turno {s.id} · {s.startsAt} · {s.available ? 'Disponible' : 'Ocupado'}</li>
        ))}
      </ul>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6">
        <Field label="Turno" error={errors.slotId}>
          <select value={slotId} onChange={(e) => setSlotId(e.target.value)}>
            <option value="">Elige un turno</option>
            {item.slots.filter((s) => s.available).map((s) => (
              <option key={s.id} value={s.id}>{s.startsAt}</option>
            ))}
          </select>
        </Field>
        <Field label="Asistentes" error={errors.attendees}>
          <input type="number" value={attendees} onChange={(e) => setAttendees(e.target.value)} />
        </Field>
        {message && <p className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700">{message}</p>}
        <button>Reservar</button>
      </form>
    </div>
  )
}