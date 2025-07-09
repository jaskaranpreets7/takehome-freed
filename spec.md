# FDA Adverse Event Insights Dashboard — Spec.md

## Problem Statement

Healthcare professionals rely on accurate, timely drug safety data to make informed decisions. This project aims to build an interactive dashboard that analyzes drug-related adverse event reports using the FDA’s publicly available APIs. It will surface actionable insights such as event seriousness, manufacturer trends, and adverse event timelines for individual drugs.

---

## Core Features

- **Search & Filter Interface**

  - Search by **Drug Name**
  - Filter by:
    - **Pharmacological Class**
    - **Administration Route**
    - **Adverse Event Seriousness** (`Death`, `Hospitalization`, `Life-threatening`)

- **Adverse Event Summary Cards**

  - Display results in card format showing:
    - Drug Name
    - Total Adverse Events Reported
    - Number of Serious Events based on selected seriousness categories
    - Available Administration Routes
    - Pharmacological Class
  - Clickable cards to navigate to a detailed drug analytics page

- **Manufacturer Data Analysis**

  - Ranked list of manufacturers with the highest number of adverse event reports for a selected drug
  - Displayed in a sortable, searchable list view

- **Adverse Event Time Trend Visualization**

  - Time-series chart visualizing trends of adverse events over time (monthly/yearly) for a selected drug

- **Advanced Filtering**
  - Combine multiple filters (drug name, pharmacological class, route, seriousness)
  - Real-time data fetching and caching using React Query

---

## Tech Stack

- **Framework:** Next.js
- **UI:** Shadcn UI, Tailwind CSS
- **Data Fetching & Caching:** React Query
- **Data Visualization:** Recharts
- **APIs:**
  - [OpenFDA Adverse Event Reports API](https://api.fda.gov/drug/event.json)
  - [OpenFDA Drugs@FDA Database API](https://api.fda.gov/drug/drugsfda.json)

---

## APIs Used

- **Adverse Event Reports API**

  - Endpoint: `https://api.fda.gov/drug/event.json`
  - Filters:
    - `seriousnessdeath`
    - `seriousnesshospitalization`
    - `drug.drugname`
    - `receivedate`
    - `patient.drug.drugcharacterization`

- **Drugs@FDA Database API**
  - Endpoint: `https://api.fda.gov/drug/drugsfda.json`
  - Filters:
    - `products.active_ingredients.name`
    - `products.route`
    - `products.pharm_class_epc`

---

## User Flow

1. **Home Dashboard**

   - Search bar for drug name
   - Filters for:
     - Pharmacological Class
     - Administration Route
     - Seriousness (checkboxes)
   - Display drug cards summarizing adverse event data
   - Click a card to navigate to the detailed analytics page

2. **Drug Detail Page**
   - Manufacturer Ranking (list/table view)
   - Adverse Event Trend over time (Chart.js time-series)

---

## Data Visualizations

- **Adverse Events Over Time (Line/Bar Chart)**

  - X-axis: Month/Year
  - Y-axis: Number of Reports

- **Manufacturer Ranking (Table)**
  - Columns: Manufacturer Name | Number of Reports

---

## Additional Notes

- Support pagination for large result sets (via `limit` & `skip` API params)
- Implement error handling and loading states
- Use skeleton loaders during data fetches
- Include React Query Devtools for development
- Maintain consistent theming with Tailwind CSS and Shadcn components

---

## Deliverables

- Next.js project repository
- Implemented UI components and navigation flows
- Data fetching and caching with React Query
- Chart.js data visualizations
- README with setup instructions
