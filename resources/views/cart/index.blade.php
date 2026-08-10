@extends('layouts.app')

@section('title', 'Carrito — Odentia')

@section('content')
    <h1 class="text-3xl font-bold text-slate-900 mb-8">Tu carrito</h1>

    @if ($items->isEmpty())
        <p class="text-slate-500">Tu carrito está vacío. <a href="{{ route('products.index') }}" class="text-teal-700 hover:underline">Ver catálogo</a>.</p>
    @else
        <div class="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
            @foreach ($items as $item)
                <div class="flex items-center justify-between p-5 gap-4">
                    <div class="flex-1">
                        <a href="{{ route('products.show', $item['product']) }}" class="font-semibold text-slate-900 hover:text-teal-700">
                            {{ $item['product']->name }}
                        </a>
                        <p class="text-sm text-slate-400">${{ number_format($item['product']->price, 2) }} c/u</p>
                    </div>

                    <form method="POST" action="{{ route('cart.update', $item['product']) }}" class="flex items-center gap-2">
                        @csrf
                        @method('PATCH')
                        <input type="number" name="quantity" value="{{ $item['quantity'] }}" min="0"
                               max="{{ $item['product']->stock }}"
                               class="w-16 rounded-md border-slate-300 text-center text-sm">
                        <button type="submit" class="text-sm text-teal-700 hover:underline">Actualizar</button>
                    </form>

                    <p class="w-24 text-right font-semibold text-slate-900">${{ number_format($item['subtotal'], 2) }}</p>

                    <form method="POST" action="{{ route('cart.remove', $item['product']) }}">
                        @csrf
                        @method('DELETE')
                        <button type="submit" class="text-sm text-red-500 hover:underline">Quitar</button>
                    </form>
                </div>
            @endforeach
        </div>

        <div class="mt-6 flex items-center justify-between">
            <p class="text-xl font-bold text-slate-900">Total: ${{ number_format($total, 2) }}</p>
            <a href="{{ route('checkout.index') }}"
               class="bg-teal-700 text-white px-6 py-3 rounded-md font-medium hover:bg-teal-800">
                Continuar al checkout
            </a>
        </div>
    @endif
@endsection
