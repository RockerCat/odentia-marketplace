@extends('layouts.admin')

@section('title', ($product->exists ? 'Editar' : 'Nuevo') . ' producto — Admin Odentia')

@section('content')
    <a href="{{ route('admin.products.index') }}" class="text-sm text-teal-700 hover:underline">&larr; Volver a productos</a>

    <h1 class="text-2xl font-bold text-slate-900 mt-4 mb-6">
        {{ $product->exists ? 'Editar producto' : 'Nuevo producto' }}
    </h1>

    <form method="POST" enctype="multipart/form-data"
          action="{{ $product->exists ? route('admin.products.update', $product) : route('admin.products.store') }}"
          class="bg-white rounded-xl border border-slate-200 p-6 max-w-xl space-y-4">
        @csrf
        @if ($product->exists) @method('PUT') @endif

        <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
            <input type="text" name="name" value="{{ old('name', $product->name) }}" class="w-full rounded-md border-slate-300">
            @error('name') <p class="text-sm text-red-600 mt-1">{{ $message }}</p> @enderror
        </div>

        <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Categoría</label>
            <select name="category_id" class="w-full rounded-md border-slate-300">
                @foreach ($categories as $category)
                    <option value="{{ $category->id }}" @selected(old('category_id', $product->category_id) == $category->id)>
                        {{ $category->name }}
                    </option>
                @endforeach
            </select>
            @error('category_id') <p class="text-sm text-red-600 mt-1">{{ $message }}</p> @enderror
        </div>

        <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
            <textarea name="description" rows="3" class="w-full rounded-md border-slate-300">{{ old('description', $product->description) }}</textarea>
        </div>

        <div class="flex gap-4">
            <div class="flex-1">
                <label class="block text-sm font-medium text-slate-700 mb-1">Precio (USD)</label>
                <input type="number" step="0.01" min="0" name="price"
                       value="{{ old('price', $product->exists ? $product->price : '') }}"
                       class="w-full rounded-md border-slate-300">
                @error('price') <p class="text-sm text-red-600 mt-1">{{ $message }}</p> @enderror
            </div>
            <div class="flex-1">
                <label class="block text-sm font-medium text-slate-700 mb-1">Stock</label>
                <input type="number" min="0" name="stock" value="{{ old('stock', $product->stock) }}"
                       class="w-full rounded-md border-slate-300">
                @error('stock') <p class="text-sm text-red-600 mt-1">{{ $message }}</p> @enderror
            </div>
        </div>

        @unless ($product->exists)
            <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Imágenes</label>
                <input type="file" name="images[]" multiple accept="image/*" class="w-full text-sm">
                <p class="text-xs text-slate-400 mt-1">Puedes seleccionar una o varias imágenes (JPG, PNG — máx. 4MB c/u).</p>
                @error('images') <p class="text-sm text-red-600 mt-1">{{ $message }}</p> @enderror
                @error('images.*') <p class="text-sm text-red-600 mt-1">{{ $message }}</p> @enderror
            </div>
        @endunless

        <button type="submit" class="bg-teal-700 text-white px-5 py-2.5 rounded-md font-medium hover:bg-teal-800">
            {{ $product->exists ? 'Guardar cambios' : 'Crear producto' }}
        </button>
    </form>

    @if ($product->exists)
        <div class="max-w-xl mt-6">
            <h2 class="text-sm font-medium text-slate-700 mb-3">Imágenes</h2>

            @if ($product->images->isNotEmpty())
                <div class="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-4">
                    @foreach ($product->images as $image)
                        <div class="relative group">
                            <img src="{{ $image->url }}" alt="{{ $product->name }}"
                                 class="w-full aspect-square object-cover rounded-lg border border-slate-200">
                            <form method="POST" action="{{ route('admin.products.images.destroy', [$product, $image]) }}"
                                  onsubmit="return confirm('¿Eliminar esta imagen?');"
                                  class="absolute top-1 right-1">
                                @csrf
                                @method('DELETE')
                                <button type="submit"
                                        class="bg-white/90 text-red-600 text-xs rounded-full w-6 h-6 flex items-center justify-center shadow hover:bg-white">
                                    &times;
                                </button>
                            </form>
                        </div>
                    @endforeach
                </div>
            @endif

            <form method="POST" enctype="multipart/form-data" id="quick-image-form"
                  action="{{ route('admin.products.images.store', $product) }}"
                  class="bg-white rounded-xl border border-slate-200 p-4">
                @csrf
                <label class="block text-sm font-medium text-slate-700 mb-1">Agregar imágenes</label>
                <input type="file" name="images[]" id="quick-image-input" multiple accept="image/*" class="w-full text-sm">
                <p class="text-xs text-slate-400 mt-1">Se guardan automáticamente al elegirlas (JPG, PNG — máx. 4MB c/u).</p>
                @error('images') <p class="text-sm text-red-600 mt-1">{{ $message }}</p> @enderror
                @error('images.*') <p class="text-sm text-red-600 mt-1">{{ $message }}</p> @enderror
            </form>
        </div>

        <script>
            document.getElementById('quick-image-input').addEventListener('change', function () {
                if (this.files.length > 0) {
                    document.getElementById('quick-image-form').submit();
                }
            });
        </script>
    @endif
@endsection
