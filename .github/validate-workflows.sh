#!/bin/bash

# Lightweight workflow validation script
# This script validates workflow syntax and logic without running full Docker builds

echo "Validating GitHub Actions workflows..."
echo ""

# Function to validate YAML syntax
validate_yaml() {
  local file=$1
  if command -v yq >/dev/null 2>&1; then
    if yq eval '.' "$file" >/dev/null 2>&1; then
      echo "  YAML syntax valid: $file"
      return 0
    else
      echo "  YAML syntax invalid: $file"
      return 1
    fi
  else
    echo "  yq not found, skipping YAML validation for $file"
    return 0
  fi
}

# Function to check workflow triggers
validate_triggers() {
  local file=$1
  echo "  Checking triggers in $file"
  
  # Check if workflow has appropriate triggers
  if grep -q "on:" "$file"; then
    echo "    Has trigger configuration"
  else
    echo "    Missing trigger configuration"
    return 1
  fi
}

# Function to check required permissions
validate_permissions() {
  local file=$1
  echo "  Checking permissions in $file"
  
  if grep -q "permissions:" "$file"; then
    echo "    Has permissions configuration"
  else
    echo "    Missing permissions configuration"
  fi
}

# Function to validate version bump workflow specifically
validate_version_bump() {
  local file=".github/workflows/version-bump.yml"
  if [ -f "$file" ]; then
    echo "Validating version-bump workflow..."
    
    # Check for required steps
    local required_steps=(
      "Determine Version Bump Type"
      "Detect Changed Services"
      "Create Version Bump Branch"
      "Create or Update Pull Request"
    )
    
    for step in "${required_steps[@]}"; do
      if grep -q "$step" "$file"; then
        echo "    Found required step: $step"
      else
        echo "    Missing required step: $step"
        return 1
      fi
    done
    
    # Check for conventional commit parsing
    if grep -q "feat!:" "$file" && grep -q "feat:" "$file"; then
      echo "    Has conventional commit parsing logic"
    else
      echo "    Missing conventional commit parsing logic"
      return 1
    fi
    
    # Check for service change detection
    if grep -q "services/api/" "$file" && grep -q "services/web/" "$file"; then
      echo "    Has service change detection logic"
    else
      echo "    Missing service change detection logic"
      return 1
    fi
  fi
}

# Main validation
echo "1. Validating CI workflow..."
if [ -f ".github/workflows/ci.yml" ]; then
  validate_yaml ".github/workflows/ci.yml"
  validate_triggers ".github/workflows/ci.yml"
  validate_permissions ".github/workflows/ci.yml"
else
  echo "  CI workflow not found"
fi
echo ""

echo "2. Validating Version Bump workflow..."
if [ -f ".github/workflows/version-bump.yml" ]; then
  validate_yaml ".github/workflows/version-bump.yml"
  validate_triggers ".github/workflows/version-bump.yml"
  validate_permissions ".github/workflows/version-bump.yml"
  validate_version_bump
else
  echo "  Version bump workflow not found"
fi
echo ""

echo "3. Validating test data..."
if [ -d ".github/test-data/pr-events" ]; then
  echo "  Test data directory exists"
  
  # Check for required test event files
  local required_files=(
    "valid.json"
    "invalid.json"
    "major.json"
    "minor.json"
    "patch.json"
    "api-changes.json"
    "web-changes.json"
    "multiple-changes.json"
  )
  
  for file in "${required_files[@]}"; do
    if [ -f ".github/test-data/pr-events/$file" ]; then
      echo "    Found test file: $file"
    else
      echo "    Missing test file: $file"
    fi
  done
else
  echo "  Test data directory not found"
fi
echo ""

echo "4. Checking act setup..."
if [ -f ".github/test-workflows.sh" ]; then
  echo "  Act test script exists"
  
  if [ -x ".github/test-workflows.sh" ]; then
    echo "  Act test script is executable"
  else
    echo "  Act test script is not executable"
  fi
else
  echo "  Act test script not found"
fi
echo ""

echo "5. Checking documentation..."
if [ -f "docs/ACT_SETUP.md" ]; then
  echo "  Act setup guide exists"
else
  echo "  Act setup guide not found"
fi

if grep -q "Version Management" "README.md"; then
  echo "  README has version management documentation"
else
  echo "  README missing version management documentation"
fi
echo ""

echo "Workflow validation complete!"
echo ""
echo "For full integration testing, run: npm run test:workflows"
echo "Note: Full testing requires Docker and can take several minutes"
