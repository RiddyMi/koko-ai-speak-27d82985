# Kòkọ Business AI

Project Title

Kòkọ AI – The Multilingual Voice Business Assistant for African Traders

Product Vision

Build a world-class AI-powered fintech web application designed specifically for informal businesses across Africa, beginning with Nigerian market women and small traders.

Unlike traditional bookkeeping software that requires typing and accounting knowledge, this platform enables users to manage their businesses entirely through natural voice conversations in English, Nigerian Pidgin, Yoruba, Hausa, Igbo, and code-switched speech (e.g., "Mo sell biscuits for five thousand").

The application should function as an intelligent business assistant—not merely a ledger—by automatically recording transactions, organizing financial records, generating insights, tracking inventory and debts, and answering business questions conversationally.

The long-term vision is to become the "AI CFO" for millions of African microbusinesses.

Design Philosophy

Create a premium, modern, intuitive interface that feels simple enough for first-time smartphone users while maintaining enterprise-grade scalability. The experience should prioritize large touch targets, minimal text entry, accessibility, multilingual support, and mobile-first responsiveness. The color palette should reflect trust, growth, and African vibrancy with clean typography and subtle animations.

Core Features

Authentication

 Phone number OTP authentication

 Google sign-in

 Business profile setup

 Preferred language selection

 Multiple business support per user

Voice Transactions

Prominent floating microphone button.

Users should be able to record transactions entirely by voice.

Examples include:

 "Sold biscuits for five thousand."

 "Mo ta biscuit ni ẹgbẹrun marun."

 "I sell rice two five."

 "Bought drinks for ten thousand."

 "Paid transport five hundred."

 "Mary collected rice on credit."

The AI should automatically classify each transaction as income, expense, inventory update, or credit sale and extract structured data such as amount, product, customer, quantity, payment method, and timestamp.

Transaction History

Provide searchable, filterable transaction history with editing, deletion, and export options. Support filters by product, category, customer, date, and transaction type.

Inventory

Automatically update inventory levels from voice-recorded purchases and sales. Notify users of low stock and suggest restocking based on sales velocity.

Expense Tracking

Categorize expenses automatically into rent, transport, utilities, salaries, inventory purchases, taxes, and miscellaneous. Display spending trends over time.

Credit Ledger

Track customers buying on credit, record repayments, show outstanding balances, and generate reminders.

AI Business Assistant

Allow users to ask natural language questions by voice or text, such as:

 How much did I sell today?

 What is my profit this month?

 Which product sells the most?

 Who owes me money?

 Compare this month with last month.

 Should I restock Indomie?

The assistant should answer using charts, summaries, and actionable recommendations.

Analytics Dashboard

Display key metrics including total revenue, expenses, profit, inventory value, outstanding debt, transaction count, average daily sales, best-selling products, and sales by category. Include daily, weekly, monthly, and yearly views with interactive charts.

Notifications

Daily reminders to record transactions, low-stock alerts, debt reminders, and monthly financial reports.

Offline Support

Build as a Progressive Web App with offline transaction capture and automatic synchronization when connectivity returns.

Accessibility

Support multilingual UI, voice-first navigation, large buttons, high contrast mode, and onboarding tutorials with audio guidance.

Technical Requirements

 React + TypeScript

 Tailwind CSS

 Shadcn UI

 Supabase Authentication

 Supabase Database

 Row Level Security

 Progressive Web App support

 Sahara API integration for multilingual speech recognition

 Modular architecture ready for benchmarking against Whisper and Google Speech APIs

 RESTful API layer for future mobile apps

 Clean component structure and scalable database schema

Database Entities

Design normalized tables for Users, Businesses, Products, Categories, Transactions, Expenses, Inventory, Customers, Credit Accounts, Repayments, Voice Sessions, AI Insights, Notifications, Languages, and Benchmark Results.

Future Roadmap

Architect the platform for future support of WhatsApp voice integration, POS device integration, bank account syncing, mobile money, invoice generation, tax reporting, cooperative savings groups, multilingual expansion across Africa, and AI-powered business coaching.

Deliverable

Generate a polished, production-ready, mobile-first application with beautiful UI/UX, reusable components, scalable architecture, realistic placeholder data, and a seamless voice-first experience that demonstrates how AI can empower African informal businesses through multilingual, code-switched interactions.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://koko-ai-speak.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/2df24f4c-3218-4811-9b38-3a2fa07b2daf).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
