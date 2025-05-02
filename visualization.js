document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.local.get('currentArticle', result => {
      const d = result.currentArticle;
      if (!d) return;

      const metrics = document.getElementById('metrics');
      metrics.innerHTML = `
        <div class="metric">
          <h2>Word Count</h2>
          <p class="value">${d.wordCount}</p>
          <p>Headline: ${d.headlineWordCount} words</p>
        </div>
        <div class="metric">
          <h2>Reading Time</h2>
          <p class="value">${d.readingTime} minutes</p>
        </div>
        <div class="metric">
          <h2>Images</h2>
          <p class="value">${d.imageCount}</p>
          <p>${d.images.length ? 'First image: ' + d.images[0].src : 'No images'}</p>
        </div>
        <div class="metric">
          <h2>Social Shares</h2>
          <p>Facebook: ${d.socialShares.facebook}</p>
          <p>Twitter: ${d.socialShares.twitter}</p>
        </div>
        <div class="metric">
          <h2>Categories</h2>
          <p>${d.categories.join(', ') || 'No categories'}</p>
        </div>
      `;
    });
  });
  