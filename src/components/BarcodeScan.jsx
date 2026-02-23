import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { lookupBarcode, getScanPoints } from '../services/foodBarcode'

export default function BarcodeScan() {
    const { dispatch } = useApp()
    const [barcode, setBarcode] = useState('')
    const [food, setFood] = useState(null)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    async function handleScan() {
        setLoading(true)
        setError('')
        setFood(null)
        try {
            const result = await lookupBarcode(barcode)
            if (!result) {
                setError('Food not found for this barcode.')
                return
            }
            setFood(result)
            dispatch({ type: 'ADD_PANTRY_ITEM', payload: result })
            dispatch({ type: 'AWARD_SCAN_POINTS', payload: getScanPoints(result) })
        } catch (e) {
            setError('Error looking up barcode.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-md mx-auto p-4 glass-card">
            <h2 className="text-lg font-bold mb-2">Scan Food Barcode</h2>
            <input
                type="text"
                value={barcode}
                onChange={e => setBarcode(e.target.value)}
                placeholder="Enter barcode manually or use scanner"
                className="w-full mb-2 px-3 py-2 border rounded"
            />
            <button
                onClick={handleScan}
                disabled={loading || !barcode}
                className="px-4 py-2 bg-brand-500 text-white rounded"
            >
                {loading ? 'Scanning...' : 'Scan Barcode'}
            </button>
            {error && <div className="text-red-500 mt-2">{error}</div>}
            {food && (
                <div className="mt-4">
                    <h3 className="text-md font-semibold">{food.name}</h3>
                    <p className="text-sm text-dark-400">Brand: {food.brand}</p>
                    {food.image && <img src={food.image} alt={food.name} className="w-24 h-24 object-cover rounded" />}
                    <p className="text-xs mt-2">Points awarded: {getScanPoints(food)}</p>
                </div>
            )}
        </div>
    )
}
