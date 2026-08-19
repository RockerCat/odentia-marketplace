@extends('layouts.admin')

@section('title', 'Pedido #' . $order->id . ' — Admin Odentia')

@section('content')
    <a href="{{ route('admin.dashboard') }}" class="text-sm text-teal-700 hover:underline">&larr; Volver a pedidos</a>

    <div class="mt-4 flex flex-col lg:flex-row gap-6">
        <div class="flex-1 bg-white rounded-xl border border-slate-200 p-6">
            <h1 class="text-xl font-bold text-slate-900 mb-4">Pedido #{{ $order->id }}</h1>

            <dl class="grid grid-cols-2 gap-4 text-sm mb-6">
                <div>
                    <dt class="text-slate-400">Cliente</dt>
                    <dd class="font-medium">{{ $order->customer_name }}</dd>
                </div>
                <div>
                    <dt class="text-slate-400">Correo</dt>
                    <dd class="font-medium">{{ $order->customer_email }}</dd>
                </div>
                <div>
                    <dt class="text-slate-400">Teléfono</dt>
                    <dd class="font-medium">{{ $order->customer_phone }}</dd>
                </div>
                <div>
                    <dt class="text-slate-400">Fecha</dt>
                    <dd class="font-medium">{{ $order->created_at->format('d/m/Y H:i') }}</dd>
                </div>
                <div class="col-span-2">
                    <dt class="text-slate-400">Dirección</dt>
                    <dd class="font-medium">{{ $order->address }}</dd>
                </div>
                @if ($order->notes)
                    <div class="col-span-2">
                        <dt class="text-slate-400">Notas</dt>
                        <dd class="font-medium">{{ $order->notes }}</dd>
                    </div>
                @endif
            </dl>

            <table class="w-full text-sm mb-4">
                <thead class="text-left text-slate-400">
                    <tr>
                        <th class="py-2">Producto</th>
                        <th class="py-2">Cant.</th>
                        <th class="py-2 text-right">Subtotal</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                    @foreach ($order->items as $item)
                        <tr>
                            <td class="py-2">{{ $item->product_name }}</td>
                            <td class="py-2">{{ $item->quantity }}</td>
                            <td class="py-2 text-right">${{ number_format($item->subtotal, 2) }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>

            <div class="flex justify-between font-bold text-slate-900 border-t border-slate-100 pt-4">
                <span>Total</span>
                <span>${{ number_format($order->total, 2) }}</span>
            </div>
        </div>

        <div class="lg:w-72 shrink-0 bg-white rounded-xl border border-slate-200 p-6 h-fit">
            <h2 class="font-semibold text-slate-900 mb-4">Estado del pedido</h2>
            <form method="POST" action="{{ route('admin.orders.updateStatus', $order) }}" class="space-y-3">
                @csrf
                @method('PATCH')
                <select name="status" class="w-full rounded-md border-slate-300 text-sm">
                    @foreach (['pendiente_pago' => 'Pendiente de pago', 'pagado' => 'Pagado', 'enviado' => 'Enviado', 'cancelado' => 'Cancelado'] as $value => $label)
                        <option value="{{ $value }}" @selected($order->status === $value)>{{ $label }}</option>
                    @endforeach
                </select>
                <button type="submit" class="w-full bg-teal-700 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-teal-800">
                    Actualizar estado
                </button>
            </form>
        </div>
    </div>
@endsection
