<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Ingresar — Odentia</title>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body class="bg-slate-50 text-slate-800 antialiased flex items-center justify-center min-h-screen">
    <div class="w-full max-w-sm bg-white rounded-xl border border-slate-200 p-8">
        <h1 class="text-xl font-bold text-teal-700 mb-1">Odentia</h1>
        <p class="text-sm text-slate-500 mb-6">Panel de administración</p>

        @if ($errors->any())
            <div class="mb-4 rounded-md bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
                {{ $errors->first() }}
            </div>
        @endif

        <form method="POST" action="{{ route('login') }}" class="space-y-4">
            @csrf

            <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Correo electrónico</label>
                <input type="email" name="email" value="{{ old('email') }}" autofocus
                       class="w-full rounded-md border-slate-300">
            </div>

            <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
                <input type="password" name="password" class="w-full rounded-md border-slate-300">
            </div>

            <button type="submit" class="w-full bg-teal-700 text-white px-4 py-2.5 rounded-md font-medium hover:bg-teal-800">
                Ingresar
            </button>
        </form>

        <a href="{{ route('products.index') }}" class="block text-center text-sm text-slate-400 hover:text-teal-700 mt-6">
            &larr; Volver a la tienda
        </a>
    </div>
</body>
</html>
