let samplingChart;
let varianceChart;

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

function calculateEmpiricalStats(data, corrected = false) {
    let mean = 0;
    let variance = 0;
    const n = data.length;

    // Calcolo della media empirica
    data.forEach((value) => {
        mean += value;
    });
    mean /= n;

    data.forEach((value) => {
        variance += Math.pow(value - mean, 2);
    });
    variance /= corrected ? (n - 1) : n;

    return { mean, variance };
}

function calculateTheoreticalMean(values, probabilities) {
    return values.reduce((sum, val, i) => sum + val * probabilities[i], 0);
}

function calculateTheoreticalVariance(values, probabilities, mean) {
    return values.reduce((sum, val, i) => sum + probabilities[i] * Math.pow(val - mean, 2), 0);
}

function generateSamplingVariances(values, probabilities, m, n) {
    const sampleVariances = [];
    for (let i = 0; i < m; i++) {
        const sample = generateEmpiricalData(values, probabilities, n);
        const sampleStats = calculateEmpiricalStats(sample, true); // Varianza corretta
        sampleVariances.push(sampleStats.variance);
    }
    return sampleVariances;
}

function calculateBins(data, binCount) {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const step = (max - min) / binCount;
    const bins = [];
    for (let i = 0; i <= binCount; i++) {
        bins.push(min + i * step);
    }
    return bins;
}

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

function plotVarianceHistogram(sampleVariances, bins) {
    const ctx = document.getElementById('varianceChart').getContext('2d');
    const frequencies = calculateBinnedFrequencies(sampleVariances, bins);

    if (varianceChart) {
        varianceChart.destroy();
    }

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

    const values = document.getElementById('values').value.split(',').map(v => parseFloat(v.trim()));
    const probabilities = document.getElementById('probabilities').value.split(',').map(p => parseFloat(p.trim()));

    const totalProbability = probabilities.reduce((sum, p) => sum + p, 0);
    if (Math.abs(totalProbability - 1) > 0.001) {
        alert('Theoretical probabilities must sum to 1. Please correct your input.');
        return;
    }

    const sampleSize = parseInt(document.getElementById('sampleSize').value, 10);
    const numberOfSamples = parseInt(document.getElementById('numberOfSamples').value, 10);

    const sampleVariances = generateSamplingVariances(values, probabilities, numberOfSamples, sampleSize);

    const binCount = 10; 
    const bins = calculateBins(sampleVariances, binCount);

    plotVarianceHistogram(sampleVariances, bins);

    const theoreticalMean = calculateTheoreticalMean(values, probabilities);
    const theoreticalVariance = calculateTheoreticalVariance(values, probabilities, theoreticalMean);
    const empiricalStats = calculateEmpiricalStats(sampleVariances);
    const empiricalMean = empiricalStats.mean.toFixed(3);
    const empiricalVariance = empiricalStats.variance.toFixed(3);

    document.getElementById('varianceStats').innerHTML = `
        <strong>Variance Distribution Statistics:</strong><br>
        <ul>
            <li>Empirical Mean of Sample Variances: ${empiricalMean}</li>
            <li>Theoretical Variance: ${theoreticalVariance.toFixed(3)}</li>
            <li>Empirical Variance of Sample Variances: ${empiricalVariance}</li>
        </ul>
    `;
});
