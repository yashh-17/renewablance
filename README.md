# 📦 SubsTracker (aka RenewLance)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](#license) [![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](#) [![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](#)

A modern, client-side subscription management and financial analytics SPA—helping individuals and small teams gain control over their recurring expenses.

---

## 🔍 Table of Contents

1. [About](#about)  
2. [Key Features](#key-features)  
3. [Tech Stack](#tech-stack)  
4. [Getting Started](#getting-started)  
   - [Prerequisites](#prerequisites)  
   - [Installation](#installation)  
   - [Run Locally](#run-locally)  
5. [Usage](#usage)  
6. [Project Structure](#project-structure)  
7. [Contributing](#contributing)  
8. [Future Roadmap](#future-roadmap)  
9. [License](#license)  

---

## 📝 About

SubsTracker (RenewLance) is a Single Page Application built with React, TypeScript, and Vite. It lets users:

- **Add / Edit / Delete** subscriptions  
- **Track** billing cycles (monthly, yearly, weekly)  
- Receive **smart alerts** & renewal reminders  
- View **financial analytics** (spending trends, category breakdowns)  
- Get **recommendations** for cost optimization  

All data lives in the browser via `localStorage`, enabling an entirely client-side experience that’s fast, offline-friendly, and privacy-first.

---

## 🚀 Key Features

- **Subscription Management**  
  - CRUD operations with status tracking (active, trial, cancelled)  
  - Automatic next-billing date calculation  
- **Smart Alerts & Notifications**  
  - Renewal reminders (7 / 14 / 30 days out)  
  - Under-utilization and duplicate-service warnings  
- **Analytics Dashboard**  
  - Bar, line, and pie charts (powered by Recharts)  
  - Budget vs. actual comparisons  
  - Category-wise expense breakdown  
- **Recommendations Engine**  
  - Cost-saving tips  
  - Consolidation suggestions  
- **Renewal Timeline**  
  - Visual, urgency-based timeline of upcoming charges  

---

## 🛠️ Tech Stack

- **Framework & Build**: React 18 · TypeScript · Vite  
- **UI & Styling**: TailwindCSS · Radix UI · Shadcn/UI  
- **State & Data**: React Hooks · TanStack Query · React Hook Form · Zod  
- **Charts & Animation**: Recharts · Framer Motion  
- **Icons & Assets**: Lucide React  
- **Persistence**: Browser `localStorage`  
- **Routing**: React Router DOM  

---

## 📥 Getting Started

### Prerequisites

- Node.js ≥ 18.x  
- npm or yarn  

### Installation

```bash
git clone https://github.com/your-username/substracker.git
cd substracker
npm install
# or
yarn install
