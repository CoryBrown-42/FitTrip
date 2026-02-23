import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'

export default function BarcodeScanner({ onScan, onClose }) {
    const scannerRef = useRef(null)
    const [error, setError] = useState('')
    const [manual, setManual] = useState(false)
    const [barcode, setBarcode] = useState('')
    const [cameraId, setCameraId] = useState('')
    const [cameras, setCameras] = useState([])

    useEffect(() => {
        Html5Qrcode.getCameras().then(devices => {
            setCameras(devices)
            if (devices.length > 0) setCameraId(devices[0].id)
        })
    }, [])

    useEffect(() => {
        if (!cameraId || manual) return
        const html5Qr = new Html5Qrcode('scanner-view')
        html5Qr.start(
            cameraId,
            { fps: 10, qrbox: 250 },
            (decoded) => {
                onScan(decoded)
                html5Qr.stop()
            },
            (err) => setError(err)
        )
        scannerRef.current = html5Qr
        return () => {
            html5Qr.stop().catch(() => {})
        }
    }, [cameraId, manual, onScan])

    function handleManualSubmit(e) {
        e.preventDefault()
        if (barcode) onScan(barcode)
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-dark-900 rounded-xl p-6 w-full max-w-md relative">
                <button className="absolute top-3 right-3 text-white" onClick={onClose}>✕</button>
                <h2 className="text-lg font-bold mb-2 text-white">Scan Food Barcode</h2>
                {!manual ? (
                    <>
                        <div id="scanner-view" className="w-full h-64 bg-dark-800 rounded mb-3" />
                        <div className="flex gap-2 mb-2">
                            {cameras.map(cam => (
                                <button key={cam.id} className="px-2 py-1 bg-dark-700 text-white rounded" onClick={() => setCameraId(cam.id)}>
                                    {cam.label || 'Camera'}
                                </button>
                            ))}
                            <button className="px-2 py-1 bg-dark-700 text-white rounded" onClick={() => setManual(true)}>Manual Entry</button>
                        </div>
                        {error && <div className="text-red-500 text-xs mb-2">{error}</div>}
                    </>
                ) : (
                    <form onSubmit={handleManualSubmit} className="flex flex-col gap-2">
                        <input
                            type="text"
                            value={barcode}
                            onChange={e => setBarcode(e.target.value)}
                            placeholder="Enter barcode manually"
                            className="px-3 py-2 rounded border"
                        />
                        <button type="submit" className="px-4 py-2 bg-brand-500 text-white rounded">Submit</button>
                        <button type="button" className="px-2 py-1 bg-dark-700 text-white rounded" onClick={() => setManual(false)}>Back to Camera</button>
                    </form>
                )}
            </div>
        </div>
    )
}
