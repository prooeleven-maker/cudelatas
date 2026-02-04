import { getSupabaseAdmin } from '@/lib/supabase'
import { generateLicenseKey, sha256 } from '@/lib/crypto'

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
