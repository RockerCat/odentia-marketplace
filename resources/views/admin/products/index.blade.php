@extends('layouts.admin')

@section('title', 'Productos — Admin Odentia')

@section('content')
    <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-slate-900">Productos</h1>
        <a href="{{ route('admin.products.create') }}"
           class="bg-teal-700 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-teal-800">
            + Nuevo producto
        </a>
    </div>

    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table class="w-full text-sm">
            <thead class="bg-slate-50 text-slate-500 text-left">
                <tr>
                    <th class="px-5 py-3"></th>
                    <th class="px-5 py-3">Nombre</th>
                    <th class="px-5 py-3">Categoría</th>
                    <th class="px-5 py-3">Precio</th>
                    <th class="px-5 py-3">Stock</th>
                    <th class="px-5 py-3"></th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
                @forelse ($products as $product)
                    <tr class="hover:bg-slate-50">
                        <td class="px-5 py-3">
                            <div class="w-10 h-10 rounded-md bg-slate-100 overflow-hidden flex items-center justify-center">
                                @if ($product->main_image_url)
                                    <img src="{{ $product->main_image_url }}" alt="" class="w-full h-full object-cover">
                                @else
                                    <span class="text-slate-300 text-xs">—</span>
                                @endif
                            </div>
                        </td>
                        <td class="px-5 py-3 font-medium text-slate-900">{{ $product->name }}</td>
                        <td class="px-5 py-3 text-slate-500">{{ $product->category->name }}</td>
                        <td class="px-5 py-3">${{ number_format($product->price, 2) }}</td>
                        <td class="px-5 py-3">{{ $product->stock }}</td>
                        <td class="px-5 py-3 text-right space-x-3">
                            <a href="{{ route('admin.products.edit', $product) }}" class="text-teal-700 hover:underline">Editar</a>
                            <form method="POST" action="{{ route('admin.products.destroy', $product) }}" class="inline"
                                  onsubmit="return confirm('¿Eliminar este producto?');">
                                @csrf
                                @method('DELETE')
                                <button type="submit" class="text-red-500 hover:underline">Eliminar</button>
                            </form>
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td class="px-5 py-6 text-slate-400" colspan="6">No hay productos todavía.</td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>
@endsection
