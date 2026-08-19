@extends('layouts.admin')

@section('title', ($category->exists ? 'Editar' : 'Nueva') . ' categoría — Admin Odentia')

@section('content')
    <a href="{{ route('admin.categories.index') }}" class="text-sm text-teal-700 hover:underline">&larr; Volver a categorías</a>

    <h1 class="text-2xl font-bold text-slate-900 mt-4 mb-6">
        {{ $category->exists ? 'Editar categoría' : 'Nueva categoría' }}
    </h1>

    <form method="POST"
          action="{{ $category->exists ? route('admin.categories.update', $category) : route('admin.categories.store') }}"
          class="bg-white rounded-xl border border-slate-200 p-6 max-w-md space-y-4">
        @csrf
        @if ($category->exists) @method('PUT') @endif

        <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
            <input type="text" name="name" value="{{ old('name', $category->name) }}" class="w-full rounded-md border-slate-300">
            @error('name') <p class="text-sm text-red-600 mt-1">{{ $message }}</p> @enderror
        </div>

        <button type="submit" class="bg-teal-700 text-white px-5 py-2.5 rounded-md font-medium hover:bg-teal-800">
            {{ $category->exists ? 'Guardar cambios' : 'Crear categoría' }}
        </button>
    </form>
@endsection
