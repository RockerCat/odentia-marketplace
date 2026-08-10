<?php

namespace App\Support;

use App\Models\Product;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Session;

class Cart
{
    protected const SESSION_KEY = 'cart';

    public static function add(Product $product, int $quantity): void
    {
        $cart = self::raw();
        $current = $cart[$product->id] ?? 0;
        $cart[$product->id] = min($product->stock, max(1, $current + $quantity));
        Session::put(self::SESSION_KEY, $cart);
    }

    public static function update(Product $product, int $quantity): void
    {
        $cart = self::raw();

        if ($quantity <= 0) {
            unset($cart[$product->id]);
        } else {
            $cart[$product->id] = min($product->stock, $quantity);
        }

        Session::put(self::SESSION_KEY, $cart);
    }

    public static function remove(Product $product): void
    {
        $cart = self::raw();
        unset($cart[$product->id]);
        Session::put(self::SESSION_KEY, $cart);
    }

    public static function clear(): void
    {
        Session::forget(self::SESSION_KEY);
    }

    public static function items(): Collection
    {
        $cart = self::raw();

        if (empty($cart)) {
            return collect();
        }

        return Product::whereIn('id', array_keys($cart))
            ->get()
            ->map(fn (Product $product) => [
                'product' => $product,
                'quantity' => $cart[$product->id],
                'subtotal' => $product->price * $cart[$product->id],
            ]);
    }

    public static function count(): int
    {
        return array_sum(self::raw());
    }

    public static function total(): float
    {
        return self::items()->sum('subtotal');
    }

    protected static function raw(): array
    {
        return Session::get(self::SESSION_KEY, []);
    }
}
