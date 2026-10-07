import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="mx-auto max-w-xl px-5 py-24 text-center">
      <p className="text-xs font-semibold uppercase tracking-widest text-[#69836f]">Pagina non trovata</p>
      <h1 className="mt-3 text-3xl font-semibold">Questa pagina non è disponibile</h1>
      <p className="mt-3 text-sm text-[#758078]">Il link potrebbe non essere più valido.</p>
      <Link href="/cards" className="mt-6 inline-flex rounded-full bg-[#1d2731] px-6 py-3 text-sm font-medium text-white">Vai al catalogo</Link>
    </main>
  );
}
