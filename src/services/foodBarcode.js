// Food barcode lookup service
// Uses Open Food Facts API for barcode lookup

const FOOD_API = 'https://world.openfoodfacts.org/api/v0/product/'

export async function lookupBarcode(barcode) {
    const res = await fetch(`${FOOD_API}${barcode}.json`)
    if (!res.ok) return null
    const data = await res.json()
    if (data.status !== 1) return null
    return {
        name: data.product.product_name || 'Unknown',
        brand: data.product.brands || '',
        nutrients: data.product.nutriments || {},
        image: data.product.image_url || '',
        barcode,
    }
}

// Award points for scanning
export function getScanPoints(food) {
    // Simple: 10 points per scan, bonus for healthy foods
    let points = 10
    if (food.nutrients && food.nutrients['nutrition-score-fr']) {
        points += Math.max(0, 5 - food.nutrients['nutrition-score-fr'])
    }
    return points
}
