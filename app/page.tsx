import Image from 'next/image'
import Link from 'next/link'
import wallpaper from '../wallpaper_2.png'
import spoiler from '../SPOILER_KKKKKKKKKKKKKKKK.7.png'

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-24">
      <div className="absolute inset-0">
        <Image src={wallpaper} alt="" fill priority className="object-cover" />
        <div className="absolute inset-0 bg-slate-900/60" />
      </div>

      <div className="relative z-10 flex w-full max-w-5xl flex-col items-center gap-10">
        <div className="w-full items-center justify-between font-mono text-sm lg:flex">
          <h1 className="text-4xl font-bold text-center text-white lg:text-left">
            License Key Management System
          </h1>
        </div>

        <div className="relative flex flex-col items-center gap-8 text-center">
          <div>
            <h2 className="text-2xl font-semibold text-white mb-4">Welcome to the License Management System</h2>
            <p className="mb-8 text-white/80 max-w-md">
              Manage your license keys securely with our comprehensive admin panel.
            </p>
            <Link
              href="/admin"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300"
            >
              Access Admin Panel
            </Link>
          </div>

          <div className="relative h-56 w-56 overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/30">
            <Image src={spoiler} alt="Spoiler" fill className="object-cover" />
          </div>
        </div>
      </div>
    </main>
  )
}
