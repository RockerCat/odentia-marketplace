<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CatalogSeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            'Instrumental' => [
                ['name' => 'Espejo bucal N°5', 'price' => 3.50, 'stock' => 200],
                ['name' => 'Pinza algodonera', 'price' => 4.20, 'stock' => 150],
                ['name' => 'Explorador dental doble punta', 'price' => 5.00, 'stock' => 180],
                ['name' => 'Cureta periodontal Gracey', 'price' => 12.90, 'stock' => 90],
            ],
            'Consumibles' => [
                ['name' => 'Guantes de nitrilo (caja x100)', 'price' => 8.90, 'stock' => 300],
                ['name' => 'Barbijos quirúrgicos (caja x50)', 'price' => 6.50, 'stock' => 300],
                ['name' => 'Anestesia dental lidocaína (caja x50)', 'price' => 22.00, 'stock' => 80],
                ['name' => 'Rollos de algodón dental (bolsa x100)', 'price' => 3.20, 'stock' => 250],
            ],
            'Equipos' => [
                ['name' => 'Lámpara de fotocurado LED', 'price' => 145.00, 'stock' => 15],
                ['name' => 'Autoclave 18L', 'price' => 890.00, 'stock' => 5],
                ['name' => 'Pieza de mano de alta velocidad', 'price' => 210.00, 'stock' => 20],
                ['name' => 'Sillón dental completo', 'price' => 3200.00, 'stock' => 3],
            ],
        ];

        foreach ($categories as $categoryName => $products) {
            $category = Category::create([
                'name' => $categoryName,
                'slug' => Str::slug($categoryName),
            ]);

            foreach ($products as $product) {
                Product::create([
                    'category_id' => $category->id,
                    'name' => $product['name'],
                    'slug' => Str::slug($product['name']),
                    'description' => "Implemento odontológico de la categoría {$categoryName}.",
                    'price_cents' => (int) round($product['price'] * 100),
                    'stock' => $product['stock'],
                ]);
            }
        }
    }
}
