# Privacy Policy for FitTrip

**Last updated: February 22, 2026**

## Introduction

FitTrip ("we", "our", or "the app") is a fitness tracking application developed by Cory Brown. This Privacy Policy explains how we collect, use, and protect your information when you use our mobile application.

## Information We Collect

### Data You Provide
- **Fitness goals and preferences** — Goals, workout types, and fitness level you enter in the app
- **Workout logs** — Exercise sessions you manually record
- **AI Coach conversations** — Messages you send to the AI Coach feature

### Data from Third-Party Services
When you choose to connect the following services, we access data from them on your behalf:

- **Fitbit** — Steps, calories burned, heart rate, weight, and sleep data via the Fitbit Web API (OAuth 2.0)
- **Renpho** — Body composition data (weight, BMI, body fat, muscle mass, etc.) imported via CSV file upload from the Renpho app

### Data We Do NOT Collect
- We do not collect your name, email address, or account credentials
- We do not track your location
- We do not use advertising SDKs or trackers
- We do not collect device identifiers for analytics

## How We Use Your Information

- **Display fitness data** — To show your health and workout metrics in the app dashboard
- **AI coaching** — Your fitness data and conversation messages are sent to Google's Gemini API to generate personalized fitness advice
- **Goal tracking** — To measure your progress against your fitness goals

## Data Storage

- All fitness data, workout logs, preferences, and conversation history are stored **locally on your device** using browser/app local storage
- **No data is stored on our servers** — we do not operate any backend servers
- Data sent to the Gemini AI API is processed by Google and subject to [Google's Privacy Policy](https://policies.google.com/privacy)
- Data retrieved from Fitbit is subject to [Fitbit's Privacy Policy](https://www.fitbit.com/legal/privacy-policy)

## Third-Party Services

FitTrip integrates with the following third-party services:

| Service | Purpose | Data Shared |
|---------|---------|-------------|
| **Google Gemini API** | AI fitness coaching | Conversation messages and fitness context |
| **Fitbit Web API** | Fitness data sync | OAuth token (user-authorized) |
| **Renpho** | Body composition import | None (CSV is processed locally) |

We do not sell, rent, or share your personal data with any other third parties.

## Data Retention

Since all data is stored locally on your device:
- Data persists until you clear the app's storage or uninstall the app
- You can disconnect Fitbit at any time from the Connections page, which removes your Fitbit access token
- Clearing the app data removes all stored information

## Your Rights

You have the right to:
- **Access** your data — all data is visible within the app
- **Delete** your data — clear app storage or uninstall the app
- **Disconnect** third-party services at any time
- **Choose** which services to connect — all integrations are optional

## Children's Privacy

FitTrip is not intended for children under 13. We do not knowingly collect data from children under 13.

## Security

- Fitbit authentication uses industry-standard OAuth 2.0
- Your Fitbit access token is stored locally and is never transmitted to our servers
- API keys are not embedded in the client-side code

## Changes to This Policy

We may update this Privacy Policy from time to time. Changes will be reflected by updating the "Last updated" date at the top of this page.

## Contact

If you have questions about this Privacy Policy, you can contact us by opening an issue on our [GitHub repository](https://github.com/yroc9/FitTrip).

---

*This privacy policy is hosted on GitHub and applies to the FitTrip mobile application available on the Google Play Store.*
