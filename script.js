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

// Modifica il grafico per rappresentare l'istogramma
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
            labels: bins.map((b, i) => i < bins.length - 1 ? `${b}-${bins[i + 1]}` : null).filter(Boolean),
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

// Aggiorna il listener del form per utilizzare l'istogramma
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

