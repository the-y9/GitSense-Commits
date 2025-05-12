async function loadSummary() {
    const dateInput = document.getElementById('datePicker').value;
    const summaryEl = document.getElementById('summary');

    const loadingSpinner = document.createElement('div');
    loadingSpinner.classList.add('spinner', 'show'); // Add both classes
    summaryEl.innerHTML = ''; // Clear any previous content
    summaryEl.appendChild(loadingSpinner); // Append the spinner


    try {
      if (!dateInput) {
        const latestData = await fetch('https://raw.githubusercontent.com/the-y9/GitSense-Commits/main/summaries/latest.json');
        if (!latestData.ok) throw new Error('Could not fetch latest summary date');
        const latestJSON = await latestData.json();
        if (!latestJSON.latest) throw new Error('Invalid latest.json format');
        loadSummaryByDate(latestJSON.latest);
      } else {
        loadSummaryByDate(dateInput);
      }
    } catch (err) {
      summaryEl.innerHTML = `<span class="error">Error: ${err.message}. Please try again later.</span>`;
    }
  }

  async function loadSummaryByDate(dateStr) {
    const summaryEl = document.getElementById('summary');
    const date = new Date(dateStr);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const filePath = `summaries/${yyyy}/${mm}/${dd}.md`;
    const url = `https://raw.githubusercontent.com/the-y9/GitSense-Commits/main/${filePath}`;

    try {
      const markdownData = await fetch(url);
      if (!markdownData.ok) throw new Error('Summary not found');
      const markdown = await markdownData.text();
      summaryEl.innerHTML = marked.parse(markdown);
    } catch (err) {
      summaryEl.innerHTML = `<span class="error">No summary found for ${yyyy}-${mm}-${dd}. ${err.message}</span>`;
    }
  }

  document.addEventListener('DOMContentLoaded', loadSummary);

  const owner = 'the-y9';
  const repo = 'GitSense-Commits';
  const url = `https://api.github.com/repos/${owner}/${repo}/commits?per_page=100`;

  async function setupCommitDatePicker() {
    
    try {
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }

      const commits = await response.json();
      const commitDates = commits.map(c => new Date(c.commit.author.date).toISOString().split('T')[0]);

      // Init Flatpickr with only commit dates enabled
      flatpickr("#datePicker", {
        enable: commitDates,
        dateFormat: "Y-m-d"
      });

    } catch (error) {
        console.error("Failed to load dates")
    }
  }

  // Run on load
  document.addEventListener('DOMContentLoaded', setupCommitDatePicker);
