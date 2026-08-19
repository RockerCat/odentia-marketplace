@extends('layouts.admin')

@section('title', 'Pedidos — Admin Odentia')

@section('content')
    <h1 class="text-2xl font-bold text-slate-900 mb-6">Pedidos</h1>

    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table class="w-full text-sm">
            <thead class="bg-slate-50 text-slate-500 text-left">
                <tr>
                    <th class="px-5 py-3">#</th>
                    <th class="px-5 py-3">Cliente</th>
                    <th class="px-5 py-3">Total</th>
                    <th class="px-5 py-3">Estado</th>
                    <th class="px-5 py-3">Fecha</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
                @forelse ($orders as $order)
                    <tr class="hover:bg-slate-50">
                        <td class="px-5 py-3">
                            <a href="{{ route('admin.orders.show', $order) }}" class="text-teal-700 font-medium hover:underline">
                                #{{ $order->id }}
                            </a>
                        </td>
                        <td class="px-5 py-3">{{ $order->customer_name }}</td>
                        <td class="px-5 py-3">${{ number_format($order->total, 2) }}</td>
                        <td class="px-5 py-3">
                            <span class="inline-block px-2 py-1 rounded-full text-xs bg-slate-100">
                                {{ str_replace('_', ' ', $order->status) }}
                            </span>
                        </td>
                        <td class="px-5 py-3 text-slate-400">{{ $order->created_at->format('d/m/Y H:i') }}</td>
                    </tr>
                @empty
                    <tr>
                        <td class="px-5 py-6 text-slate-400" colspan="5">Todavía no hay pedidos.</td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>

    <div class="mt-4">
        {{ $orders->links() }}
    </div>
@endsection
