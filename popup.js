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

// Button click handlers
document.getElementById('summarize').addEventListener('click', async () => {
        try {
                const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
                await chrome.scripting.executeScript({
                        target: { tabId: tab.id },
                        files: ['content_script.js']
                });
                chrome.tabs.create({ url: chrome.runtime.getURL('summarizer.html') });
        } catch (error) {
                console.error('Error:', error);
        }
});

document.getElementById('details').addEventListener('click', async () => {
        try {
                const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
                await chrome.scripting.executeScript({
                        target: { tabId: tab.id },
                        files: ['content_script.js']
                });
                chrome.tabs.create({ url: chrome.runtime.getURL('details.html') });
        } catch (error) {
                console.error('Error:', error);
        }
});

document.getElementById('visualize').addEventListener('click', async () => {
        try {
                const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
                await chrome.scripting.executeScript({
                        target: { tabId: tab.id },
                        files: ['content_script.js']
                });
                chrome.tabs.create({ url: chrome.runtime.getURL('visualization.html') });
        } catch (error) {
                console.error('Error:', error);
        }
});
