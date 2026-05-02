const FUNDS = [
    { id: 'united', name: 'United SGD Fund CI A Dis SGD', ticker: 'UOBSGDA SP', target: 0.10, color: '#00ffff' },
    { id: 'amundi', name: 'Amundi Funds Global Aggregate Bond', ticker: 'AMUGLOA LX', target: 0.20, color: '#ff9900' },
    { id: 'pimco', name: 'PIMCO Income Fund Admin Ci Inc', ticker: 'PIMINCA ID', target: 0.20, color: '#ff33ff' },
    { id: 'jpm', name: 'JPMorgan Global Income A (icdiv)', ticker: 'JPMGLIA LX', target: 0.20, color: '#33cc33' },
    { id: 'reit', name: 'Lion-Phillip S-REIT ETF', ticker: 'SREITS SP', target: 0.20, color: '#ffff00' },
    { id: 'sti', name: 'Amova Singapore STI ETF', ticker: 'STIES SP', target: 0.10, color: '#ff3333' }
];

const DEFAULT_VALS = {
    'united': 42000,
    'amundi': 78000,
    'pimco': 82000,
    'jpm': 76000,
    'reit': 85000,
    'sti': 42000
};

let beforeChart = null;
let afterChart = null;
let currentTab = 'before';

// Number Formatting utility
const fmt = new Intl.NumberFormat('en-US');
const parseNum = (str) => parseFloat(str.replace(/,/g, '')) || 0;

document.addEventListener('DOMContentLoaded', () => {
    // Clock
    setInterval(() => {
        const d = new Date();
        document.getElementById('clock').innerText = d.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
    }, 1000);
    const d = new Date();
    document.getElementById('clock').innerText = d.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';

    const inputsContainer = document.getElementById('inputs-container');
    
    FUNDS.forEach(fund => {
        const div = document.createElement('div');
        div.innerHTML = `
            <div class="flex justify-between items-center mb-1">
                <label class="text-[10px] font-bold text-bbg-muted uppercase tracking-wider cursor-help" title="${fund.name}">
                    ${fund.ticker}
                </label>
                <span class="text-[9px] px-1 bg-bbg-border text-white rounded font-mono">TGT: ${(fund.target*100).toFixed(0)}%</span>
            </div>
            <div class="relative">
                <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-bbg-muted font-mono text-sm">$</span>
                <input type="text" inputmode="numeric" id="val-${fund.id}" value="${fmt.format(DEFAULT_VALS[fund.id])}" class="bbg-input font-mono w-full rounded py-1.5 pl-7 pr-3 text-right text-lg">
            </div>
        `;
        inputsContainer.appendChild(div);
    });

    // Formatting event listeners
    document.querySelectorAll('input[type="text"]').forEach(input => {
        input.addEventListener('blur', (e) => {
            const val = parseNum(e.target.value);
            e.target.value = val === 0 ? '' : fmt.format(val);
        });
        input.addEventListener('focus', (e) => {
            if(e.target.value === '0') e.target.value = '';
        });
    });

    document.getElementById('calc-btn').addEventListener('click', calculateRebalance);
    document.getElementById('btn-clear').addEventListener('click', () => {
        document.querySelectorAll('input[type="text"]').forEach(input => input.value = '');
    });
    document.getElementById('btn-reset').addEventListener('click', () => {
        FUNDS.forEach(fund => {
            document.getElementById(`val-${fund.id}`).value = fmt.format(400000 * fund.target);
        });
        document.getElementById('input-cash').value = '0';
    });

    // Tabs
    document.getElementById('tab-before').addEventListener('click', () => switchTab('before'));
    document.getElementById('tab-after').addEventListener('click', () => switchTab('after'));
});

function switchTab(tab) {
    currentTab = tab;
    const btnB = document.getElementById('tab-before');
    const btnA = document.getElementById('tab-after');
    const contB = document.getElementById('chart-container-before');
    const contA = document.getElementById('chart-container-after');

    if(tab === 'before') {
        btnB.className = "text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded bg-bbg-border text-white transition-colors";
        btnA.className = "text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded text-bbg-muted hover:bg-bbg-border/50 transition-colors";
        contB.style.opacity = '1';
        contB.style.pointerEvents = 'auto';
        contA.style.opacity = '0';
        contA.style.pointerEvents = 'none';
    } else {
        btnA.className = "text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded bg-bbg-border text-white transition-colors";
        btnB.className = "text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded text-bbg-muted hover:bg-bbg-border/50 transition-colors";
        contA.style.opacity = '1';
        contA.style.pointerEvents = 'auto';
        contB.style.opacity = '0';
        contB.style.pointerEvents = 'none';
    }
}

function calculateRebalance() {
    let totalValue = parseNum(document.getElementById('input-cash').value);
    const cashInput = totalValue;
    const currentValues = {};

    FUNDS.forEach(f => {
        const val = parseNum(document.getElementById(`val-${f.id}`).value);
        currentValues[f.id] = val;
        totalValue += val;
    });

    if (totalValue <= 0) return;

    // Rule A: Profit Taking
    let proceeds = cashInput;
    let transactions = [];
    const simulatedValues = { ...currentValues };
    const analysis = [];

    FUNDS.forEach(f => {
        const currentWeight = currentValues[f.id] / totalValue;
        const targetValue = f.target * totalValue;
        
        // Rule A: if weightage exceeded 5% of overall portfolio
        if (currentWeight > f.target + 0.05) {
            const amount = currentValues[f.id] - targetValue;
            proceeds += amount;
            simulatedValues[f.id] -= amount;
            transactions.push({ action: 'SELL', fund: f.ticker, name: f.name, amount: amount });
        }
        
        analysis.push({
            ...f,
            currentWeight,
            targetValue,
            currentValue: currentValues[f.id]
        });
    });

    // Rule C: Redistribution
    const buyCandidates = analysis.filter(f => {
        const currentWeight = currentValues[f.id] / totalValue;
        const relativeFluctuation = Math.abs(currentWeight - f.target) / f.target;
        
        // Rule B: if a fund's P&L is within a 2% relative fluctuation of its weight, do not trigger
        if (currentWeight < f.target && relativeFluctuation > 0.02) {
            return true;
        }
        return false;
    });

    // Sort by poorest performer (largest negative gap from target)
    buyCandidates.sort((a, b) => {
        const gapA = a.currentWeight - a.target; 
        const gapB = b.currentWeight - b.target; 
        return gapA - gapB; 
    });

    for (let f of buyCandidates) {
        if (proceeds <= 0) break;
        const targetVal = f.target * totalValue;
        const needed = targetVal - simulatedValues[f.id];
        
        if (needed > 0) {
            const buyAmount = Math.min(proceeds, needed);
            proceeds -= buyAmount;
            simulatedValues[f.id] += buyAmount;
            transactions.push({ action: 'BUY', fund: f.ticker, name: f.name, amount: buyAmount });
        }
    }

    updateUI(totalValue, transactions, currentValues, simulatedValues);
}

// Animation function for counting numbers
function animateValue(obj, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const current = start + progress * (end - start);
        if(obj.id === 'stat-total-value' || obj.id === 'stat-volume') {
            obj.innerHTML = `$${fmt.format(current.toFixed(0))}`;
        } else {
            obj.innerHTML = Math.floor(current);
        }
        if (progress < 1) {
            window.requestAnimationFrame(step);
        } else {
            // Ensure exact final value
            if(obj.id === 'stat-total-value' || obj.id === 'stat-volume') {
                obj.innerHTML = `$${fmt.format(end.toFixed(0))}`;
            } else {
                obj.innerHTML = end;
            }
        }
    };
    window.requestAnimationFrame(step);
}

function updateUI(totalValue, transactions, currentValues, simulatedValues) {
    // Hide empty state
    document.getElementById('empty-state').style.opacity = '0';
    setTimeout(() => document.getElementById('empty-state').style.display = 'none', 300);

    // Calculate execution volume
    const execVolume = transactions.reduce((acc, t) => acc + t.amount, 0);

    // Update Stats with animations
    animateValue(document.getElementById('stat-total-value'), 0, totalValue, 600);
    animateValue(document.getElementById('stat-trades'), 0, transactions.length, 600);
    animateValue(document.getElementById('stat-volume'), 0, execVolume, 600);
    
    const statusEl = document.getElementById('stat-status');
    statusEl.innerText = transactions.length > 0 ? 'EXECUTION REQ' : 'OPTIMAL';
    statusEl.className = transactions.length > 0 ? 'text-xl font-mono text-bbg-orange tracking-widest mt-1' : 'text-xl font-mono text-bbg-green tracking-widest mt-1';

    // Build Table
    const tbody = document.getElementById('transactions-body');
    tbody.innerHTML = '';
    
    if (transactions.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3" class="p-8 text-center text-bbg-muted font-sans text-[10px] uppercase tracking-widest">NO EXECUTION REQUIRED.<br>PORTFOLIO VARIANCE WITHIN TOLERANCE.</td></tr>`;
    } else {
        transactions.forEach((t, i) => {
            const isBuy = t.action === 'BUY';
            const textClass = isBuy ? 'text-bbg-green' : 'text-bbg-red';
            const tr = document.createElement('tr');
            tr.className = `opacity-0 animate-fade-in hover:bg-bbg-border/30 transition-colors`;
            tr.style.animationDelay = `${i * 0.05}s`;
            tr.innerHTML = `
                <td class="p-4">
                    <span class="${textClass} font-bold">${t.action}</span>
                </td>
                <td class="p-4 text-white" title="${t.name}">${t.fund}</td>
                <td class="p-4 text-right ${textClass}">$${fmt.format(t.amount.toFixed(2))}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    // Switch to 'after' tab automatically if trades happened
    if(transactions.length > 0) {
        switchTab('after');
    }

    // Render Charts
    renderCharts(currentValues, simulatedValues);
}

function renderCharts(currentData, afterData) {
    Chart.defaults.color = '#737373';
    Chart.defaults.font.family = "'JetBrains Mono', monospace";
    
    const labels = FUNDS.map(f => f.ticker);
    const bgColors = FUNDS.map(f => f.color);

    const beforeDataArr = FUNDS.map(f => currentData[f.id]);
    const afterDataArr = FUNDS.map(f => afterData[f.id]);

    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { 
                position: 'right',
                labels: {
                    color: '#e5e5e5',
                    usePointStyle: true,
                    pointStyle: 'rect',
                    padding: 20,
                    font: { size: 11 }
                }
            },
            tooltip: {
                backgroundColor: 'rgba(10, 10, 10, 0.95)',
                titleColor: '#fff',
                bodyColor: '#ff9900',
                borderColor: '#262626',
                borderWidth: 1,
                padding: 12,
                displayColors: false,
                callbacks: {
                    label: function(context) {
                        const val = context.raw;
                        const total = context.dataset.data.reduce((a,b) => a+b, 0);
                        const pct = ((val/total)*100).toFixed(1);
                        return `Val: $${fmt.format(val)} [${pct}%]`;
                    }
                }
            }
        },
        borderWidth: 1,
        borderColor: '#000000',
        cutout: '75%',
        animation: {
            duration: 800,
            easing: 'easeOutQuart'
        }
    };

    if (beforeChart) beforeChart.destroy();
    beforeChart = new Chart(document.getElementById('chart-before'), {
        type: 'doughnut',
        data: { labels, datasets: [{ data: beforeDataArr, backgroundColor: bgColors }] },
        options: commonOptions
    });

    if (afterChart) afterChart.destroy();
    afterChart = new Chart(document.getElementById('chart-after'), {
        type: 'doughnut',
        data: { labels, datasets: [{ data: afterDataArr, backgroundColor: bgColors }] },
        options: commonOptions
    });
}
