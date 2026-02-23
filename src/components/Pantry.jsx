import { useApp } from '../context/AppContext'

export default function Pantry() {
    const { state, dispatch } = useApp()

    function removeItem(barcode) {
        dispatch({ type: 'REMOVE_PANTRY_ITEM', payload: barcode })
    }

    return (
        <div className="max-w-md mx-auto p-4 glass-card">
            <h2 className="text-lg font-bold mb-2">Your Pantry</h2>
            {state.pantry && state.pantry.length > 0 ? (
                <ul className="space-y-2">
                    {state.pantry.map(item => (
                        <li key={item.barcode} className="flex items-center gap-3">
                            <span className="text-sm text-dark-300">{item.name}</span>
                            {item.brand && <span className="text-xs text-dark-400">({item.brand})</span>}
                            <button
                                className="px-2 py-1 bg-red-500 text-white rounded text-xs"
                                onClick={() => removeItem(item.barcode)}
                            >Remove</button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-dark-400">No foods in your pantry yet. Scan barcodes to add items!</p>
            )}
        </div>
    )
}
