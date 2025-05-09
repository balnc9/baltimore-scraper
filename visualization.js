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
                                        resolve(result.currentArticle);
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

                // Word Count Chart
                const wordCountOptions = {
                        series: [{
                                name: 'Word Count',
                                data: [data.wordCount, data.headlineWordCount]
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
                                categories: ['Article Text', 'Headline'],
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
                                colors: ['#2563eb', '#3b82f6']
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

                // Create metadata histogram
                const metadataChartDiv = document.createElement('div');
                metadataChartDiv.className = 'chart-container';
                metadataChartDiv.innerHTML = '<div id="metadataChart"></div>';
                chartsContainer.appendChild(metadataChartDiv);

                // Metadata Distribution Chart
                const metadataOptions = {
                        series: [{
                                name: 'Count',
                                data: [data.imageCount, data.headerCount, data.headlineWordCount]
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
                                categories: ['Images', 'Headers', 'Headline Words'],
                                labels: {
                                        style: {
                                                colors: textColor
                                        }
                                }
                        },
                        yaxis: {
                                title: {
                                        text: 'Count',
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
                                colors: ['#10b981', '#f59e0b', '#ef4444']
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

                // Create image gallery
                if (data.images && data.images.length > 0) {
                        const gallerySection = document.createElement('section');
                        gallerySection.className = 'gallery-section';
                        gallerySection.innerHTML = `
                                <h2>Article Images</h2>
                                <div id="images" class="image-gallery"></div>
                        `;
                        contentDiv.appendChild(gallerySection);

                        const imagesContainer = document.getElementById('images');
                        data.images.forEach(url => {
                                const imgContainer = document.createElement('div');
                                imgContainer.className = 'image-container';
                                imgContainer.innerHTML = `<img src="${url}" alt="Article image">`;
                                imagesContainer.appendChild(imgContainer);
                        });
                }

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
