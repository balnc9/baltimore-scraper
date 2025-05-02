document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.local.get('currentArticle', ({ currentArticle: d }) => {
      if (!d) return;
  
      // Counts toggle
      const countsSection = document.getElementById('counts');
      countsSection.innerHTML = ''; // clear existing
      const dlCounts = document.createElement('dl');
      [
        ['Word Count', d.wordCount],
        ['Headline Word Count', d.headlineWordCount],
        ['Image Count', d.imageCount],
        ['Header Count', d.headerCount]
      ].forEach(([label, value]) => {
        const dt = document.createElement('dt');
        dt.textContent = label;
        const dd = document.createElement('dd');
        dd.textContent = value;
        dlCounts.appendChild(dt);
        dlCounts.appendChild(dd);
      });
      countsSection.appendChild(dlCounts);
  
      const btnCounts = document.getElementById('toggleCounts');
      btnCounts.addEventListener('click', () => {
        const showing = countsSection.style.display === 'block';
        countsSection.style.display = showing ? 'none' : 'block';
        btnCounts.textContent = showing ? 'Show Counts' : 'Hide Counts';
      });
  
      // Images toggle
      const imagesSection = document.getElementById('images');
      imagesSection.innerHTML = ''; // clear existing
      if (d.images.length) {
        d.images.forEach(src => {
          const img = document.createElement('img');
          img.src = src;
          img.style.maxWidth = '100%';
          img.style.display = 'block';
          img.style.marginBottom = '12px';
          imagesSection.appendChild(img);
        });
      } else {
        imagesSection.textContent = 'No images found.';
      }
  
      const btnImages = document.getElementById('toggleImages');
      btnImages.addEventListener('click', () => {
        const showing = imagesSection.style.display === 'block';
        imagesSection.style.display = showing ? 'none' : 'block';
        btnImages.textContent = showing ? 'Show Images' : 'Hide Images';
      });
  
      // Metadata
      const metadataSection = document.getElementById('metadata');
      metadataSection.innerHTML = `
        <h2>Article Metadata</h2>
        <p><strong>URL:</strong> ${d.url}</p>
        <p><strong>Headline:</strong> ${d.headline}</p>
        <p><strong>Date Posted:</strong> ${d.datePosted}</p>
      `;
  
      // Article body
      document.getElementById('article').innerHTML = `
        <div style="
          padding: 20px;
          background: #f5f5f5;
          border-radius: 8px;
          margin: 20px 0;
          max-width: 800px;
          margin-left: auto;
          margin-right: auto;
          font-size: 16px;
          line-height: 1.6;
          color: #333;
          white-space: pre-wrap;
        ">
          ${d.articleText}
        </div>
      `;
    });
  });