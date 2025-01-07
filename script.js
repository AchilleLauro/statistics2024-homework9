// Variabile globale per il grafico delle medie e varianze campionarie
let samplingChart;
let varianceChart;

// Funzione per generare campioni empirici da una distribuzione teorica
function generateEmpiricalData(values, probabilities, sampleSize) {
    const empiricalData = [];
    for (let i = 0; i < sampleSize; i++) {
        const random = Math.random();
        let cumulativeProbability = 0;
        for (let j = 0; j < probabilities.length; j++) {
            cumulativeProbability += probabilities[j];
            if (random <= cumulativeProbability) {
                empiricalData.push(values[j]);
                break;
            }
        }
    }
    return empiricalData;
}

// Funzione per calcolare media e varianza dai dati simulati (empiriche)
function calculateEmpiricalStats(data, corrected = false) {
    let mean = 0;
    let variance = 0;
    const n = data.length;

    // Calcolo della media empirica
    data.forEach((value) => {
        mean += value;
    });
    mean /= n;

    // Calcolo della varianza empirica
    data.forEach((value) => {
        variance += Math.pow(value - mean, 2);
    });
    variance /= corrected ? (n - 1) : n;

    return { mean, variance };
}

// Funzione per calcolare la media teorica
function calculateTheoreticalMean(values, probabilities) {
    return values.reduce((sum, val, i) => sum + val * probabilities[i], 0);
}

// Funzione per calcolare la varianza teorica
function calculateTheoreticalVariance(values, probabilities, mean) {
    return values.reduce((sum, val, i) => sum + probabilities[i] * Math.pow(val - mean, 2), 0);
}

// Funzione per generare varianze campionarie
function generateSamplingVariances(values, probabilities, m, n) {
    const sampleVariances = [];
    for (let i = 0; i < m; i++) {
        const sample = generateEmpiricalData(values, probabilities, n);
        const sampleStats = calculateEmpiricalStats(sample, true); // Varianza corretta
        sampleVariances.push(sampleStats.variance);
    }
    return sampleVariances;
}

// Funzione per tracciare il grafico delle varianze campionarie
function plotVarianceDistribution(sampleVariances, theoreticalVariance) {
    const ctx = document.getElementById('varianceChart').getContext('2d');

    // Calcola media e varianza delle varianze campionarie
    const empiricalStats = calculateEmpiricalStats(sampleVariances);
    const empiricalMean = empiricalStats.mean.toFixed(3);
    const empiricalVariance = empiricalStats.variance.toFixed(3);

    // Mostra le statistiche nella UI
    document.getElementById('varianceStats').innerHTML = `
        <strong>Variance Distribution Statistics:</strong><br>
        <ul>
            <li>Empirical Mean of Sample Variances: ${empiricalMean}</li>
            <li>Theoretical Variance: ${theoreticalVariance.toFixed(3)}</li>
            <li>Empirical Variance of Sample Variances: ${empiricalVariance}</li>
        </ul>
    `;

    // Distruggi il grafico precedente, se esiste
    if (varianceChart) {
        varianceChart.destroy();
    }

    // Crea il nuovo grafico
    varianceChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sampleVariances,
            datasets: [
                {
                    label: 'Sample Variances',
                    data: sampleVariances,
                    backgroundColor: 'rgba(153, 102, 255, 0.7)',
                    borderColor: 'rgba(153, 102, 255, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Distribution of Sample Variances'
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Sample Variance'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Frequency'
                    }
                }
            }
        }
    });
}

// Event listener per il form modificato
document.getElementById('dataForm').addEventListener('submit', function (event) {
    event.preventDefault();

    // Leggi i valori e le probabilità inseriti
    const values = document.getElementById('values').value.split(',').map(v => parseFloat(v.trim()));
    const probabilities = document.getElementById('probabilities').value.split(',').map(p => parseFloat(p.trim()));

    // Controlla che le probabilità siano valide
    const totalProbability = probabilities.reduce((sum, p) => sum + p, 0);
    if (Math.abs(totalProbability - 1) > 0.001) {
        alert('Theoretical probabilities must sum to 1. Please correct your input.');
        return;
    }

    // Leggi il sample size e il numero di campioni
    const sampleSize = parseInt(document.getElementById('sampleSize').value, 10);
    const numberOfSamples = parseInt(document.getElementById('numberOfSamples').value, 10);

    // Genera le varianze campionarie
    const sampleVariances = generateSamplingVariances(values, probabilities, numberOfSamples, sampleSize);

    // Calcola le statistiche teoriche
    const theoreticalMean = calculateTheoreticalMean(values, probabilities);
    const theoreticalVariance = calculateTheoreticalVariance(values, probabilities, theoreticalMean);

    // Traccia il grafico delle varianze campionarie
    plotVarianceDistribution(sampleVariances, theoreticalVariance);
});
