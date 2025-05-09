document.addEventListener('DOMContentLoaded', async function () {
        const loadingSpinner = document.getElementById('loading');
        const contentDiv = document.getElementById('content');

        // Theme management
        function setTheme(theme) {
                document.documentElement.setAttribute('data-theme', theme);
                localStorage.setItem('theme', theme);
                updateThemeIcon(theme);
        }

        function updateThemeIcon(theme) {
                const icon = document.querySelector('.theme-toggle-icon');
                icon.textContent = theme === 'dark' ? '☀️' : '🌙';
        }

        // Initialize theme
        const savedTheme = localStorage.getItem('theme') || 'light';
        setTheme(savedTheme);

        // Theme toggle handler
        document.getElementById('themeToggle').addEventListener('click', () => {
                const currentTheme = document.documentElement.getAttribute('data-theme');
                const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
                setTheme(newTheme);
        });

        async function loadArticleData() {
                return new Promise((resolve, reject) => {
                        chrome.storage.local.get('currentArticle', result => {
                                if (chrome.runtime.lastError) {
                                        reject(chrome.runtime.lastError);
                                } else {
                                        const article = result.currentArticle;
                                        // Create metadata chart
                                        createArticleMetadataChart(article);
                                        resolve(article);
                                }
                        });
                });
        }

        function createChart(elementId, options) {
                const element = document.getElementById(elementId);
                if (!element) {
                        console.error(`Element with id ${elementId} not found`);
                        return null;
                }
                return new ApexCharts(element, options);
        }

        try {
                loadingSpinner.style.display = 'flex';
                contentDiv.style.display = 'none';

                // Create Article Metadata Chart
                function createArticleMetadataChart(data) {
                        // Ensure Chart is available
                        if (typeof Chart === 'undefined') {
                                console.error('Chart.js is not loaded');
                                return;
                        }

                        const ctx = document.getElementById('articleMetadataChart');
                        if (!ctx) {
                                console.error('Chart canvas not found');
                                return;
                        }

                        // Prepare chart data
                        const wordCount = data && data.articleText ? getWordCount(data.articleText) : 0;
                        const headlineWordCount = data && data.headline ? getWordCount(data.headline) : 0;
                        const imageCount = data && data.images ? data.images.length : 0;

                        // Create chart
                        new Chart(ctx.getContext('2d'), {
                                type: 'bar',
                                data: {
                                        labels: ['Word Count', 'Headline Word Count', 'Image Count'],
                                        datasets: [{
                                                label: 'Article Metadata',
                                                data: [wordCount, headlineWordCount, imageCount],
                                                backgroundColor: [
                                                        'rgba(75, 192, 192, 0.6)',  // Teal for Word Count
                                                        'rgba(255, 99, 132, 0.6)',  // Pink for Headline Word Count
                                                        'rgba(54, 162, 235, 0.6)'   // Blue for Image Count
                                                ],
                                                borderColor: [
                                                        'rgba(75, 192, 192, 1)',
                                                        'rgba(255, 99, 132, 1)',
                                                        'rgba(54, 162, 235, 1)'
                                                ],
                                                borderWidth: 1
                                        }]
                                },
                                options: {
                                        responsive: true,
                                        plugins: {
                                                title: {
                                                        display: true,
                                                        text: 'Article Metadata Overview',
                                                        font: {
                                                                size: 18
                                                        }
                                                },
                                                subtitle: {
                                                        display: true,
                                                        text: data.headline || 'No Headline',
                                                        font: {
                                                                size: 14,
                                                                style: 'italic'
                                                        }
                                                }
                                        },
                                        scales: {
                                                y: {
                                                        beginAtZero: true,
                                                        title: {
                                                                display: true,
                                                                text: 'Count'
                                                        }
                                                },
                                                x: {
                                                        title: {
                                                                display: true,
                                                                text: 'Metadata Categories'
                                                        }
                                                }
                                        }
                                }
                        });
                }

                // Utility function to get word count
                function getWordCount(text) {
                        if (!text) return 0;
                        const words = text.trim().split(/\s+/);
                        return words.length;
                }

                const data = await loadArticleData();

                if (!data) {
                        throw new Error('No article data found. Please make sure you are on an article page and try again.');
                }

                // Create metrics section
                const metricsSection = document.createElement('section');
                metricsSection.className = 'metrics-grid';

                const metrics = [
                        { label: 'Word Count', value: data.wordCount },
                        { label: 'Images', value: data.imageCount },
                        { label: 'Headers', value: data.headerCount },
                        { label: 'Headline Words', value: data.headlineWordCount }
                ];

                metrics.forEach(metric => {
                        const metricDiv = document.createElement('div');
                        metricDiv.className = 'metric-card';
                        metricDiv.innerHTML = `
                                <h3>${metric.label}</h3>
                                <p class="metric-value">${metric.value}</p>
                        `;
                        metricsSection.appendChild(metricDiv);
                });

                contentDiv.appendChild(metricsSection);

                // Create charts container
                const chartsContainer = document.createElement('div');
                chartsContainer.className = 'charts-container';
                contentDiv.appendChild(chartsContainer);

                // Create word count distribution chart
                const wordCountChartDiv = document.createElement('div');
                wordCountChartDiv.className = 'chart-container';
                wordCountChartDiv.innerHTML = '<div id="wordCountChart"></div>';
                chartsContainer.appendChild(wordCountChartDiv);

                const isDark = savedTheme === 'dark';
                const textColor = isDark ? '#f1f5f9' : '#1e293b';
                const gridColor = isDark ? '#334155' : '#e2e8f0';

                // Create metadata chart options
                const metadataOptions = {
                        series: [{
                                name: 'Count',
                                data: [
                                        data.images ? data.images.length : 0,
                                        data.headers ? data.headers.length : 0,
                                        data.headline ? data.headline.split(/\s+/).filter(word => word.length > 0).length : 0,
                                        data.articleText ? data.articleText.split(/\n/).filter(p => p.trim().length > 0).length : 0,
                                        data.links ? data.links.length : 0
                                ]
                        }],
                        chart: {
                                type: 'bar',
                                height: 350,
                                toolbar: {
                                        show: false
                                },
                                background: 'transparent',
                                animations: {
                                        enabled: false
                                }
                        },
                        plotOptions: {
                                bar: {
                                        horizontal: false,
                                        columnWidth: '55%',
                                        borderRadius: 4,
                                        distributed: true
                                },
                        },
                        dataLabels: {
                                enabled: false
                        },
                        stroke: {
                                show: true,
                                width: 2,
                                colors: ['transparent']
                        },
                        xaxis: {
                                categories: [
                                        'Images',
                                        'Headers',
                                        'Headline',
                                        'Paragraphs',
                                        'Links'
                                ],
                                labels: {
                                        style: {
                                                colors: textColor,
                                                fontSize: '12px'
                                        },
                                        rotate: -45,
                                        rotateAlways: false,
                                        hideOverlappingLabels: false
                                },
                                axisBorder: {
                                        show: true,
                                        color: gridColor
                                },
                                axisTicks: {
                                        show: true,
                                        color: gridColor
                                },
                                title: {
                                        text: 'Metrics',
                                        style: {
                                                color: textColor,
                                                fontSize: '14px'
                                        }
                                }
                        },
                        yaxis: {
                                title: {
                                        text: 'Count',
                                        style: {
                                                color: textColor,
                                                fontSize: '14px'
                                        }
                                },
                                labels: {
                                        style: {
                                                colors: textColor,
                                                fontSize: '12px'
                                        }
                                },
                                axisBorder: {
                                        show: true,
                                        color: gridColor
                                },
                                axisTicks: {
                                        show: true,
                                        color: gridColor
                                },
                                forceNiceScale: true,
                                min: 0
                        },
                        fill: {
                                opacity: 1,
                                colors: ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6']
                        },
                        grid: {
                                borderColor: gridColor,
                                strokeDashArray: 4,
                                xaxis: {
                                        lines: {
                                                show: true
                                        }
                                },
                                yaxis: {
                                        lines: {
                                                show: true
                                        }
                                },
                                padding: {
                                        top: 0,
                                        right: 0,
                                        bottom: 0,
                                        left: 0
                                }
                        },
                        theme: {
                                mode: isDark ? 'dark' : 'light'
                        },
                        tooltip: {
                                enabled: true,
                                theme: isDark ? 'dark' : 'light'
                        }
                };

                // Create word count chart options
                const wordCountOptions = {
                        series: [{
                                name: 'Words',
                                data: [
                                        data.articleText ? data.articleText.split(/\s+/).filter(word => word.length > 0).length : 0
                                ]
                        }],
                        chart: {
                                type: 'bar',
                                height: 350,
                                toolbar: {
                                        show: false
                                },
                                background: 'transparent'
                        },
                        plotOptions: {
                                bar: {
                                        horizontal: false,
                                        columnWidth: '55%',
                                        borderRadius: 4
                                },
                        },
                        dataLabels: {
                                enabled: false
                        },
                        stroke: {
                                show: true,
                                width: 2,
                                colors: ['transparent']
                        },
                        xaxis: {
                                categories: ['Article Text'],
                                labels: {
                                        style: {
                                                colors: textColor
                                        }
                                }
                        },
                        yaxis: {
                                title: {
                                        text: 'Words',
                                        style: {
                                                color: textColor
                                        }
                                },
                                labels: {
                                        style: {
                                                colors: textColor
                                        }
                                }
                        },
                        fill: {
                                opacity: 1,
                                colors: ['#2563eb']
                        },
                        grid: {
                                borderColor: gridColor,
                                strokeDashArray: 4,
                                xaxis: {
                                        lines: {
                                                show: true
                                        }
                                }
                        },
                        theme: {
                                mode: isDark ? 'dark' : 'light'
                        }
                };

                // Create charts after DOM is ready
                setTimeout(() => {
                        const wordCountChart = createChart('wordCountChart', wordCountOptions);
                        const metadataChart = createChart('metadataChart', metadataOptions);

                        if (wordCountChart) wordCountChart.render();
                        if (metadataChart) metadataChart.render();
                }, 100);

                // Show content and hide loading spinner
                loadingSpinner.style.display = 'none';
                contentDiv.style.display = 'block';

        } catch (error) {
                console.error('Error loading article data:', error);
                loadingSpinner.style.display = 'none';
                contentDiv.innerHTML = `
                        <div class="error-message">
                                <h2>Error</h2>
                                <p>${error.message}</p>
                        </div>
                `;
                contentDiv.style.display = 'block';
        }
});
