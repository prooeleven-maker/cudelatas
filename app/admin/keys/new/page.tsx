'use client'

import Image from 'next/image'
import { useState } from 'react'
import { getClientSupabase } from '@/lib/supabase'
import { generateLicenseKey, sha256 } from '@/lib/crypto'
import spoiler from '../../../../SPOILER_KKKKKKKKKKKKKKKK.7.png'

export default function NewKeyPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [generatedKey, setGeneratedKey] = useState('')

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage('')
    setGeneratedKey('')
    setIsSubmitting(true)

    try {
      const formData = new FormData(event.currentTarget)
      const expiresAt = formData.get('expires_at') as string | null
      const supabase = getClientSupabase()

      if (!supabase) {
        throw new Error('Erro ao conectar ao Supabase')
      }

      const licenseKey = generateLicenseKey()
      const keyHash = await sha256(licenseKey)

      const { error } = await supabase
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

      setGeneratedKey(licenseKey)
      event.currentTarget.reset()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Falha ao gerar license')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] items-start">
      <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white/90 p-6 shadow-sm">
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
          disabled={isSubmitting}
          className="mt-6 inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Gerando...' : 'Gerar License'}
        </button>

        {errorMessage && (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        {generatedKey && (
          <div className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            <div className="font-semibold">License gerada</div>
            <div className="mt-1 break-all font-mono">{generatedKey}</div>
          </div>
        )}
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
