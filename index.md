---
layout: default
title: "Matthew Chin | Portfolio"
---

<style>
  /* Theme Variables */
  :root { --bg-color: #ffffff; --text-color: #333333; --accent-color: #007BFF; --link-color: var(--accent-color); --header-bg: #f5f5f5; --card-bg: #ffffff; }
  html.dark { --bg-color: #1e1e1e; --text-color: #e5e5e5; --accent-color: #007BFF; --link-color: var(--accent-color); --header-bg: #2d2d2d; --card-bg: #2d2d2d; }

  /* Global Styles */
  body { background: var(--bg-color); color: var(--text-color); padding-top: 60px; scroll-behavior: smooth; font-family: 'Inter', sans-serif; transition: background 0.3s, color 0.3s; }
  a { position: relative; color: var(--link-color); text-decoration: none; }
  a::after { content: ''; position: absolute; left: 0; bottom: -2px; width: 0; height: 2px; background: var(--accent-color); transition: width 0.3s; }
  a:hover::after { width: 100%; }
  button.link-button { background: none; border: none; color: var(--link-color); cursor: pointer; font: inherit; padding: 0; }

  /* Navbar */
  .navbar { position: fixed; top: 0; width: 100%; background: var(--header-bg); display: flex; justify-content: center; gap: 1.5rem; padding: 0.75rem; z-index: 1000; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
  .navbar a, .navbar button { color: var(--text-color); background: none; border: none; cursor: pointer; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; font-size: 0.9rem; transition: color 0.3s; }

  /* Back to Top */
  #to-top { position: fixed; bottom: 2rem; right: 2rem; display: none; background: var(--accent-color); color: #fff; border: none; padding: 0.6rem; border-radius: 50%; cursor: pointer; font-size: 1.2rem; transition: transform 0.3s; }
  #to-top:hover { transform: translateY(-3px); }

  /* Hero Section */
  .hero { display: flex; align-items: center; gap: 1.5rem; margin: 2rem 1rem; }
  .hero-text h1 { margin: 0; font-size: 2rem; }
  .hero-text p { margin: 0.25rem 0 0; color: var(--text-color); }
  .hero .profile-photo { width: 150px; height: 150px; border-radius: 50%; object-fit: cover; border: 4px solid var(--accent-color); box-shadow: 0 4px 8px rgba(0,0,0,0.2); transition: transform 0.3s; }
  .hero .profile-photo:hover { transform: scale(1.05); }

  /* Sections */
  section { margin: 2rem 1rem; animation: fadeIn 0.6s ease-out; }
  h2 { font-size: 1.5rem; color: var(--accent-color); margin-bottom: 1rem; }
  #about .about-text { font-size: 0.95rem; line-height: 1.6; }
  .experience-item { margin-bottom: 1.5rem; }
  .experience-item h3 { margin: 0; font-size: 1.2rem; color: var(--accent-color); }
  .experience-item .role { font-style: italic; margin-bottom: 0.5rem; }
  .experience-item ul { list-style: disc inside; margin-left: 1rem; }
  .projects-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.5rem; }
  .project-card { background: var(--card-bg); padding: 1.25rem; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: transform 0.3s, box-shadow 0.3s; }
  .project-card:hover { transform: translateY(-5px); box-shadow: 0 6px 12px rgba(0,0,0,0.15); }
  #skills ul, #contact ul { list-style: disc inside; margin-left: 1rem; }

  /* Resume Embed */
  #resume-section { display: none; margin: 2rem 1rem; }
  #resume-section h2 { margin-bottom: 1rem; }
  #resume-section iframe { width: 100%; height: 800px; border: none; }

  @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>

<script>
  document.addEventListener('DOMContentLoaded', () => {
    const root = document.documentElement;
    const toggle = document.getElementById('theme-toggle');
    let theme = localStorage.getItem('theme') || 'dark';
    root.classList.toggle('dark', theme === 'dark');
    toggle.textContent = theme === 'dark' ? '☀️' : '🌙';
    toggle.addEventListener('click', () => {
      const isDark = root.classList.toggle('dark');
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
      toggle.textContent = isDark ? '☀️' : '🌙';
    });
    const toTop = document.getElementById('to-top');
    window.addEventListener('scroll', () => { toTop.style.display = window.scrollY > 300 ? 'block' : 'none'; });
    toTop.addEventListener('click', () => { window.scrollTo({ top: 0, behavior: 'smooth' }); });
    // Resume toggle
    const resumeBtn = document.getElementById('resume-toggle');
    const resumeSection = document.getElementById('resume-section');
    resumeBtn.addEventListener('click', () => {
      const visible = resumeSection.style.display === 'block';
      resumeSection.style.display = visible ? 'none' : 'block';
      resumeBtn.textContent = visible ? 'Display Resume' : 'Hide Resume';
    });
  });
</script>

<!-- Navbar -->
<nav class="navbar">
  <a href="#about">About</a>
  <a href="#experience">Experience</a>
  <a href="#projects">Projects</a>
  <a href="#skills">Skills</a>
  <a href="#contact">Contact</a>
  <button id="theme-toggle" aria-label="Toggle Dark Mode">🌙</button>
</nav>
<button id="to-top" title="Go to top">⬆️</button>

<!-- Hero -->
<section id="hero" class="hero">
  <img src="/assets/images/profile.JPEG" alt="Matthew Chin" class="profile-photo" />
  <div class="hero-text">
    <h1>Matthew Chin</h1>
    <p>Computer Science Undergraduate at University of Maryland</p>
  </div>
</section>

<!-- About Me -->
<section id="about">
  <h2>About Me</h2>
  <div class="about-text">Hi! I’m Matthew, a CS undergrad at UMD. I’m passionate about web development, data visualization, and cybersecurity. Currently, I’m researching digital media engagement metrics and building interactive tools to explore data in real time.</div>
</section>

<!-- Experience -->
<section id="experience">
  <h2>Experience</h2>
  <div class="experience-item">
    <h3>Undergraduate Researcher - Data Visualization Team</h3>
    <div class="role">Digital Media Engagement Lab, UMD | College Park, MD | Feb 2025 – Present</div>
    <ul>
      <li>Contributed to an Undergraduate Research team focused on analyzing Digital Media Interaction data (N=1500+) to explore engagement metrics, interaction patterns, and attention data.</li>
      <li>Co-developed a live news web scraper and a Chrome Extension to scrape/extract article metadata and visualize those points from local journalism platforms.</li>
      <li>Engineered real-time data visualizations using JavaScript, Chart.js, and HTML/CSS to support the lab’s mission.</li>
    </ul>
  </div>
  <div class="experience-item">
    <h3>Cybersecurity Framework Student Researcher</h3>
    <div class="role">National Institute of Standards and Technology (NIST) | Gaithersburg, MD | Jul 2022 – Aug 2023</div>
    <ul>
      <li>Participated in open-source panels to implement and restructure the NIST Cybersecurity Framework’s core functions in a simulated environment.</li>
      <li>Focused on risk assessment methodologies and control implementation.</li>
      <li>Contributed Python scripts to analyze framework effectiveness.</li>
    </ul>
  </div>
  <div class="experience-item">
    <h3>IT Technician & Receptionist</h3>
    <div class="role">Stone Rehabilitation and Senior Living | Newton, MA | Aug 2020 – May 2023</div>
    <ul>
      <li>Executed precise data entry for patient records, enhancing energy of information management and ensuring data integrity.</li>
      <li>Provided exceptional customer service by greeting visitors and facilitating a welcoming atmosphere.</li>
    </ul>
  </div>
</section>

<!-- Projects -->
<section id="projects">
  <h2>Projects</h2>
  <div class="projects-grid">
    <div class="project-card">
      <h3><a href="https://github.com/balnc9/baltimore-scraper">Baltimore Banner Scraper</a></h3>
      <p>Chrome Extension that scrapes and visualizes article metadata from the Baltimore Banner using Chart.js and DOM parsing.</p>
    </div>
    <div class="project-card">
      <h3><a href="https://github.com/balnc9/minesweeper-game">Minesweeper Game Clone</a></h3>
      <p>A C++ implementation of classic Minesweeper with adaptive board generation and difficulty scaling.</p>
    </div>
  </div>
</section>

<!-- Skills -->
<section id="skills">
  <h2>Skills</h2>
  <ul>
    <li><strong>Languages:</strong> JavaScript, Python, C, Java</li>
    <li><strong>Web:</strong> HTML, CSS, Chart.js, Chrome Extensions</li>
    <li><strong>Tools:</strong> Git, GitHub, Jekyll, VSCode</li>
  </ul>
</section>

<!-- Contact & Resume -->
<section id="contact">
  <h2>Contact</h2>
  <ul>
    <li><strong>Email:</strong> <a href="mailto:matthewlchin1@gmail.com">matthewlchin1@gmail.com</a></li>
    <li><strong>GitHub:</strong> <a href="https://github.com/balnc9">@balnc9</a></li>
    <li><strong>LinkedIn:</strong> <a href="https://linkedin.com/in/matthewleechin">linkedin.com/in/matthewleechin</a></li>
    <li><button id="resume-toggle" class="link-button">Display Resume</button></li>
  </ul>
</section>

<!-- Resume Embed -->
<section id="resume-section">
  <h2>Resume</h2>
  <iframe src="/assets/cv.pdf"></iframe>
</section>
