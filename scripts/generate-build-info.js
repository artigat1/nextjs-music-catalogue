const fs = require('fs');
const { execSync } = require('child_process');

try {
    const commitSha = execSync('git rev-parse HEAD').toString().trim();
    const commitMessage = execSync('git log -1 --pretty=%s').toString().trim();
    const buildDate = new Date().toISOString();
    const commitUrl = `https://github.com/artigat1/nextjs-music-catalogue/commit/${commitSha}`;

    const buildInfo = {
        buildDate,
        commitSha,
        commitMessage,
        commitUrl
    };

    // Write to public/build.json so it's accessible as a static asset
    fs.writeFileSync('public/build.json', JSON.stringify(buildInfo, null, 2));

    console.log('Build info generated successfully:', buildInfo);
} catch (error) {
    console.error('Error generating build info:', error);
    // Fallback for environments where git might not be available or fail
    const fallbackInfo = {
        buildDate: new Date().toISOString(),
        error: 'Failed to retrieve git info'
    };
    fs.writeFileSync('public/build.json', JSON.stringify(fallbackInfo, null, 2));
}
