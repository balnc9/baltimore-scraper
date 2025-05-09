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

        // Collapsible sections functionality
        function initializeCollapsibleSections() {
                const sections = document.querySelectorAll('.collapsible');
                sections.forEach(section => {
                        const header = section.querySelector('.section-header');
                        const button = section.querySelector('.collapse-button');

                        // Set initial state
                        section.classList.add('collapsed');

                        // Toggle section on header click
                        header.addEventListener('click', (e) => {
                                if (e.target !== button) {
                                        section.classList.toggle('collapsed');
                                }
                        });

                        // Toggle section on button click
                        button.addEventListener('click', (e) => {
                                e.stopPropagation();
                                section.classList.toggle('collapsed');
                        });
                });
        }

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

        function findAuthor(data) {
                // Common author patterns in Baltimore Sun articles
                const authorPatterns = [
                        // Meta tags with improved selectors
                        () => {
                                const metaAuthor = document.querySelector('meta[name="author"], meta[property="article:author"], meta[property="og:author"], meta[name="twitter:creator"]');
                                return metaAuthor ? metaAuthor.getAttribute('content') : null;
                        },
                        // Common author elements with improved selectors
                        () => {
                                const authorSelectors = [
                                        '.author-name',
                                        '.byline',
                                        '[class*="author"]',
                                        '[class*="byline"]',
                                        '.article-meta__author',
                                        '.article__author',
                                        '.article-byline',
                                        '.byline__author',
                                        '.author-bio__name',
                                        '.author__name',
                                        '.article__byline',
                                        '.article-meta__byline',
                                        '.article-header__byline',
                                        '.article-header__author'
                                ];
                                for (const selector of authorSelectors) {
                                        const elements = document.querySelectorAll(selector);
                                        for (const element of elements) {
                                                const text = element.textContent.trim();
                                                if (text && !text.includes('undefined') && !text.includes('staff') && !text.includes('reporter')) {
                                                        return text.replace(/^by\s+/i, '').trim();
                                                }
                                        }
                                }
                                return null;
                        },
                        // Article text patterns with improved regex
                        () => {
                                if (!data.articleText) return null;

                                const patterns = [
                                        /by\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
                                        /Author:\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
                                        /Written by\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
                                        /Staff Writer\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
                                        /Contributor:\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
                                        /Reporter:\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
                                        /Correspondent:\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i
                                ];

                                // Look for author in first few paragraphs
                                const firstParagraphs = data.articleText.split('\n').slice(0, 3).join(' ');
                                for (const pattern of patterns) {
                                        const match = firstParagraphs.match(pattern);
                                        if (match && match[1]) {
                                                const author = match[1].trim();
                                                // Filter out common false positives
                                                if (!author.toLowerCase().includes('staff') &&
                                                        !author.toLowerCase().includes('reporter') &&
                                                        !author.toLowerCase().includes('contributor')) {
                                                        return author;
                                                }
                                        }
                                }
                                return null;
                        },
                        // URL pattern with improved handling
                        () => {
                                const url = window.location.href;
                                const authorMatch = url.match(/\/author\/([^\/]+)/i);
                                if (authorMatch) {
                                        const author = authorMatch[1]
                                                .split('-')
                                                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                                .join(' ');
                                        // Filter out common false positives
                                        if (!author.toLowerCase().includes('staff') &&
                                                !author.toLowerCase().includes('reporter')) {
                                                return author;
                                        }
                                }
                                return null;
                        }
                ];

                // Try each pattern in order
                for (const pattern of authorPatterns) {
                        const author = pattern();
                        if (author) {
                                // Clean up the author name
                                return author
                                        .replace(/^by\s+/i, '')
                                        .replace(/\s+/g, ' ')
                                        .replace(/[^\w\s-]/g, '')
                                        .replace(/\b(Staff|Reporter|Contributor)\b/gi, '')
                                        .trim();
                        }
                }

                return 'Unknown author';
        }

        async function findCategory(data) {
                if (!data.articleText) return 'Not specified';

                // Common news categories
                const categories = {
                        'News': ['news', 'breaking', 'update', 'report', 'latest'],
                        'Politics': ['politics', 'government', 'election', 'campaign', 'policy', 'congress', 'senate', 'house'],
                        'Business': ['business', 'economy', 'market', 'stock', 'finance', 'company', 'industry'],
                        'Sports': ['sports', 'game', 'team', 'player', 'coach', 'score', 'league'],
                        'Entertainment': ['entertainment', 'movie', 'music', 'celebrity', 'show', 'film', 'actor'],
                        'Technology': ['technology', 'tech', 'digital', 'software', 'computer', 'internet', 'online'],
                        'Health': ['health', 'medical', 'doctor', 'hospital', 'disease', 'treatment', 'patient'],
                        'Education': ['education', 'school', 'student', 'teacher', 'university', 'college', 'class'],
                        'Crime': ['crime', 'police', 'arrest', 'investigation', 'criminal', 'law', 'court'],
                        'Weather': ['weather', 'climate', 'forecast', 'temperature', 'storm', 'rain', 'snow']
                };

                // Get the first few paragraphs for analysis
                const text = data.articleText.split('\n').slice(0, 5).join(' ').toLowerCase();
                const title = (data.headline || '').toLowerCase();

                // Score each category based on keyword matches
                const scores = {};
                for (const [category, keywords] of Object.entries(categories)) {
                        let score = 0;
                        for (const keyword of keywords) {
                                // Count keyword occurrences in text and title
                                const textMatches = (text.match(new RegExp(`\\b${keyword}\\b`, 'g')) || []).length;
                                const titleMatches = (title.match(new RegExp(`\\b${keyword}\\b`, 'g')) || []).length;

                                // Weight title matches more heavily
                                score += textMatches + (titleMatches * 2);
                        }
                        scores[category] = score;
                }

                // Find the category with the highest score
                let maxScore = 0;
                let bestCategory = 'Not specified';
                for (const [category, score] of Object.entries(scores)) {
                        if (score > maxScore) {
                                maxScore = score;
                                bestCategory = category;
                        }
                }

                // If no strong category match was found, try to infer from URL
                if (maxScore === 0) {
                        const url = window.location.href.toLowerCase();
                        for (const [category, keywords] of Object.entries(categories)) {
                                for (const keyword of keywords) {
                                        if (url.includes(keyword)) {
                                                return category;
                                        }
                                }
                        }
                }

                return bestCategory;
        }

        try {
                loadingSpinner.classList.remove('hidden');
                const data = await loadArticleData();

                if (!data) {
                        throw new Error('No article data found. Please make sure you are on an article page and try again.');
                }

                // Update article metadata
                document.getElementById('article-title').textContent = data.headline || 'No title available';
                document.getElementById('article-author').textContent = findAuthor(data);
                document.getElementById('article-category').textContent = await findCategory(data);
                document.getElementById('article-date').textContent = data.datePublished || 'N/A';

                // Calculate additional metrics
                const articleText = data.articleText || '';
                const paragraphs = articleText.split('\n').filter(p => p.trim().length > 0);
                const words = articleText.split(/\s+/).filter(w => w.length > 0);
                const avgWordsPerParagraph = paragraphs.length > 0 ? (words.length / paragraphs.length).toFixed(1) : '0';
                const readingTime = Math.ceil(words.length / 200); // Assuming 200 words per minute reading speed

                // Update content analysis
                document.getElementById('word-count').textContent = words.length;
                document.getElementById('headline-word-count').textContent = (data.headline || '').split(/\s+/).length;
                document.getElementById('paragraph-count').textContent = paragraphs.length;
                document.getElementById('image-count').textContent = (data.images || []).length;
                document.getElementById('header-count').textContent = (data.headers || []).length;
                document.getElementById('avg-words-per-paragraph').textContent = avgWordsPerParagraph;
                document.getElementById('reading-time').textContent = readingTime;
                document.getElementById('link-count').textContent = (data.links || []).length;

                // Display images
                const imagesContainer = document.getElementById('images');
                const images = data.images || [];
                if (images.length > 0) {
                        // Create overlay for expanded images
                        const overlay = document.createElement('div');
                        overlay.className = 'image-overlay';
                        overlay.innerHTML = `
                                <div class="overlay-content">
                                        <img class="overlay-image" src="" alt="Expanded article image">
                                </div>
                        `;
                        document.body.appendChild(overlay);

                        // Add click handlers for overlay
                        const overlayImg = overlay.querySelector('.overlay-image');

                        overlay.onclick = () => {
                                overlay.classList.remove('active');
                                setTimeout(() => {
                                        overlay.style.display = 'none';
                                }, 300); // Match this with CSS transition duration
                        };

                        images.forEach(imageUrl => {
                                if (imageUrl) {
                                        const img = document.createElement('img');
                                        img.src = imageUrl;
                                        img.alt = 'Article image';
                                        img.loading = 'lazy';
                                        img.className = 'article-image';
                                        img.onclick = (e) => {
                                                e.stopPropagation();
                                                overlayImg.src = imageUrl;
                                                overlay.style.display = 'flex';
                                                // Force reflow
                                                overlay.offsetHeight;
                                                overlay.classList.add('active');
                                        };
                                        imagesContainer.appendChild(img);
                                }
                        });
                } else {
                        imagesContainer.innerHTML = '<p>No images found in the article.</p>';
                }

                // Initialize collapsible sections
                initializeCollapsibleSections();

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