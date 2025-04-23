Technology Stack & Justification – Eindr

Prepared By: Idrees Khan
Owner: Karsaaz Solutions

---

1. Mobile Application Stack

Framework: React Native

Why: Cross-platform native compilation, fast UI, smooth animations, and wide device support.

Benefits:

One codebase for Android and iOS

Hot reload for rapid development

Strong Google support

Custom UI capabilities (ideal for assistant animations)

Scalability: Easily handles millions of users with minimal device-level issues

---

2. Backend Stack

Language & Framework: Python + FastAPI

Why: Modern async framework with great performance, especially for APIs and AI workflows.

Benefits:

Fast performance (async-first)

Lightweight and modular

Easy to containerize with Docker

Ideal for ML/AI integration

Database: PostgreSQL + pgvector

Why: Robust relational database with native support for AI-based similarity search

Benefits:

Mature, secure, scalable

Vector extension for habit tracking

Open-source and cloud-optimized

Task Scheduler: APScheduler

Why: Lightweight, flexible, and works seamlessly with FastAPI

Use: Time-based alarms, reminders, recurring jobs

WebSocket (Optional): Starlette (FastAPI-based)

Why: Enables real-time syncing (e.g., shared reminders)

Authentication: Firebase Auth

Why: Secure, easy social login, and offloads auth security

Notifications: Firebase Cloud Messaging (Android) + Apple Push Notification Service (iOS)

Why: Native systems, free at scale, reliable delivery

---

3. AI/NLP Stack

Wake Word Detection: Mycroft Precise

Lightweight and on-device friendly for privacy and performance

Speech-to-Text (STT): Whisper Tiny (local) + API fallback (Whisper API)

Combines speed and accuracy for multilingual use

Intent Classifier: MiniLM / MobileBERT (quantized)

Low-latency classification of commands (e.g., reminder vs note)

Conversational AI: Bloom 560 via vLLM

Fast LLMs for lightweight but smart responses

Future-ready for personalized contextual responses

Text-to-Speech (TTS): Coqui TTS (local) + Google TTS API fallback

Customizable and natural-sounding voice generation

Habit Detection: Embedding with MiniLM + pgvector similarity search

Real-time suggestion engine for repeated behaviors

Orchestration: LangChain

Chains AI flows (e.g., voice → intent → habit → action)

---

4. Infrastructure & DevOps

Containerization: Docker

All services (backend, AI models) are Dockerized for portability

Hosting (MVP): Railway / Render / Fly.io

Quick to deploy, autoscaling, low maintenance

Hosting (Scale): AWS / GCP (ECS, EKS, GKE)

Load balancing, autoscaling, global CDN support

Monitoring: Sentry (frontend/backend) + Prometheus + Grafana (infra)

CI/CD: GitHub Actions or Railway-integrated pipelines

Security: OAuth 2.0 (Firebase), HTTPS, rate limiting, encrypted storage

---

5. Future Scalability Benefits

All services are modular and ready for microservice transition

Models are containerized for horizontal scaling

PostgreSQL supports clustering and partitioning for millions of rows

Firebase and push infrastructure scale globally

---

Conclusion:

This stack is designed to support Eindr’s growth from MVP to 10M+ users with minimal re-architecture. It's light, reliable, developer-friendly, and fully prepared for global scale and AI integration.

Eindr – Pricing Strategy Document
Prepared by: Idrees Khan
App Name: Eindr – Forget Forgetting

Pricing Strategy Overview
To balance rapid user growth and sustainable revenue generation, Eindr will follow a Hybrid Free Trial Model. This model allows users full access to all features for a limited period (7 days), after which a payment method is required to continue usage.

Free Trial Phase (Day 1-7)
Access: All features fully unlocked

No credit card required upfront

Onboarding: Via email and/or phone number only

Trial Duration: 7 days from the moment of account creation

Objective:

Showcase full value of AI-driven reminders and notes

Build emotional connection with voice assistant

Remove entry barrier for maximum sign-ups

Post-Trial Phase (Day 8 Onward)
All features lock completely

User must add credit/debit card to proceed

Display Upgrade Screen with:

Personalized message from AI assistant (TTS-based)

List of benefits

Pricing tier options

Sample AI Message: “Hey user, your 7-day free trial has ended. But I’m still here, ready to plan, remind, and remember with you. Let’s continue our journey – pick a plan that suits you best.”

Pricing Tiers (Standard Global Rates)
Starter Plan
Price: $4.99/month

Includes:

Up to 50 reminders/month

Basic TTS voice assistant

Notes and lists feature

2 supported languages

Pro Plan (Most Popular)
Price: $9.99/month

Includes:

Unlimited reminders

AI voice assistant with TTS

Habit tracking

Priority notifications

Multilingual support (10 languages)

Share reminders with 3 friends

Elite Plan
Price: $14.99/month

Includes:

All Pro features

Custom AI voice themes

Custom wake word

35+ languages

Sync across all devices

Priority support

Regional Pricing (Geo-based)
Region
Starter
Pro
Elite
United States
$4.99
$9.99
$14.99
United Kingdom
£4.49
£8.99
£13.99
Europe (EUR zone)
€4.49
€8.99
€13.99
Pakistan
PKR 899
PKR 1799
PKR 2599
India
₹299
₹599
₹999
UAE
AED 18
AED 36
AED 55

Monetization Enhancers
Seasonal Discounts: Offer 20% off for yearly plans

In-app Upsells: Add-ons like premium wake words, voice themes

Voice Reminders as Triggers: Timely upsells using AI assistant

Summary of Benefits
Plan
Monthly Price (Global)
Reminders
Notes
AI Voice
Languages
Friends
Wake Word
Starter
$4.99
50
Yes
Basic
2
No
No
Pro
$9.99
Unlimited
Yes
Full
10
3
No
Elite
$14.99
Unlimited
Yes
Customizable
35+
Unlimited
Yes

Conclusion:
This revised pricing strategy increases perceived value, introduces region-based affordability, and maintains a strong free-trial-to-paid-user conversion funnel while managing backend costs.
