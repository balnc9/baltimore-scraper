(async function(){
    function getWordCount(text){ 
        const words = text.trim().split(/\s+/);
        return words.length; 
    }
    
    // Get headline
    const headlineEl = document.querySelector('.headline.headline--default-left');
    const headline = headlineEl?.innerText || '';
    const headlineWordCount = headline ? getWordCount(headline) : 0;
    
    // Get article content
    const articleBody = document.querySelector('.article-body');
    const paragraphs = articleBody?.querySelectorAll('p[data-testid="text-container"]') || [];
    const articleText = Array.from(paragraphs)
        .map(p => p.innerText.trim())
        .filter(text => text.length > 0)  // Remove empty paragraphs
        .join(' ');
    const wordCount = getWordCount(articleText);
    
    // Count headers
    const headers = articleBody?.querySelectorAll('h2[data-testid="header-container"]') || [];
    const headerCount = headers.length;
    
    // Get date
    const dateEl = document.querySelector('time.attribution-date__date');
    const datePosted = dateEl?.innerText.trim() || '';
    
    // Get lead image
    const leadImage = document.querySelector('.leadart__image');
    const leadImageUrl = leadImage?.src || null;
    
    // Get article images from image containers
    const articleImages = articleBody?.querySelectorAll('.image__container img') || [];
    const articleImagesUrls = Array.from(articleImages)
      .map(img => img.src)
      .filter(src => src && !src.startsWith('data:'));
    
    // Combine all images
    const allImages = [leadImageUrl, ...articleImagesUrls].filter(Boolean);
    const imageCount = allImages.length;
    
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
        articleText
      }
    });
  })();
  