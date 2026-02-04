import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <h1 className="text-4xl font-bold text-center lg:text-left">
          License Key Management System
        </h1>
      </div>

      <div className="relative flex place-items-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Welcome to the License Management System</h2>
          <p className="mb-8 text-gray-600 max-w-md">
            Manage your license keys securely with our comprehensive admin panel.
          </p>
          <Link
            href="/admin"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300"
          >
            Access Admin Panel
          </Link>
        </div>
      </div>
    </main>
  )
}