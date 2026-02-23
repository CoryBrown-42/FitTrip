import { GoogleGenerativeAI } from '@google/generative-ai'

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)

const SYSTEM_PROMPT = `You are FitTrip AI Coach, a knowledgeable and encouraging fitness assistant. You help users with:
- Personalized workout recommendations based on their goals and fitness level
- Nutrition advice and meal planning suggestions
- Exercise form tips and injury prevention
- Motivation and accountability
- Interpreting fitness data from Fitbit, Renpho scales, and workout logs
- Creating progressive training plans

When giving meal or recipe suggestions, ALWAYS use only the foods and ingredients listed in the user's pantry context. Do not ask the user to provide their pantry items—assume the provided list is accurate and complete. Suggest meals using only those items, considering the user's fitness goals and nutrition needs.

Keep responses concise but helpful. Use encouraging language. When giving workout suggestions, be specific about sets, reps, and rest times. Format responses with clear headings and bullet points when appropriate. Always prioritize safety.`

export async function chatWithCoach(messages, userContext = '') {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

        const systemText = SYSTEM_PROMPT + (userContext ? `\n\nUser context:\n${userContext}` : '')
        const chat = model.startChat({
            history: messages.slice(0, -1).map(m => ({
                role: m.role === 'user' ? 'user' : 'model',
                parts: [{ text: m.content }],
            })),
            systemInstruction: { role: 'user', parts: [{ text: systemText }] },
        })

        const lastMessage = messages[messages.length - 1]
        const result = await chat.sendMessage(lastMessage.content)
        const response = await result.response
        return response.text()
    } catch (error) {
        console.error('Gemini API error:', error)
        throw new Error(error?.message || 'Failed to get response from AI Coach. Please try again.')
    }
}

export async function getWorkoutSuggestion(goal, fitnessLevel, equipment, duration) {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

        const prompt = `Create a specific workout plan with the following parameters:
- Goal: ${goal}
- Fitness Level: ${fitnessLevel}
- Available Equipment: ${equipment}
- Duration: ${duration} minutes

Format the response as a structured workout with:
1. Warm-up (5 min)
2. Main workout with specific exercises, sets, reps, and rest times
3. Cool-down (5 min)

Be specific and practical.`

        const result = await model.generateContent(prompt)
        const response = await result.response
        return response.text()
    } catch (error) {
        console.error('Gemini API error:', error)
        throw new Error(error?.message || 'Failed to generate workout suggestion.')
    }
}

export async function analyzeProgress(workouts, goals, bodyData) {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

        const prompt = `Analyze this fitness data and provide insights and recommendations:

Recent Workouts:
${JSON.stringify(workouts.slice(-10), null, 2)}

Current Goals:
${JSON.stringify(goals, null, 2)}

${bodyData ? `Body Composition Data:\n${JSON.stringify(bodyData, null, 2)}` : ''}

Provide:
1. Progress summary
2. What's going well
3. Areas for improvement
4. Specific recommendations for next week
5. Any concerns or adjustments needed

Be encouraging but honest.`

        const result = await model.generateContent(prompt)
        const response = await result.response
        return response.text()
    } catch (error) {
        console.error('Gemini API error:', error)
        throw new Error(error?.message || 'Failed to analyze progress.')
    }
}
