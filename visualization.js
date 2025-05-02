document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.local.get('currentArticle', result => {
      const d = result.currentArticle;
      if (!d) return;
  
      const ctx = document.getElementById('wordChart').getContext('2d');
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Article Body', 'Headline'],
          datasets: [{
            label: 'Word Count',
            data: [d.wordCount, d.headlineWordCount]
          }]
        }
      });
    });
  });
  