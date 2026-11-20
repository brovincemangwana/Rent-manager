export default function App() {
  return (
    <div className="min-h-screen bg-brand-50 p-8">
      <h1 className="text-3xl font-bold text-brand-700">Rent Manager</h1>
      <p className="mt-2 text-slate-600">Tailwind theme check</p>
      <div className="mt-6 flex gap-3">
        <button className="rounded-lg bg-brand-700 px-4 py-2 font-medium text-white hover:bg-brand-800">
          Primary
        </button>
        <button className="rounded-lg bg-accent-500 px-4 py-2 font-medium text-white hover:bg-accent-600">
          Pay rent
        </button>
      </div>
    </div>
  )
}