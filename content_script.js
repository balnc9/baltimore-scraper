(async function () {
        function getWordCount(text) {
                const words = text.trim().split(/\s+/);
                return words.length;
        }

        function isValidImageUrl(url) {
                return url &&
                        !url.startsWith('data:') &&
                        !url.includes('pixel') &&
                        !url.includes('tracking') &&
                        !url.includes('analytics');
        }

        function getImageUrl(element) {
                // Try src attribute first
                let url = element.src;

                // Try data-src if src is not available
                if (!url) {
                        url = element.getAttribute('data-src');
                }

                // Try background-image style
                if (!url) {
                        const style = window.getComputedStyle(element);
                        const bgImage = style.backgroundImage;
                        if (bgImage && bgImage !== 'none') {
                                url = bgImage.replace(/^url\(['"](.+)['"]\)$/, '$1');
                        }
                }

                return url;
        }

        function getAllImages() {
                const images = new Set();

                // Get lead image
                const leadImage = document.querySelector('.leadart__image, .article__lead-image img, .article-header__image img');
                if (leadImage) {
                        const url = getImageUrl(leadImage);
                        if (isValidImageUrl(url)) images.add(url);
                }

                // Get article images
                const articleImages = document.querySelectorAll('.article-body img, .article__content img, .image__container img');
                articleImages.forEach(img => {
                        const url = getImageUrl(img);
                        if (isValidImageUrl(url)) images.add(url);
                });

                // Get figure images
                const figureImages = document.querySelectorAll('figure img');
                figureImages.forEach(img => {
                        const url = getImageUrl(img);
                        if (isValidImageUrl(url)) images.add(url);
                });

                return Array.from(images);
        }

        // Get headline with improved selectors
        const headlineSelectors = [
                '.headline.headline--default-left',
                '.article-header__headline',
                'h1.article-title',
                'h1[data-testid="headline"]',
                'h1.article__headline',
                'h1.article-headline',
                'h1.title',
                'h1',
                'article h1'
        ];

        let headlineEl = null;
        for (const selector of headlineSelectors) {
                headlineEl = document.querySelector(selector);
                if (headlineEl) break;
        }

        const headline = headlineEl?.innerText?.trim() || document.title || '';
        const headlineWordCount = headline ? getWordCount(headline) : 0;

        // Get article content
        const articleBody = document.querySelector('.article-body, .article__content, .article-content');
        const paragraphs = articleBody?.querySelectorAll('p[data-testid="text-container"], p.article__paragraph, .article-body p') || [];
        const articleText = Array.from(paragraphs)
                .map(p => p.innerText.trim())
                .filter(text => text.length > 0)
                .join(' ');
        const wordCount = getWordCount(articleText);

        // Count headers
        const headers = articleBody?.querySelectorAll('h2[data-testid="header-container"], h2.article__subheading, .article-body h2') || [];
        const headerCount = headers.length;

        // Get date
        const dateEl = document.querySelector('time.attribution-date__date, .article-header__date, .article-date');
        const datePosted = dateEl?.innerText.trim() || '';

        // Get all images
        const allImages = getAllImages();
        const imageCount = allImages.length;

        // Get article metadata
        const authorEl = document.querySelector('.attribution__author, .article-header__author, .article-author');
        const author = authorEl?.innerText.trim() || 'Unknown';

        const categoryEl = document.querySelector('.article-header__category, .article-category');
        const category = categoryEl?.innerText.trim() || 'Uncategorized';

        chrome.storage.local.set({
                currentArticle: {
                        url: location.href,
                        headline,
                        headlineWordCount,
                        wordCount,
                        datePosted,
                        images: allImages,
                        imageCount,
                        headerCount,
                        articleText,
                        author,
                        category,
                        timestamp: new Date().toISOString()
                }
        });
})();
