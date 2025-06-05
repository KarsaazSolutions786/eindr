Admin Panel Requirements
Prepared By: Idrees Khan

1. Overview
This document outlines the features, modules, and operational capabilities of the Eindr Admin Panel. Its purpose is to empower administrators with full control, observability, and management of the platform's functionality, users, subscription status, and AI interactions.

2. Core Functional Modules
2.1 Dashboard Overview
Key Stats:

Total Users

Active/Inactive Users (7-day Trial)

Trial vs. Paid Users

Reminders, Notes, and Ledger Entries Created

DAU, MAU, Retention Rate

Language & Country Distribution Map

Real-Time System Health:

AI model response times

Redis queue latency

Reminder trigger logs

2.2 User Management
Search and filter users by:

Email, UID, signup date, platform, country

Plan status: Trial, Paid, Expired

Last active date, device type

User profile view:

Activity logs

Subscription status and history

Reminder, note, and ledger stats

Language and permission settings

Admin Actions:

Deactivate, reset password, flag or ban user

Assign custom subscription duration (1 month, 6 months, 1 year)

Add internal admin notes

2.3 Reminder, Note & Ledger Logs
View history by user or time period

Filter by command type (reminder, note, ledger)

View voice interaction logs stored in history

Cancel, soft-delete, or flag for abuse

2.4 Subscription & Trial Management
Overview of active vs. expired trials

Manual trial extension assignment

Paid subscription list with plan type (monthly/yearly)

Failed renewals, retry queue, billing logs

Export billing data (CSV)

2.5 Feature Usage Insights
Voice input stats (STT duration, frequency)

TTS language usage

Most used features: reminders, notes, ledger

Calendar sync usage

Contacts synced & friend invitation rates

2.6 Notifications & Broadcasts
Push notifications to:

All users

Target segments (inactive, expiring trial, high usage)

Draft, schedule, and view history of notifications

In-app announcements system

2.7 Shared Reminder & Friend System Monitoring
See friend connections and permission levels

Track reminders shared and accepted

Segment users with high sharing or frequent cancelations

2.8 Admin Management & Access Control
Create/edit/remove admin users

Define roles: Super Admin, Support Agent, Analyst, Read-Only

Audit Log of admin actions (with timestamp, IP)

2.9 AI Model & Queue Monitoring
Health stats for:

STT, TTS, Bloom 560M response rate

Redis queue (contact sync jobs, async ledger processing)

LangChain orchestration performance

Retry logs and fallback stats (API failover cases)

2.10 User History & Privacy Controls
View chat history if enabled (per user setting)

Redact, delete, or anonymize logs on request (GDPR compliance)

2.11 Trial Conversion & Retention Tools
View trial conversion funnel

Add internal flags for promising users (beta testers, influencers)

Auto-trigger upgrade nudges on day 5 or based on engagement


3. Advanced Capabilities & Considerations
3.1 Feature Flags & A/B Testing
Enable/disable new features for certain segments

Track test group vs. control behavior

3.2 Impersonation Mode (Magic Link Access)
Log in as a user to replicate issues (read-only/limited mode)

3.3 Backup & Recovery View
Access logs of PostgreSQL and Redis backups

Trigger on-demand backups manually (admin-only)

3.4 Internationalization & Settings Control
Manage default app languages by country

Toggle feature availability by region

Update app-wide static content (e.g. FAQs, help links)

3.5 Compliance Dashboard
GDPR & CCPA flags

User data export requests

Deletion requests status


Conclusion This admin panel is designed to provide full oversight and control of Eindr's operational logic, user base, feature usage, AI systems, and data privacy compliance. It is structured to scale with the platform while supporting marketing, support, and data-driven decision-making across the organization.
