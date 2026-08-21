import Link from "next/link";
import LoginForm from "./login-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-sm bg-white rounded-xl border border-slate-200 p-8">
        <h1 className="text-xl font-bold text-teal-700 mb-1">Odentia</h1>
        <p className="text-sm text-slate-500 mb-6">Panel de administración</p>

        <LoginForm />

        <Link
          href="/"
          className="block text-center text-sm text-slate-400 hover:text-teal-700 mt-6"
        >
          &larr; Volver a la tienda
        </Link>
      </div>
    </div>
  );
}
