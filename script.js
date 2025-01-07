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

// Funzione per raggruppare i dati in intervalli (binning)
function calculateBinnedFrequencies(data, bins) {
    const frequencies = Array(bins.length - 1).fill(0);
    data.forEach(value => {
        for (let i = 0; i < bins.length - 1; i++) {
            if (value >= bins[i] && value < bins[i + 1]) {
                frequencies[i]++;
                break;
            }
        }
    });
    return frequencies;
}

// Funzione per tracciare l'istogramma delle varianze campionarie
function plotVarianceHistogram(sampleVariances, bins) {
    const ctx = document.getElementById('varianceChart').getContext('2d');
    const frequencies = calculateBinnedFrequencies(sampleVariances, bins);

    // Distruggi il grafico precedente, se esiste
    if (varianceChart) {
        varianceChart.destroy();
    }

    // Crea l'istogramma
    varianceChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: bins.map((b, i) => i < bins.length - 1 ? `${b.toFixed(2)} - ${bins[i + 1].toFixed(2)}` : null).filter(Boolean),
            datasets: [
                {
                    label: 'Frequency of Sample Variances',
                    data: frequencies,
                    backgroundColor: 'rgba(255, 99, 132, 0.7)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Histogram of Sample Variances'
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Variance Range'
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

    // Definisci gli intervalli (bins) per l'istogramma
    const bins = [0, 0.2, 0.4, 0.6, 0.8, 1.0, 1.2, 1.4, 1.6, 1.8, 2.0];

    // Traccia l'istogramma delle varianze campionarie
    plotVarianceHistogram(sampleVariances, bins);
});
