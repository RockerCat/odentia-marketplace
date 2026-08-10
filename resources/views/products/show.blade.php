@extends('layouts.app')

@section('title', $product->name . ' — Odentia')

@section('content')
    <a href="{{ route('products.index') }}" class="text-sm text-teal-700 hover:underline">&larr; Volver al catálogo</a>

    <div class="mt-6 bg-white rounded-xl border border-slate-200 p-8 max-w-2xl">
        <p class="text-xs uppercase tracking-wide text-teal-700 font-semibold mb-2">
            {{ $product->category->name }}
        </p>
        <h1 class="text-2xl font-bold text-slate-900 mb-4">{{ $product->name }}</h1>
        <p class="text-slate-600 mb-6">{{ $product->description }}</p>

        <div class="flex items-end justify-between border-t border-slate-100 pt-6">
            <div>
                <p class="text-3xl font-bold text-slate-900">${{ number_format($product->price, 2) }}</p>
                <p class="text-sm text-slate-400 mt-1">{{ $product->stock }} disponibles</p>
            </div>

            @if ($product->stock > 0)
                <form method="POST" action="{{ route('cart.add', $product) }}" class="flex items-center gap-3">
                    @csrf
                    <input type="number" name="quantity" value="1" min="1" max="{{ $product->stock }}"
                           class="w-20 rounded-md border-slate-300 text-center">
                    <button type="submit"
                            class="bg-teal-700 text-white px-5 py-2.5 rounded-md font-medium hover:bg-teal-800">
                        Agregar al carrito
                    </button>
                </form>
            @else
                <span class="text-red-600 font-medium">Sin stock</span>
            @endif
        </div>
    </div>
@endsection
