<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Support\Cart;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redirect;

class CheckoutController extends Controller
{
    public function index()
    {
        $items = Cart::items();

        if ($items->isEmpty()) {
            return redirect()->route('cart.index');
        }

        return view('checkout.index', [
            'items' => $items,
            'total' => Cart::total(),
        ]);
    }

    public function store(Request $request)
    {
        $items = Cart::items();

        if ($items->isEmpty()) {
            return redirect()->route('cart.index');
        }

        $data = $request->validate([
            'customer_name' => ['required', 'string', 'max:255'],
            'customer_email' => ['required', 'email', 'max:255'],
            'customer_phone' => ['required', 'string', 'max:50'],
            'address' => ['required', 'string', 'max:1000'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $order = DB::transaction(function () use ($data, $items) {
            $order = Order::create([
                ...$data,
                'total_cents' => (int) round($items->sum('subtotal') * 100),
                'status' => 'pendiente_pago',
            ]);

            foreach ($items as $item) {
                $order->items()->create([
                    'product_id' => $item['product']->id,
                    'product_name' => $item['product']->name,
                    'unit_price_cents' => $item['product']->price_cents,
                    'quantity' => $item['quantity'],
                    'subtotal_cents' => (int) round($item['subtotal'] * 100),
                ]);

                $item['product']->decrement('stock', $item['quantity']);
            }

            return $order;
        });

        Cart::clear();

        return Redirect::route('checkout.confirmation', $order);
    }

    public function confirmation(Order $order)
    {
        return view('checkout.confirmation', [
            'order' => $order->load('items'),
        ]);
    }
}
