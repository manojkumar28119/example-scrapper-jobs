const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const port = 3000;

// Middleware to handle JSON requests
app.use(express.json());

// Web scraping route
app.get('/scrape', async (req, res) => {
  const url = req.query.url;

  if (!url) {
    return res.status(400).json({ error: 'Please provide a URL to scrape' });
  }

  try {
    console.log(`Starting scraping of URL: ${url}`);

    // Launch Puppeteer browser
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Set a real browser User-Agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

    // Navigate to the URL and wait until the content is loaded
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    // Wait for specific elements to load
    await page.waitForSelector('.cust-job-tuple');  // Adjust selector if needed

    console.log('Page loaded, scraping content...');

    // Scrape the data
    const headlines = await page.evaluate(() => {
        const jobs = [];
        const jobElements = document.querySelectorAll('.cust-job-tuple');
  
        jobElements.forEach(job => {
          try {
            const title = job.querySelector('.title')?.innerText || 'N/A';
            const company = job.querySelector('.comp-name')?.innerText || 'N/A';
            const location = job.querySelector('.loc-wrap')?.innerText || 'N/A';
            
            if (title !== 'N/A') {
              jobs.push({ title, company, location });
            }
          } catch (err) {
            console.error('Error processing job element', err);
          }
        });
  
        return jobs;
  
    });

    console.log('Scraping complete:', headlines);

    // Close the browser
    await browser.close();

    // Return the scraped data
    res.json({ headlines });
  } catch (error) {
    console.error('Error during scraping:', error);
    res.status(500).json({ error: 'Failed to scrape the page' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
