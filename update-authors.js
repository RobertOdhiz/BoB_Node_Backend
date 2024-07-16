const { execSync } = require('child_process');
const fs = require('fs');

// Function to get contributors from Git commit history
function getContributors() {
  try {
    // Get Git log of contributors
    const gitLog = execSync('git log --format="%aN <%aE>"').toString();

    // Parse contributors from Git log
    const contributors = gitLog.split('\n')
      .filter((line) => line.trim() !== '')
      .reduce((acc, line) => {
        const match = line.match(/^(.*?) <(.*?)>$/);
        if (match && match.length === 3) {
          const name = match[1].trim();
          const email = match[2].trim();
          const key = `${name} <${email}>`;
          if (!acc[key]) {
            acc[key] = true;
          }
        }
        return acc;
      }, {});

    return Object.keys(contributors);
  } catch (err) {
    console.error('Error retrieving contributors:', err);
    return [];
  }
}

// Function to update AUTHORS file
function updateAuthorsFile() {
  try {
    const contributors = getContributors();
    const content = contributors.join('\n');
    fs.writeFileSync('AUTHORS', content);
    console.log('AUTHORS file updated successfully.');
  } catch (err) {
    console.error('Error updating AUTHORS file:', err);
  }
}

// Run the update
updateAuthorsFile();