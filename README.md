# SWT-Rebalancer (Perpetual Income Engine)

**[🔥 Click Here to View the Live Application](https://piuser-J.github.io/SWT-Rebalancer/rebalancer/)**

A high-performance, web-based Portfolio Rebalancing Tool engineered specifically to manage the **"Spend Without Thinking" (SWT) Portfolio**. The tool automates the math behind the 50/40/10 Bucket Architecture, calculating the precise minimum number of transactions required to rebalance the portfolio based on specific threshold rules.

## 🌟 Features

- **Bloomberg Terminal Aesthetic**: A highly professional, ultra-dark UI (`#000000` background) featuring high-contrast data visualization, monospace typography (`JetBrains Mono`), and live number formatting.
- **Automated Rebalancing Engine**:
  - **Rule A (Profit Taking)**: Automatically identifies funds exceeding a 5% absolute drift and calculates the precise sell amount to trim them down to their target weight.
  - **Rule B (Threshold Protection)**: Intelligently skips funds that remain within a **2% relative fluctuation** of their target value, preventing unnecessary frictional trading costs.
  - **Rule C (Redistribution)**: Dynamically calculates available purchasing power (Cash + Sell Proceeds) and redistributes it sequentially to under-allocated funds, prioritizing the poorest performers.
- **Dynamic Visualizations**: Utilizes `Chart.js` to render interactive "Before" and "After" Allocation Matrices.
- **Zero Dependencies**: Built entirely with Vanilla HTML5, JavaScript (ES6+), and Tailwind CSS (via CDN). No Node.js, Vite, or local server required.

## 🎯 Target Allocations (The 50/40/10 Split)

The engine enforces the following baseline architecture:

| Bucket | Asset | Ticker | Target Weight |
|--------|-------|--------|---------------|
| Liquidity | United SGD Fund CI A Dis SGD | `UOBSGDA SP` | 10% |
| Core Income | Amundi Funds Global Aggregate Bond | `AMUGLOA LX` | 20% |
| Core Income | PIMCO Income Fund Admin Ci Inc | `PIMINCA ID` | 20% |
| Growth | JPMorgan Global Income A (icdiv) | `JPMGLIA LX` | 20% |
| Growth | Lion-Phillip S-REIT ETF | `SREITS SP` | 20% |
| Growth | Amova Singapore STI ETF | `STIES SP` | 10% |

## 🚀 How to Run

Because this is a zero-dependency Single Page Application (SPA), getting it running takes literally one click:

1. Clone or download this repository.
2. Navigate to the `rebalancer` folder.
3. Double-click **`index.html`** to open it in your default web browser (Chrome, Edge, Firefox, etc.).

## 🛠️ Quality of Life (QOL) Controls

- **Live Number Formatting**: Inputs automatically format with commas (e.g., `42,000`) for easy reading.
- **CLR / RST**: Quick action buttons to clear all data or instantly reset the inputs to a perfectly balanced $400k baseline.
- **Telemetry Animations**: Execution results tick up dynamically like a live financial data feed.