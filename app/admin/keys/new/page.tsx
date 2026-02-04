'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getClientSupabase } from '@/lib/supabase'
import { generateLicenseKey, hashLicenseKey } from '@/lib/crypto'

export default function NewLicenseKeyPage() {
  const [generatedKey, setGeneratedKey] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showKey, setShowKey] = useState(false)
  const [saved, setSaved] = useState(false)
  const router = useRouter()
  // Using global supabase client

  const handleGenerateKey = () => {
    setIsGenerating(true)
    // Simulate generation time for better UX
    setTimeout(() => {
      const newKey = generateLicenseKey()
      setGeneratedKey(newKey)
      setShowKey(true)
      setIsGenerating(false)
    }, 500)
  }

  const handleSaveKey = async () => {
    if (!generatedKey) return

    setIsSaving(true)
    try {
      const supabase = getClientSupabase();
      if (!supabase) {
        alert('Error: Supabase client not initialized.');
        setIsSaving(false);
        return;
      }
      const keyHash = hashLicenseKey(generatedKey)

      const { error } = await supabase
        .from('license_keys')
        .insert({
          key_hash: keyHash,
          expires_at: expiresAt || null,
        })

      if (error) throw error

      setSaved(true)
      setTimeout(() => {
        router.push('/admin/keys')
      }, 2000)
    } catch (error) {
      console.error('Error saving key:', error)
      alert('Error saving license key. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDiscardKey = () => {
    setGeneratedKey('')
    setShowKey(false)
    setExpiresAt('')
    setSaved(false)
  }

  return (
    <div className="px-4 py-6 sm:px-0 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Generate New License Key</h1>
        <p className="mt-2 text-sm text-gray-600">
          Create a new license key for distribution
        </p>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          {!showKey ? (
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Generate License Key</h3>
              <p className="mt-1 text-sm text-gray-500">
                Click the button below to generate a new license key.
              </p>
              <div className="mt-6">
                <button
                  onClick={handleGenerateKey}
                  disabled={isGenerating}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating...
                    </>
                  ) : (
                    <>
                      <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                      </svg>
                      Generate Key
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : saved ? (
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">License Key Saved!</h3>
              <p className="mt-1 text-sm text-gray-500">
                The license key has been securely stored in the database.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => router.push('/admin/keys')}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  View All Keys
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">
                        Important Security Notice
                      </h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <p>
                          This license key will only be displayed once. Make sure to copy it now before saving.
                          The actual key will be hashed and stored securely in the database.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <label htmlFor="licenseKey" className="block text-sm font-medium text-gray-700">
                  Generated License Key
                </label>
                <div className="mt-1 relative">
                  <input
                    type="text"
                    id="licenseKey"
                    value={generatedKey}
                    readOnly
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 sm:text-sm font-mono"
                  />
                  <button
                    onClick={() => navigator.clipboard.writeText(generatedKey)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="mb-6">
                <label htmlFor="expiresAt" className="block text-sm font-medium text-gray-700">
                  Expiration Date (Optional)
                </label>
                <input
                  type="datetime-local"
                  id="expiresAt"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Leave empty for no expiration
                </p>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={handleSaveKey}
                  disabled={isSaving}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? 'Saving...' : 'Save License Key'}
                </button>
                <button
                  onClick={handleDiscardKey}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Discard & Generate New
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}