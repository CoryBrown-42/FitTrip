// Renpho CSV data parser
// Renpho scales can export CSV data from the Renpho app
// This module parses that CSV data for use in FitTrip

export function parseRenphoCSV(csvText) {
    const lines = csvText.trim().split('\n')
    if (lines.length < 2) return []

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''))

    const records = []
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/['"]/g, ''))
        const record = {}
        headers.forEach((header, idx) => {
            record[header] = values[idx] || ''
        })
        records.push(normalizeRenphoRecord(record))
    }

    return records.sort((a, b) => new Date(a.date) - new Date(b.date))
}

function normalizeRenphoRecord(raw) {
    // Renpho CSV typically has these columns:
    // Time of Measurement, Weight, BMI, Body Fat, Fat-free Body Weight,
    // Subcutaneous Fat, Visceral Fat, Body Water, Skeletal Muscle,
    // Muscle Mass, Bone Mass, Protein, BMR, Metabolic Age

    return {
        date: raw['time of measurement'] || raw['date'] || raw['time'] || '',
        weight: parseFloat(raw['weight'] || raw['weight(kg)'] || raw['weight(lb)']) || null,
        bmi: parseFloat(raw['bmi']) || null,
        bodyFat: parseFloat(raw['body fat'] || raw['body fat(%)'] || raw['bodyfat']) || null,
        fatFreeWeight: parseFloat(raw['fat-free body weight'] || raw['lean body mass']) || null,
        subcutaneousFat: parseFloat(raw['subcutaneous fat'] || raw['subcutaneous fat(%)']) || null,
        visceralFat: parseFloat(raw['visceral fat']) || null,
        bodyWater: parseFloat(raw['body water'] || raw['body water(%)']) || null,
        skeletalMuscle: parseFloat(raw['skeletal muscle'] || raw['skeletal muscle(%)']) || null,
        muscleMass: parseFloat(raw['muscle mass'] || raw['muscle mass(kg)'] || raw['muscle mass(lb)']) || null,
        boneMass: parseFloat(raw['bone mass'] || raw['bone mass(kg)'] || raw['bone mass(lb)']) || null,
        protein: parseFloat(raw['protein'] || raw['protein(%)']) || null,
        bmr: parseFloat(raw['bmr'] || raw['basal metabolic rate']) || null,
        metabolicAge: parseFloat(raw['metabolic age']) || null,
    }
}

export function getRenphoSummary(records) {
    if (!records || records.length === 0) return null

    const latest = records[records.length - 1]
    const earliest = records[0]

    const weightChange = (latest.weight && earliest.weight)
        ? (latest.weight - earliest.weight).toFixed(1)
        : null

    const bodyFatChange = (latest.bodyFat && earliest.bodyFat)
        ? (latest.bodyFat - earliest.bodyFat).toFixed(1)
        : null

    return {
        latest,
        earliest,
        totalRecords: records.length,
        weightChange,
        bodyFatChange,
        dateRange: {
            from: earliest.date,
            to: latest.date,
        }
    }
}

// Generate sample Renpho data for demo purposes
export function generateSampleRenphoData() {
    const records = []
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 30)

    let weight = 180
    let bodyFat = 22

    for (let i = 0; i <= 30; i += 3) {
        const date = new Date(startDate)
        date.setDate(date.getDate() + i)

        weight += (Math.random() - 0.6) * 1.5 // Slight downward trend
        bodyFat += (Math.random() - 0.55) * 0.5

        records.push({
            date: date.toISOString().split('T')[0],
            weight: Math.round(weight * 10) / 10,
            bmi: Math.round((weight / (70 * 70) * 703) * 10) / 10,
            bodyFat: Math.round(bodyFat * 10) / 10,
            fatFreeWeight: Math.round(weight * (1 - bodyFat / 100) * 10) / 10,
            subcutaneousFat: Math.round((bodyFat * 0.7) * 10) / 10,
            visceralFat: Math.round(8 + Math.random() * 2),
            bodyWater: Math.round((55 + Math.random() * 5) * 10) / 10,
            skeletalMuscle: Math.round((45 + Math.random() * 3) * 10) / 10,
            muscleMass: Math.round(weight * 0.4 * 10) / 10,
            boneMass: 7.5,
            protein: Math.round((18 + Math.random() * 2) * 10) / 10,
            bmr: Math.round(1800 + Math.random() * 100),
            metabolicAge: 28,
        })
    }

    return records
}
