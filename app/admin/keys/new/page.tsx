import { getSupabaseAdmin } from '@/lib/supabase'
import { generateLicenseKey, sha256 } from '@/lib/crypto'

export default async function NewKeyPage() {
  const supabase = getSupabaseAdmin()

  if (!supabase) {
    return <p>Erro ao conectar ao Supabase</p>
  }

  async function createKey(formData: FormData) {
    'use server'

    const expiresAt = formData.get('expires_at') as string | null

    const licenseKey = generateLicenseKey()

    // 🔴 ERRO ESTAVA AQUI — FALTAVA await
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

    console.log('LICENSE GERADA:', licenseKey)
  }

  return (
    <form action={createKey}>
      <h1>Nova License</h1>

      <label>
        Expira em:
        <input type="date" name="expires_at" />
      </label>

      <button type="submit">Gerar License</button>
    </form>
  )
}
