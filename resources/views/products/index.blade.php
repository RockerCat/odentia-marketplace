@extends('layouts.app')

@section('title', 'Odentia — Implementos odontológicos')

@section('content')
    <div class="mb-8">
        <h1 class="text-3xl font-bold text-slate-900">Implementos odontológicos</h1>
        <p class="text-slate-500 mt-1">Todo lo que tu consultorio necesita, en un solo lugar.</p>
    </div>

    <div class="flex gap-8">
        <aside class="w-48 shrink-0">
            <h2 class="text-sm font-semibold text-slate-500 uppercase mb-3">Categorías</h2>
            <ul class="space-y-1 text-sm">
                <li>
                    <a href="{{ route('products.index') }}"
                       class="block px-3 py-2 rounded-md {{ !$activeCategory ? 'bg-teal-700 text-white' : 'hover:bg-slate-100' }}">
                        Todas
                    </a>
                </li>
                @foreach ($categories as $category)
                    <li>
                        <a href="{{ route('products.index', ['category' => $category->slug]) }}"
                           class="block px-3 py-2 rounded-md {{ $activeCategory === $category->slug ? 'bg-teal-700 text-white' : 'hover:bg-slate-100' }}">
                            {{ $category->name }}
                        </a>
                    </li>
                @endforeach
            </ul>
        </aside>

        <div class="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            @forelse ($products as $product)
                <a href="{{ route('products.show', $product) }}"
                   class="block bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition">
                    <div class="aspect-square bg-slate-100 flex items-center justify-center">
                        @if ($product->main_image_url)
                            <img src="{{ $product->main_image_url }}" alt="{{ $product->name }}"
                                 class="w-full h-full object-cover">
                        @else
                            <span class="text-slate-300 text-sm">Sin imagen</span>
                        @endif
                    </div>
                    <div class="p-5">
                        <p class="text-xs uppercase tracking-wide text-teal-700 font-semibold mb-1">
                            {{ $product->category->name }}
                        </p>
                        <h3 class="font-semibold text-slate-900 mb-2">{{ $product->name }}</h3>
                        <p class="text-lg font-bold text-slate-900">${{ number_format($product->price, 2) }}</p>
                        <p class="text-xs text-slate-400 mt-1">{{ $product->stock }} disponibles</p>
                    </div>
                </a>
            @empty
                <p class="text-slate-500 col-span-full">No hay productos en esta categoría.</p>
            @endforelse
        </div>
    </div>
@endsection
