# CodeQL Setup Instructions

CodeQL is a static analysis security testing (SAST) tool that analyzes your code for security vulnerabilities and coding errors.

## Why CodeQL Cannot Be Auto-Pushed

The CodeQL workflow file (`.github/workflows/codeql.yml`) has been created locally but cannot be automatically pushed to GitHub because:

- **GitHub App Permissions**: The Manus integration uses a GitHub App that lacks the `workflows` permission
- **Security Measure**: GitHub restricts workflow modifications to prevent unauthorized CI/CD changes

## Manual Setup Options

### Option 1: Enable Through GitHub Security Tab (Recommended)

1. Go to your repository on GitHub: https://github.com/aymanhamdanus/ContraMind_manus
2. Click **Security** tab
3. Click **Code scanning** in the left sidebar
4. Click **Set up code scanning**
5. Choose **CodeQL Analysis**
6. Click **Configure** (GitHub will create the workflow automatically)
7. Review and commit the workflow file

### Option 2: Manual File Upload

1. Go to your repository: https://github.com/aymanhamdanus/ContraMind_manus
2. Navigate to `.github/workflows/`
3. Click **Add file** → **Create new file**
4. Name it `codeql.yml`
5. Copy and paste the content below:

```yaml
name: CodeQL

on:
  push:
    branches: [ master, main ]
  pull_request:
    branches: [ master, main ]

jobs:
  analyze:
    runs-on: ubuntu-latest
    permissions:
      actions: read
      contents: read
      security-events: write
    steps:
      - uses: actions/checkout@v4
      - uses: github/codeql-action/init@v3
        with:
          languages: javascript
      - uses: github/codeql-action/analyze@v3
```

6. Commit the file

### Option 3: Local Git Push (If You Have Direct Access)

If you have direct git access (not through GitHub App):

```bash
cd /path/to/ContraMind_manus
git pull origin master
cp /home/ubuntu/contramind-app/.github/workflows/codeql.yml .github/workflows/
git add .github/workflows/codeql.yml
git commit -m "Add CodeQL SAST workflow"
git push origin master
```

## What CodeQL Does

Once enabled, CodeQL will:

- **Scan on Push**: Analyze code on every push to `master` or `main`
- **Scan on PR**: Analyze code in pull requests
- **Detect Vulnerabilities**: Find security issues like SQL injection, XSS, etc.
- **Report Results**: Show findings in Security → Code scanning alerts
- **Block PRs**: Optionally block PRs with critical vulnerabilities

## Configuration Details

### Languages Analyzed
- **JavaScript/TypeScript**: Client and server code

### Permissions Required
- `actions: read` - Read workflow runs
- `contents: read` - Read repository content
- `security-events: write` - Write security alerts

### Triggers
- Push to `master` or `main` branches
- Pull requests targeting `master` or `main`

## Verifying CodeQL is Working

After setup:

1. Go to **Actions** tab in your repository
2. Look for "CodeQL" workflow runs
3. Check **Security** → **Code scanning** for alerts
4. First run may take 5-10 minutes

## Complete Security Stack

With CodeQL enabled, you'll have:

| Tool | Type | Purpose |
|------|------|---------|
| **npm audit** | Dependency scanning | Find vulnerable packages |
| **Gitleaks** | Secrets scanning | Detect leaked credentials |
| **CodeQL** | SAST | Find code vulnerabilities |
| **Helmet** | Runtime protection | Security headers |
| **Rate limiting** | Runtime protection | Prevent abuse |

## Troubleshooting

### Workflow Not Running

- Check **Actions** tab is enabled in repository settings
- Verify workflow file is in `.github/workflows/` directory
- Ensure file is named `codeql.yml` (not `codeql.yaml`)

### Analysis Failing

- Check Actions logs for error messages
- Ensure `languages: javascript` is correct
- Verify repository has JavaScript/TypeScript code

### No Alerts Showing

- CodeQL may not find issues (good news!)
- Check **Security** → **Code scanning** → **Closed** for resolved alerts
- Review CodeQL query packs being used

## Additional Resources

- [CodeQL Documentation](https://codeql.github.com/docs/)
- [GitHub Code Scanning](https://docs.github.com/en/code-security/code-scanning)
- [CodeQL for JavaScript](https://codeql.github.com/docs/codeql-language-guides/codeql-for-javascript/)

---

**Note**: The workflow file has been created locally at `.github/workflows/codeql.yml` and is ready to be manually added to your repository using one of the methods above.

