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
        ['Bullet Count', d.bulletCount]
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
      const md = document.getElementById('metadata');
      const dlMeta = document.createElement('dl');
      [
        ['URL', d.url],
        ['Date Posted', d.datePosted],
        ['Author', d.author || '—'],
        ['Keywords', d.keywords.length ? d.keywords.join(', ') : '—']
      ].forEach(([label, value]) => {
        const dt = document.createElement('dt');
        dt.textContent = label;
        const dd = document.createElement('dd');
        dd.textContent = value;
        dlMeta.appendChild(dt);
        dlMeta.appendChild(dd);
      });
      md.appendChild(dlMeta);
  
      // Article body
      document.getElementById('article').innerHTML = d.articleHTML;
    });
  });
  