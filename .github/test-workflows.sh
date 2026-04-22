#!/bin/bash

# Function to clean up orphaned act containers
cleanup_act_containers() {
  echo "Cleaning up act containers..."
  orphaned_containers=$(docker ps -a | grep act | awk '{print $1}')
  if [ -n "$orphaned_containers" ]; then
    echo "Found orphaned containers: $orphaned_containers"
    docker rm -f $orphaned_containers
    echo "Containers removed successfully"
  else
    echo "No orphaned containers found"
  fi
  echo ""
}

# Clean up any existing act containers before starting tests
cleanup_act_containers

echo "Testing GitHub Actions workflows..."
echo ""

echo "Testing CI workflow..."
echo ""

echo "1. Testing PR title validation with valid commit..."
act pull_request -e .github/test-data/pr-events/valid.json -W .github/workflows/ci.yml --container-architecture linux/amd64
cleanup_act_containers
echo ""

echo "2. Testing PR title validation with invalid commit..."
act pull_request -e .github/test-data/pr-events/invalid.json -W .github/workflows/ci.yml --container-architecture linux/amd64
cleanup_act_containers
echo ""

echo "Testing Version Bump workflow..."
echo ""
echo "Note: The following tests will show authentication errors - this is expected behavior when testing locally"
echo "These operations require the GitHub Actions environment and will work properly when running in GitHub"
echo ""

echo "1. Testing major version bump (breaking change)..."
act push -e .github/test-data/pr-events/major.json -W .github/workflows/version-bump.yml --container-architecture linux/amd64 -s GITHUB_TOKEN="test-token"
cleanup_act_containers
echo ""

echo "2. Testing minor version bump (new feature)..."
act push -e .github/test-data/pr-events/minor.json -W .github/workflows/version-bump.yml --container-architecture linux/amd64 -s GITHUB_TOKEN="test-token"
cleanup_act_containers
echo ""

echo "3. Testing patch version bump (fix)..."
act push -e .github/test-data/pr-events/patch.json -W .github/workflows/version-bump.yml --container-architecture linux/amd64 -s GITHUB_TOKEN="test-token"
cleanup_act_containers
echo ""

echo "4. Testing version bump with API service changes..."
act push -e .github/test-data/pr-events/api-changes.json -W .github/workflows/version-bump.yml --container-architecture linux/amd64 -s GITHUB_TOKEN="test-token"
cleanup_act_containers
echo ""

echo "5. Testing version bump with web service changes..."
act push -e .github/test-data/pr-events/web-changes.json -W .github/workflows/version-bump.yml --container-architecture linux/amd64 -s GITHUB_TOKEN="test-token"
cleanup_act_containers
echo ""

echo "6. Testing version bump with multiple service changes..."
act push -e .github/test-data/pr-events/multiple-changes.json -W .github/workflows/version-bump.yml --container-architecture linux/amd64 -s GITHUB_TOKEN="test-token"
cleanup_act_containers
echo ""

echo "7. Testing version bump with infrastructure-only changes (should NOT bump any service)..."
act push -e .github/test-data/pr-events/infra-only-changes.json -W .github/workflows/version-bump.yml --container-architecture linux/amd64 -s GITHUB_TOKEN="test-token"
cleanup_act_containers
echo ""

# Final cleanup to ensure no containers are left behind
cleanup_act_containers

echo ""
echo "All workflow tests completed!"
echo ""
echo "Note: Authentication errors during version bump tests are expected when running locally with act."
echo "The version bump workflow will work properly when running in GitHub Actions environment."
