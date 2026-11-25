import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api, { apiError } from '../api'
import Pagination from '../components/Pagination'
import type { Item } from '../types'

export default function ListPage() {
  const [items, setItems] = useState<Item[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError('')
      try {
        const { data } = await api.get('/spaces', { params: { page, size: 5 } })
        setItems(data.items)
        setTotalPages(data.totalPages)
      } catch (err) {
        setError(apiError(err).message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [page])

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Espacios de estudio</h1>
      {loading && <p className="text-slate-500">Cargando...</p>}
      {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
      {!loading && items.length === 0 && (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">No hay registros.</p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        {!loading && items.map((item) => (
          <Link key={item.id} to={`/spaces/${item.id}`} className="block rounded-xl border border-slate-200 bg-white p-5 transition hover:border-emerald-400 hover:shadow-md">
            <p className="text-lg font-semibold text-slate-900">{item.name}</p>
            <p className="mt-1 text-sm text-slate-600">Sede: {item.campus} · Aforo: {item.capacity} · Turnos libres: {item.availableSlots}</p>
          </Link>
        ))}
      </div>
      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  )
}