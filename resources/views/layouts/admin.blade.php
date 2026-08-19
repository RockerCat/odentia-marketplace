<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>@yield('title', 'Admin — Odentia')</title>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body class="bg-slate-50 text-slate-800 antialiased">
    <div class="flex min-h-screen">
        <aside class="w-56 shrink-0 bg-slate-900 text-slate-300 flex flex-col">
            <div class="p-5 text-lg font-bold text-white">Odentia Admin</div>
            <nav class="flex-1 px-3 space-y-1 text-sm">
                <a href="{{ route('admin.dashboard') }}"
                   class="block px-3 py-2 rounded-md {{ request()->routeIs('admin.dashboard') || request()->routeIs('admin.orders.*') ? 'bg-slate-800 text-white' : 'hover:bg-slate-800' }}">
                    Pedidos
                </a>
                <a href="{{ route('admin.products.index') }}"
                   class="block px-3 py-2 rounded-md {{ request()->routeIs('admin.products.*') ? 'bg-slate-800 text-white' : 'hover:bg-slate-800' }}">
                    Productos
                </a>
                <a href="{{ route('admin.categories.index') }}"
                   class="block px-3 py-2 rounded-md {{ request()->routeIs('admin.categories.*') ? 'bg-slate-800 text-white' : 'hover:bg-slate-800' }}">
                    Categorías
                </a>
            </nav>
            <div class="p-3 border-t border-slate-800">
                <a href="{{ route('products.index') }}" class="block px-3 py-2 text-sm hover:text-white">Ver tienda</a>
                <form method="POST" action="{{ route('logout') }}">
                    @csrf
                    <button type="submit" class="w-full text-left px-3 py-2 text-sm hover:text-white">
                        Cerrar sesión
                    </button>
                </form>
            </div>
        </aside>

        <main class="flex-1 p-8">
            @if (session('success'))
                <div class="mb-6 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 px-4 py-3 text-sm">
                    {{ session('success') }}
                </div>
            @endif
            @if (session('error'))
                <div class="mb-6 rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
                    {{ session('error') }}
                </div>
            @endif

            @yield('content')
        </main>
    </div>
</body>
</html>
