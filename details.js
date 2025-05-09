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
                        // Meta tags
                        () => {
                                const metaAuthor = document.querySelector('meta[name="author"], meta[property="article:author"]');
                                return metaAuthor ? metaAuthor.getAttribute('content') : null;
                        },
                        // Common author elements
                        () => {
                                const authorSelectors = [
                                        '.author-name',
                                        '.byline',
                                        '[class*="author"]',
                                        '[class*="byline"]',
                                        '.article-meta__author',
                                        '.article__author',
                                        '.article-byline',
                                        '.byline__author'
                                ];
                                for (const selector of authorSelectors) {
                                        const element = document.querySelector(selector);
                                        if (element) {
                                                const text = element.textContent.trim();
                                                if (text && !text.includes('undefined')) {
                                                        return text.replace(/^by\s+/i, '').trim();
                                                }
                                        }
                                }
                                return null;
                        },
                        // Article text patterns
                        () => {
                                if (!data.articleText) return null;

                                // Common patterns in Baltimore Sun articles
                                const patterns = [
                                        /by\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
                                        /Author:\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
                                        /Written by\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
                                        /Staff Writer\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i
                                ];

                                for (const pattern of patterns) {
                                        const match = data.articleText.match(pattern);
                                        if (match && match[1]) {
                                                return match[1].trim();
                                        }
                                }
                                return null;
                        },
                        // URL pattern (sometimes author is in URL)
                        () => {
                                const url = window.location.href;
                                const authorMatch = url.match(/\/author\/([^\/]+)/i);
                                if (authorMatch) {
                                        return authorMatch[1]
                                                .split('-')
                                                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                                .join(' ');
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
                                        .trim();
                        }
                }

                return 'Unknown author';
        }

        function findCategory(data) {
                // Common category patterns in Baltimore Sun articles
                const categoryPatterns = [
                        // Meta tags
                        () => {
                                const metaCategory = document.querySelector('meta[property="article:section"], meta[name="category"]');
                                return metaCategory ? metaCategory.getAttribute('content') : null;
                        },
                        // Common category elements
                        () => {
                                const categorySelectors = [
                                        '.category',
                                        '.section',
                                        '.article-category',
                                        '.article-section',
                                        '[class*="category"]',
                                        '[class*="section"]',
                                        '.article-meta__category',
                                        '.article__category'
                                ];
                                for (const selector of categorySelectors) {
                                        const element = document.querySelector(selector);
                                        if (element) {
                                                const text = element.textContent.trim();
                                                if (text && !text.includes('undefined')) {
                                                        return text;
                                                }
                                        }
                                }
                                return null;
                        },
                        // URL pattern
                        () => {
                                const url = window.location.href;
                                const urlParts = url.split('/');

                                // Common category paths in Baltimore Sun
                                const categoryPaths = [
                                        '/news/',
                                        '/sports/',
                                        '/business/',
                                        '/entertainment/',
                                        '/lifestyle/',
                                        '/opinion/',
                                        '/politics/'
                                ];

                                // Check for category in URL path
                                for (const path of categoryPaths) {
                                        if (url.includes(path)) {
                                                return path.replace(/\//g, '').charAt(0).toUpperCase() +
                                                        path.replace(/\//g, '').slice(1);
                                        }
                                }

                                // Try to extract from URL structure
                                const possibleCategory = urlParts[urlParts.length - 2];
                                if (possibleCategory && !possibleCategory.includes('.') &&
                                        !['www', 'baltimoresun', 'com'].includes(possibleCategory)) {
                                        return possibleCategory
                                                .split('-')
                                                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                                .join(' ');
                                }
                                return null;
                        },
                        // Article text patterns
                        () => {
                                if (!data.articleText) return null;

                                const categoryPatterns = [
                                        /Category:\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
                                        /Section:\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i
                                ];

                                for (const pattern of categoryPatterns) {
                                        const match = data.articleText.match(pattern);
                                        if (match && match[1]) {
                                                return match[1].trim();
                                        }
                                }
                                return null;
                        }
                ];

                // Try each pattern in order
                for (const pattern of categoryPatterns) {
                        const category = pattern();
                        if (category) {
                                // Clean up the category name
                                return category
                                        .replace(/\s+/g, ' ')
                                        .replace(/[^\w\s-]/g, '')
                                        .trim();
                        }
                }

                return 'Not specified';
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
                document.getElementById('article-category').textContent = findCategory(data);
                document.getElementById('article-date').textContent = data.datePosted || 'Date not available';

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