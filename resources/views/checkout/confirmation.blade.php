@extends('layouts.app')

@section('title', 'Pedido confirmado — Odentia')

@section('content')
    <div class="max-w-xl mx-auto text-center bg-white rounded-xl border border-slate-200 p-10">
        <p class="text-teal-700 font-semibold mb-2">¡Gracias, {{ $order->customer_name }}!</p>
        <h1 class="text-2xl font-bold text-slate-900 mb-4">Tu pedido #{{ $order->id }} fue recibido</h1>
        <p class="text-slate-500 mb-6">
            Nos pondremos en contacto a <strong>{{ $order->customer_email }}</strong> para coordinar el pago
            ({{ str_replace('_', ' ', $order->status) }}) y la entrega.
        </p>

        <ul class="text-left space-y-2 text-sm mb-6">
            @foreach ($order->items as $item)
                <li class="flex justify-between">
                    <span class="text-slate-600">{{ $item->product_name }} &times; {{ $item->quantity }}</span>
                    <span class="font-medium text-slate-900">${{ number_format($item->subtotal, 2) }}</span>
                </li>
            @endforeach
        </ul>

        <div class="border-t border-slate-100 pt-4 flex justify-between font-bold text-slate-900 mb-8">
            <span>Total</span>
            <span>${{ number_format($order->total, 2) }}</span>
        </div>

        <a href="{{ route('products.index') }}" class="text-teal-700 font-medium hover:underline">
            Volver al catálogo
        </a>
    </div>
@endsection
