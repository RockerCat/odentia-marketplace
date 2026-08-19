<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    public function index()
    {
        return view('admin.products.index', [
            'products' => Product::with(['category', 'images'])->orderBy('name')->get(),
        ]);
    }

    public function create()
    {
        return view('admin.products.form', [
            'product' => new Product(),
            'categories' => Category::orderBy('name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validated($request);

        $product = Product::create($data);

        $this->storeImages($request, $product);

        return redirect()->route('admin.products.index')->with('success', 'Producto creado.');
    }

    public function edit(Product $product)
    {
        return view('admin.products.form', [
            'product' => $product->load('images'),
            'categories' => Category::orderBy('name')->get(),
        ]);
    }

    public function update(Request $request, Product $product)
    {
        $data = $this->validated($request);

        $product->update($data);

        $this->storeImages($request, $product);

        return redirect()->route('admin.products.index')->with('success', 'Producto actualizado.');
    }

    public function destroy(Product $product)
    {
        foreach ($product->images as $image) {
            Storage::disk('public')->delete($image->path);
        }

        $product->delete();

        return back()->with('success', 'Producto eliminado.');
    }

    public function storeImage(Request $request, Product $product)
    {
        $request->validate([
            'images' => ['required', 'array'],
            'images.*' => ['image', 'max:4096'],
        ]);

        $this->storeImages($request, $product);

        return back()->with('success', 'Imagen agregada.');
    }

    public function destroyImage(Product $product, ProductImage $image)
    {
        abort_unless($image->product_id === $product->id, 404);

        Storage::disk('public')->delete($image->path);
        $image->delete();

        return back()->with('success', 'Imagen eliminada.');
    }

    protected function validated(Request $request): array
    {
        $data = $request->validate([
            'category_id' => ['required', 'exists:categories,id'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'stock' => ['required', 'integer', 'min:0'],
            'images' => ['nullable', 'array'],
            'images.*' => ['image', 'max:4096'],
        ]);

        $data['price_cents'] = (int) round($data['price'] * 100);
        unset($data['price'], $data['images']);

        return $data;
    }

    protected function storeImages(Request $request, Product $product): void
    {
        if (! $request->hasFile('images')) {
            return;
        }

        $nextOrder = $product->images()->max('sort_order') + 1;

        foreach ($request->file('images') as $file) {
            $path = $file->store('products', 'public');

            $product->images()->create([
                'path' => $path,
                'sort_order' => $nextOrder++,
            ]);
        }
    }
}
