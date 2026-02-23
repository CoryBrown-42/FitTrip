import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { lookupBarcode, calculateFoodPoints } from '../services/foodScanner'
import BarcodeScanner from '../components/BarcodeScanner'

export default function Pantry() {
    const { state, dispatch } = useApp()
    const [showScanner, setShowScanner] = useState(false)
    const [scanResult, setScanResult] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    async function handleScan(barcode) {
        setLoading(true)
        setError('')
        setScanResult(null)
        try {
            const product = await lookupBarcode(barcode)
            if (!product) {
                setError('Food not found for this barcode.')
                return
            }
            setScanResult(product)
        } catch (e) {
            setError('Error looking up barcode.')
        } finally {
            setLoading(false)
        }
    }

    function addToPantry(product) {
        dispatch({ type: 'ADD_PANTRY_ITEM', payload: { ...product, quantity: 1, points: calculateFoodPoints(product) } })
        setScanResult(null)
        setShowScanner(false)
    }

    function updateQuantity(barcode, delta) {
        dispatch({ type: 'UPDATE_PANTRY_ITEM_QUANTITY', payload: { barcode, delta } })
    }

    function removeItem(barcode) {
        dispatch({ type: 'REMOVE_PANTRY_ITEM', payload: barcode })
    }

    const totalPoints = (state.pantry || []).reduce((sum, item) => sum + (item.points || 0) * (item.quantity || 1), 0)

    return (
        <div className="max-w-2xl mx-auto p-4">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Pantry</h2>
                <button className="px-4 py-2 bg-brand-500 text-white rounded" onClick={() => setShowScanner(true)}>Scan Food</button>
            </div>
            <div className="mb-4">
                <span className="text-amber-500 font-semibold">Food Points: {totalPoints}</span>
            </div>
            {showScanner && <BarcodeScanner onScan={handleScan} onClose={() => setShowScanner(false)} />}
            {scanResult && (
                <div className="glass-card p-4 mb-4">
                    <div className="flex gap-4">
                        {scanResult.image && <img src={scanResult.image} alt={scanResult.name} className="w-24 h-24 object-cover rounded" />}
                        <div>
                            <h3 className="text-lg font-semibold">{scanResult.name}</h3>
                            <p className="text-sm text-dark-400">Brand: {scanResult.brand}</p>
                            <div className="flex gap-2 mt-2">
                                {scanResult.nutriScore && <span className="px-2 py-1 bg-green-500 text-white rounded text-xs">Nutri-Score: {scanResult.nutriScore.toUpperCase()}</span>}
                                {scanResult.novaGroup && <span className="px-2 py-1 bg-blue-500 text-white rounded text-xs">NOVA: {scanResult.novaGroup}</span>}
                            </div>
                            <div className="mt-2 text-xs text-dark-400">
                                Protein: {scanResult.nutrients.protein_100g || 0}g | Fiber: {scanResult.nutrients.fiber_100g || 0}g | Calories: {scanResult.nutrients.energy_kcal_100g || 0} kcal/100g
                            </div>
                            <div className="mt-2 text-xs text-amber-500">Points: {calculateFoodPoints(scanResult)}</div>
                            <button className="mt-3 px-4 py-2 bg-brand-500 text-white rounded" onClick={() => addToPantry(scanResult)}>Add to Pantry</button>
                        </div>
                    </div>
                </div>
            )}
            {error && <div className="text-red-500 mb-2">{error}</div>}
            {(state.pantry || []).length === 0 ? (
                <div className="glass-card p-8 text-center text-dark-400">No foods in your pantry yet. Scan barcodes to add items!</div>
            ) : (
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {state.pantry.map(item => (
                        <li key={item.barcode} className="glass-card p-3 flex gap-3 items-center">
                            {item.image && <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />}
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold">{item.name}</span>
                                    <span className="text-xs text-dark-400">{item.brand}</span>
                                    <span className="px-2 py-1 bg-amber-500 text-white rounded text-xs">{item.points} pts</span>
                                </div>
                                <div className="mt-2 flex items-center gap-2">
                                    <button className="px-2 py-1 bg-dark-700 text-white rounded text-xs" onClick={() => updateQuantity(item.barcode, -1)} disabled={item.quantity <= 1}>-</button>
                                    <span className="text-xs">Qty: {item.quantity || 1}</span>
                                    <button className="px-2 py-1 bg-dark-700 text-white rounded text-xs" onClick={() => updateQuantity(item.barcode, 1)}>+</button>
                                    <button className="ml-2 px-2 py-1 bg-red-500 text-white rounded text-xs" onClick={() => removeItem(item.barcode)}>Remove</button>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}
