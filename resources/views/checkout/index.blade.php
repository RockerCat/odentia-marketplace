@extends('layouts.app')

@section('title', 'Checkout — Odentia')

@section('content')
    <h1 class="text-3xl font-bold text-slate-900 mb-8">Finalizar pedido</h1>

    <div class="flex flex-col lg:flex-row gap-8">
        <form method="POST" action="{{ route('checkout.store') }}" class="flex-1 bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            @csrf

            <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Nombre completo</label>
                <input type="text" name="customer_name" value="{{ old('customer_name') }}"
                       class="w-full rounded-md border-slate-300">
                @error('customer_name') <p class="text-sm text-red-600 mt-1">{{ $message }}</p> @enderror
            </div>

            <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Correo electrónico</label>
                <input type="email" name="customer_email" value="{{ old('customer_email') }}"
                       class="w-full rounded-md border-slate-300">
                @error('customer_email') <p class="text-sm text-red-600 mt-1">{{ $message }}</p> @enderror
            </div>

            <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
                <input type="text" name="customer_phone" value="{{ old('customer_phone') }}"
                       class="w-full rounded-md border-slate-300">
                @error('customer_phone') <p class="text-sm text-red-600 mt-1">{{ $message }}</p> @enderror
            </div>

            <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Dirección de entrega</label>
                <textarea name="address" rows="3" class="w-full rounded-md border-slate-300">{{ old('address') }}</textarea>
                @error('address') <p class="text-sm text-red-600 mt-1">{{ $message }}</p> @enderror
            </div>

            <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Notas (opcional)</label>
                <textarea name="notes" rows="2" class="w-full rounded-md border-slate-300">{{ old('notes') }}</textarea>
            </div>

            <p class="text-sm text-slate-400">
                El pago se coordina directamente con Odentia luego de confirmar el pedido (transferencia o contra-entrega).
            </p>

            <button type="submit" class="w-full bg-teal-700 text-white px-6 py-3 rounded-md font-medium hover:bg-teal-800">
                Confirmar pedido
            </button>
        </form>

        <aside class="lg:w-80 shrink-0 bg-white rounded-xl border border-slate-200 p-6 h-fit">
            <h2 class="font-semibold text-slate-900 mb-4">Resumen</h2>
            <ul class="space-y-3 text-sm mb-4">
                @foreach ($items as $item)
                    <li class="flex justify-between">
                        <span class="text-slate-600">{{ $item['product']->name }} &times; {{ $item['quantity'] }}</span>
                        <span class="font-medium text-slate-900">${{ number_format($item['subtotal'], 2) }}</span>
                    </li>
                @endforeach
            </ul>
            <div class="border-t border-slate-100 pt-4 flex justify-between font-bold text-slate-900">
                <span>Total</span>
                <span>${{ number_format($total, 2) }}</span>
            </div>
        </aside>
    </div>
@endsection
