<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Support\Cart;
use Illuminate\Http\Request;

class CartController extends Controller
{
    public function index()
    {
        return view('cart.index', [
            'items' => Cart::items(),
            'total' => Cart::total(),
        ]);
    }

    public function add(Request $request, Product $product)
    {
        $request->validate([
            'quantity' => ['required', 'integer', 'min:1', 'max:' . $product->stock],
        ]);

        Cart::add($product, (int) $request->quantity);

        return back()->with('success', "{$product->name} agregado al carrito.");
    }

    public function update(Request $request, Product $product)
    {
        $request->validate([
            'quantity' => ['required', 'integer', 'min:0', 'max:' . $product->stock],
        ]);

        Cart::update($product, (int) $request->quantity);

        return back()->with('success', 'Carrito actualizado.');
    }

    public function remove(Product $product)
    {
        Cart::remove($product);

        return back()->with('success', 'Producto eliminado del carrito.');
    }
}
