'use client'

import { useEffect, useState } from 'react'
import { getClientSupabase } from '@/lib/supabase'
import Link from 'next/link'
import Image from 'next/image'
import spoiler from '../../../SPOILER_KKKKKKKKKKKKKKKK.7.png'

interface LicenseKey {
  id: string
  key_hash: string
  is_active: boolean
  created_at: string
  expires_at: string | null
  last_used_at: string | null
}

export default function LicenseKeysPage() {
  const [keys, setKeys] = useState<LicenseKey[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive' | 'expired'>('all')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    fetchKeys()
  }, [filter])

  const fetchKeys = async () => {
    setIsLoading(true)
    try {
      const supabase = getClientSupabase()
      if (!supabase) {
        throw new Error('Supabase client não configurado. Verifique NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.')
      }
      let query = supabase
        .from('license_keys')
        .select('*')
        .order('created_at', { ascending: false })

      if (filter === 'active') {
        query = query.eq('is_active', true)
      } else if (filter === 'inactive') {
        query = query.eq('is_active', false)
      }

      const { data, error } = await query

      if (error) throw error

      let filteredData = data
      if (filter === 'expired') {
        const now = new Date()
        filteredData = data.filter(key => key.expires_at && new Date(key.expires_at) <= now)
      }

      setKeys(filteredData)
      setErrorMessage('')
    } catch (error) {
      console.error('Error fetching keys:', error)
      setErrorMessage(error instanceof Error ? error.message : 'Falha ao carregar chaves')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleKeyStatus = async (keyId: string, currentStatus: boolean) => {
    try {
      const supabase = getClientSupabase()
      if (!supabase) {
        setErrorMessage('Supabase client não configurado. Verifique NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.')
        return
      }
      const { error } = await supabase
        .from('license_keys')
        .update({ is_active: !currentStatus })
        .eq('id', keyId)

      if (error) throw error

      fetchKeys()
    } catch (error) {
      console.error('Error updating key status:', error)
      setErrorMessage(error instanceof Error ? error.message : 'Falha ao atualizar status')
    }
  }

  const deleteKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to delete this license key? This action cannot be undone.')) {
      return
    }

    try {
      const supabase = getClientSupabase()
      if (!supabase) {
        setErrorMessage('Supabase client não configurado. Verifique NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.')
        return
      }
      const { error } = await supabase
        .from('license_keys')
        .delete()
        .eq('id', keyId)

      if (error) throw error

      fetchKeys()
    } catch (error) {
      console.error('Error deleting key:', error)
      setErrorMessage(error instanceof Error ? error.message : 'Falha ao deletar chave')
    }
  }

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false
    return new Date(expiresAt) <= new Date()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">License Keys</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage all license keys in your system
          </p>
        </div>
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <div className="relative h-20 w-28 overflow-hidden rounded-lg shadow-md ring-1 ring-white/40">
            <Image src={spoiler} alt="Spoiler" fill className="object-cover" />
          </div>
          <Link
            href="/admin/keys/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Generate New Key
          </Link>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-6 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      <div className="mb-6">
        <div className="sm:hidden">
          <label htmlFor="filter" className="sr-only">Filter</label>
          <select
            id="filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="all">All Keys</option>
            <option value="active">Active Keys</option>
            <option value="inactive">Inactive Keys</option>
            <option value="expired">Expired Keys</option>
          </select>
        </div>
        <div className="hidden sm:block">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { value: 'all', label: 'All Keys' },
                { value: 'active', label: 'Active Keys' },
                { value: 'inactive', label: 'Inactive Keys' },
                { value: 'expired', label: 'Expired Keys' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFilter(option.value as any)}
                  className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                    filter === option.value
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Keys Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {keys.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {keys.map((key) => (
              <li key={key.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          Key: <span className="font-mono">{key.key_hash.substring(0, 32)}...</span>
                        </p>
                        <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                          <span>Created: {new Date(key.created_at).toLocaleDateString()}</span>
                          {key.expires_at && (
                            <span>Expires: {new Date(key.expires_at).toLocaleDateString()}</span>
                          )}
                          {key.last_used_at && (
                            <span>Last used: {new Date(key.last_used_at).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        key.is_active && !isExpired(key.expires_at)
                          ? 'bg-green-100 text-green-800'
                          : isExpired(key.expires_at)
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {key.is_active && !isExpired(key.expires_at)
                          ? 'Active'
                          : isExpired(key.expires_at)
                          ? 'Expired'
                          : 'Inactive'
                        }
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleKeyStatus(key.id, key.is_active)}
                        className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium ${
                          key.is_active
                            ? 'text-yellow-700 bg-yellow-100 hover:bg-yellow-200'
                            : 'text-green-700 bg-green-100 hover:bg-green-200'
                        }`}
                      >
                        {key.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => deleteKey(key.id)}
                        className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium text-red-700 bg-red-100 hover:bg-red-200"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No license keys</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filter === 'all' ? 'Get started by creating your first license key.' : `No ${filter} keys found.`}
            </p>
            <div className="mt-6">
              <Link
                href="/admin/keys/new"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Generate New Key
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
