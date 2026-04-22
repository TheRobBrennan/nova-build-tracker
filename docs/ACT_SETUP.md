# Act Setup Guide

This guide covers setting up `act` for local testing of GitHub Actions workflows.

## What is Act?

`act` is a tool that lets you run your GitHub Actions workflows locally. It's useful for testing workflows before pushing changes, debugging issues, and validating workflow logic.

## Prerequisites

### Docker Required

`act` requires Docker to run GitHub Actions workflows locally. Install Docker Desktop for your platform:

**macOS:**
```bash
# Install Docker Desktop
brew install --cask docker

# Or download from https://www.docker.com/products/docker-desktop
```

**Linux:**
```bash
# Install Docker Engine
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER
```

**Windows:**
Download and install Docker Desktop from https://www.docker.com/products/docker-desktop

## Installation

### macOS (Recommended)

```bash
brew install act
```

### Linux

```bash
curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash
```

### Windows

```powershell
scoop install act
```

or download from [GitHub releases](https://github.com/nektos/act/releases).

## Configuration

### Initial Setup

Run `act` once to create the default configuration:

```bash
act
```

This creates a `.actrc` file with default settings.

### Recommended Configuration

Create or update `.actrc` in your project root:

```bash
# Use the latest Ubuntu runner
-P ubuntu-latest=catthehacker/ubuntu:act-latest

# Use ARM64 for Apple Silicon (optional)
# -P ubuntu-latest=catthehacker/ubuntu:act-latest-arm64

# Remove containers after workflow completion
-r

# Don't check for new versions
--quiet
```

## Usage

### Test All Workflows

```bash
npm run test:workflows
```

### Test Specific Workflow

```bash
# Test CI workflow
act pull_request -e .github/test-data/pr-events/valid.json -W .github/workflows/ci.yml

# Test version bump workflow
act push -e .github/test-data/pr-events/minor.json -W .github/workflows/version-bump.yml
```

### Test with Custom Event Data

```bash
# Use your own event file
act pull_request -e my-custom-event.json -W .github/workflows/ci.yml
```

## Project-Specific Test Events

This project includes test event files in `.github/test-data/pr-events/`:

- `valid.json` - Valid PR with conventional commit title
- `invalid.json` - Invalid PR title (fails CI validation)
- `major.json` - Major version bump (feat!)
- `minor.json` - Minor version bump (feat:)
- `patch.json` - Patch version bump (fix:)
- `api-changes.json` - API service changes
- `web-changes.json` - Web service changes
- `multiple-changes.json` - Multiple service changes

## Common Issues

### Authentication Errors

When testing version bump workflows locally, you'll see authentication errors. This is expected because:

- GitHub API calls require real GitHub tokens
- Some operations only work in GitHub Actions environment
- Container permissions differ from GitHub's environment

These errors don't indicate problems with your workflow - they'll work correctly when running in GitHub Actions.

### Docker Issues

```bash
# Clean up containers if act gets stuck
docker ps -a | grep act | awk '{print $1}' | xargs docker rm -f

# Clean up Docker resources
docker system prune -f
```

### Permission Issues

```bash
# Make test script executable
chmod +x .github/test-workflows.sh

# Fix Docker permissions (macOS/Linux)
sudo chown -R $USER /var/run/docker.sock
```

## Environment Variables

For workflows that require secrets, you can provide them via command line:

```bash
act push -e .github/test-data/pr-events/minor.json -W .github/workflows/version-bump.yml -s GITHUB_TOKEN="test-token"
```

Common secrets used in this project:

- `GITHUB_TOKEN` - GitHub API token
- `GPG_PRIVATE_KEY` - GPG signing key (optional)
- `GPG_PASSPHRASE` - GPG key passphrase (optional)

## Best Practices

1. **Clean up regularly**: Use the provided test script which includes container cleanup
2. **Test specific workflows**: Focus on the workflow you're modifying
3. **Use appropriate event data**: Match the event type to your workflow trigger
4. **Ignore expected auth errors**: Version bump workflows will show auth errors locally
5. **Monitor Docker resources**: Act can use significant disk space

## Troubleshooting

### Act fails to start

```bash
# Check Docker is running
docker version

# Restart Docker service
sudo systemctl restart docker  # Linux
# or restart Docker Desktop (macOS/Windows)
```

### Workflow times out

```bash
# Increase timeout
act --timeout 30m pull_request -e .github/test-data/pr-events/valid.json -W .github/workflows/ci.yml
```

### Container image issues

```bash
# Pull fresh images
act pull

# Clear act cache
act --clear-cache
```

## Integration with Development Workflow

1. Make changes to workflows
2. Run `npm run test:workflows` to test
3. Fix any issues found
4. Commit and push changes
5. GitHub Actions will run the workflows in production

This ensures your workflows work correctly before deploying them.
