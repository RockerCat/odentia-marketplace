@extends('layouts.admin')

@section('title', 'Categorías — Admin Odentia')

@section('content')
    <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-slate-900">Categorías</h1>
        <a href="{{ route('admin.categories.create') }}"
           class="bg-teal-700 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-teal-800">
            + Nueva categoría
        </a>
    </div>

    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table class="w-full text-sm">
            <thead class="bg-slate-50 text-slate-500 text-left">
                <tr>
                    <th class="px-5 py-3">Nombre</th>
                    <th class="px-5 py-3">Productos</th>
                    <th class="px-5 py-3"></th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
                @forelse ($categories as $category)
                    <tr class="hover:bg-slate-50">
                        <td class="px-5 py-3 font-medium text-slate-900">{{ $category->name }}</td>
                        <td class="px-5 py-3 text-slate-500">{{ $category->products_count }}</td>
                        <td class="px-5 py-3 text-right space-x-3">
                            <a href="{{ route('admin.categories.edit', $category) }}" class="text-teal-700 hover:underline">Editar</a>
                            <form method="POST" action="{{ route('admin.categories.destroy', $category) }}" class="inline"
                                  onsubmit="return confirm('¿Eliminar esta categoría?');">
                                @csrf
                                @method('DELETE')
                                <button type="submit" class="text-red-500 hover:underline">Eliminar</button>
                            </form>
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td class="px-5 py-6 text-slate-400" colspan="3">No hay categorías todavía.</td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>
@endsection
