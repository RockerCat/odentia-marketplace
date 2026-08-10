<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>@yield('title', 'Odentia')</title>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body class="bg-slate-50 text-slate-800 antialiased">
    <header class="bg-white border-b border-slate-200">
        <div class="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <a href="{{ route('products.index') }}" class="text-2xl font-bold text-teal-700">Odentia</a>
            <nav class="flex items-center gap-6 text-sm font-medium">
                <a href="{{ route('products.index') }}" class="hover:text-teal-700">Catálogo</a>
                <a href="{{ route('cart.index') }}" class="hover:text-teal-700">
                    Carrito
                    @if(($cartCount ?? 0) > 0)
                        <span class="ml-1 inline-flex items-center justify-center rounded-full bg-teal-700 text-white text-xs w-5 h-5">{{ $cartCount }}</span>
                    @endif
                </a>
            </nav>
        </div>
    </header>

    <main class="max-w-6xl mx-auto px-4 py-8">
        @if (session('success'))
            <div class="mb-6 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 px-4 py-3 text-sm">
                {{ session('success') }}
            </div>
        @endif

        @yield('content')
    </main>

    <footer class="max-w-6xl mx-auto px-4 py-8 text-sm text-slate-400">
        &copy; {{ date('Y') }} Odentia — Implementos odontológicos.
    </footer>
</body>
</html>
