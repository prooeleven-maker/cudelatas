import Image from 'next/image'
import { getSupabaseAdmin } from '@/lib/supabase'
import { generateLicenseKey, sha256 } from '@/lib/crypto'
import spoiler from '../../../../SPOILER_KKKKKKKKKKKKKKKK.7.png'

/* ===============================
   SERVER ACTION (SEM EXPORT)
   =============================== */
async function createKey(formData: FormData) {
  'use server'

  const supabaseAdmin = getSupabaseAdmin()
  if (!supabaseAdmin) {
    throw new Error('Erro ao conectar ao Supabase')
  }

  const expiresAt = formData.get('expires_at') as string | null

  const licenseKey = generateLicenseKey()
  const keyHash = await sha256(licenseKey)

  const { error } = await supabaseAdmin
    .from('license_keys')
    .insert({
      key_hash: keyHash,
      expires_at: expiresAt || null,
      is_active: true,
      is_registered: false,
    })

  if (error) {
    throw new Error(error.message)
  }

  // aparece no log do Cloudflare
  console.log('LICENSE GERADA:', licenseKey)
}

/* ===============================
   PAGE
   =============================== */
export default function NewKeyPage() {
  return (
    <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] items-start">
      <form action={createKey} className="rounded-xl border border-slate-200 bg-white/90 p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Nova License</h1>
        <p className="mt-1 text-sm text-slate-600">
          Gere uma nova chave e defina a data de expiração.
        </p>

        <label className="mt-6 block text-sm font-medium text-slate-700">
          Expira em
          <input
            type="date"
            name="expires_at"
            className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </label>

        <button
          type="submit"
          className="mt-6 inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Gerar License
        </button>
      </form>

      <div className="relative h-72 overflow-hidden rounded-xl ring-1 ring-white/40 shadow-2xl">
        <Image src={spoiler} alt="Spoiler" fill className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/20 to-transparent" />
        <div className="absolute bottom-4 left-4 text-white">
          <div className="text-lg font-semibold">Painel Administrativo</div>
          <div className="text-xs text-white/80">Crie e gerencie suas licenças</div>
        </div>
      </div>
    </div>
  )
}
