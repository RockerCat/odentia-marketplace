<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $categories = Category::orderBy('name')->get();

        $products = Product::with('category')
            ->when($request->category, fn ($query, $slug) => $query->whereHas(
                'category',
                fn ($q) => $q->where('slug', $slug)
            ))
            ->orderBy('name')
            ->get();

        return view('products.index', [
            'categories' => $categories,
            'products' => $products,
            'activeCategory' => $request->category,
        ]);
    }

    public function show(Product $product)
    {
        return view('products.show', [
            'product' => $product->load('category'),
        ]);
    }
}
