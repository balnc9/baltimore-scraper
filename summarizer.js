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

        function generateSummary(text) {
                // Simple extractive summarization
                const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
                const words = text.toLowerCase().split(/\s+/);

                // Calculate word frequency
                const wordFreq = {};
                words.forEach(word => {
                        if (word.length > 3) { // Ignore short words
                                wordFreq[word] = (wordFreq[word] || 0) + 1;
                        }
                });

                // Score sentences based on word frequency
                const sentenceScores = sentences.map(sentence => {
                        const sentenceWords = sentence.toLowerCase().split(/\s+/);
                        const score = sentenceWords.reduce((sum, word) => sum + (wordFreq[word] || 0), 0);
                        return { sentence, score };
                });

                // Get top 3 sentences
                const topSentences = sentenceScores
                        .sort((a, b) => b.score - a.score)
                        .slice(0, 3)
                        .map(item => item.sentence.trim());

                return topSentences.join('. ') + '.';
        }

        function extractKeyPoints(text) {
                const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
                const keyPoints = sentences
                        .filter(sentence =>
                                sentence.length > 50 && // Longer sentences tend to be more informative
                                !sentence.includes('?') && // Avoid questions
                                sentence.split(' ').length > 8 // Avoid very short sentences
                        )
                        .slice(0, 5); // Get top 5 key points

                return keyPoints.map(point => point.trim());
        }

        try {
                loadingSpinner.classList.remove('hidden');
                const data = await loadArticleData();

                if (!data) {
                        throw new Error('No article data found. Please make sure you are on an article page and try again.');
                }

                // Update article metadata
                document.getElementById('article-title').textContent = data.headline;
                document.getElementById('article-author').textContent = `By ${data.author}`;
                document.getElementById('article-date').textContent = data.datePosted;

                // Generate and display summary
                const summary = generateSummary(data.articleText);
                document.getElementById('summary-text').textContent = summary;

                // Generate and display key points
                const keyPoints = extractKeyPoints(data.articleText);
                const keyPointsList = document.getElementById('key-points-list');
                keyPoints.forEach(point => {
                        const li = document.createElement('li');
                        li.textContent = point;
                        keyPointsList.appendChild(li);
                });

        } catch (error) {
                console.error('Error:', error);
                contentDiv.innerHTML = `
            <div class="error-message">
                <h2>Error Loading Data</h2>
                <p>${error.message}</p>
                <button onclick="window.location.reload()" class="primary-button">
                    Try Again
                </button>
            </div>
        `;
        } finally {
                loadingSpinner.classList.add('hidden');
        }
}); 