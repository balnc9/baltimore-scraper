(async function(){
    function getWordCount(text){ return text.trim().split(/\s+/).length; }
  
    const headlineEl = document.querySelector('h1');
    const headline = headlineEl?.innerText || '';
    const headlineWordCount = headline ? getWordCount(headline) : 0;
  
    // broaden selector to catch main/article container
    const articleEl =
      document.querySelector('article') ||
      document.querySelector('main') ||
      document.body;
    const articleText = articleEl?.innerText || '';
    const wordCount = getWordCount(articleText);
  
    const dateEl = document.querySelector('time');
    const datePosted = dateEl?.getAttribute('datetime') || dateEl?.innerText || '';
  
    const authorMeta = document.querySelector('meta[name="author"]')?.content;
    const authorEl = document.querySelector('.author, .byline')?.innerText;
    const author = authorMeta || authorEl || '';
  
    // grab all <img> inside the article container
    const imgNodes = articleEl.querySelectorAll('img');
    const images = Array.from(imgNodes)
      .map(img => img.src)
      .filter(src => src && !src.startsWith('data:')); // filter out placeholders
    const imageCount = images.length;
  
    const bulletEls = articleEl.querySelectorAll('ul li');
    const bullets = Array.from(bulletEls).map(li => li.innerText.trim());
    const bulletCount = bullets.length;
  
    const keywordsMeta =
      document.querySelector('meta[name="keywords"]')?.content || '';
    const keywords = keywordsMeta
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
  
    const articleHTML = articleEl.innerHTML;
  
    chrome.storage.local.set({
      currentArticle: {
        url: location.href,
        headline,
        headlineWordCount,
        wordCount,
        datePosted,
        author,
        images,
        imageCount,
        bullets,
        bulletCount,
        keywords,
        articleHTML
      }
    });
  })();
  