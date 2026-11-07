let statusChartInstance = null;
let trendChartInstance = null;

async function renderCharts() {
    const animals = await db.animals.toArray();
    
    // Calculate stats for chart
    const available = animals.filter(a => a.status === 'Available').length;
    const review = animals.filter(a => a.status === 'Under Review').length;
    const adopted = animals.filter(a => a.status === 'Adopted').length;

    // 1. Doughnut Chart (Animal Status)
    const ctxStatus = document.getElementById('statusChart').getContext('2d');
    if(statusChartInstance) statusChartInstance.destroy();
    
    statusChartInstance = new Chart(ctxStatus, {
        type: 'doughnut',
        data: {
            labels: ['Available', 'Under Review', 'Adopted'],
            datasets: [{
                data: [available, review, adopted],
                backgroundColor: ['#10b981', '#f59e0b', '#3b82f6'],
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8 } }
            }
        }
    });

    // 2. Bar Chart (Trends)
    const ctxTrend = document.getElementById('trendChart').getContext('2d');
    if(trendChartInstance) trendChartInstance.destroy();

    trendChartInstance = new Chart(ctxTrend, {
        type: 'bar',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Adoptions',
                data: [5, 8, 12, 10, 15, 18],
                backgroundColor: '#0a5c4a',
                borderRadius: 6,
                barThickness: 30
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, grid: { borderDash: [4, 4], color: '#e5e7eb' } },
                x: { grid: { display: false } }
            }
        }
    });
}