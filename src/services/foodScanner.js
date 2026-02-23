// Food scanner service for Open Food Facts API

const FOOD_API = 'https://world.openfoodfacts.org/api/v2/product/'

export async function lookupBarcode(barcode) {
    const res = await fetch(`${FOOD_API}${barcode}.json`)
    if (!res.ok) return null
    const data = await res.json()
    if (!data.product) return null
    return {
        name: data.product.product_name || 'Unknown',
        brand: data.product.brands || '',
        categories: data.product.categories_tags || [],
        nutriScore: data.product.nutriscore_grade || '',
        novaGroup: data.product.nova_group || '',
        nutrients: data.product.nutriments || {},
        image: data.product.image_url || '',
        barcode,
    }
}

export function calculateFoodPoints(product) {
    let points = 0
    // Nutri-Score
    const nutriScore = product.nutriScore?.toLowerCase()
    if (nutriScore === 'a') points += 15
    else if (nutriScore === 'b') points += 12
    else if (nutriScore === 'c') points += 8
    else if (nutriScore === 'd') points += 5
    else if (nutriScore === 'e') points += 2
    // NOVA
    const nova = parseInt(product.novaGroup)
    if (nova === 1) points += 3
    else if (nova === 2) points += 1
    else if (nova === 3) points -= 1
    else if (nova === 4) points -= 3
    // Healthy category bonus
    const healthyTags = ['fruits', 'vegetables', 'legumes', 'nuts', 'fish', 'whole-grains']
    if (product.categories.some(cat => healthyTags.some(tag => cat.includes(tag)))) points += 2
    // High protein bonus
    if (product.nutrients.protein_100g >= 15) points += 1
    // Fiber bonus
    if (product.nutrients.fiber_100g >= 3) points += 1
    // Fallback estimate
    if (!nutriScore) {
        points += estimatePointsFromNutrients(product.nutrients)
    }
    return Math.max(1, Math.min(20, points))
}

function estimatePointsFromNutrients(nut) {
    let pts = 0
    if (nut.protein_100g >= 15) pts += 2
    if (nut.fiber_100g >= 3) pts += 2
    if (nut.sugars_100g <= 5) pts += 2
    if (nut.fat_100g <= 10) pts += 2
    if (nut.sodium_100g <= 200) pts += 2
    return pts
}
