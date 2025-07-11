#!/bin/bash

# Validation Script for Hexy Core
# Checks linting, types, and tests

set -e

echo "🔍 Starting Hexy Core validation..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Must run from core directory"
    exit 1
fi

echo "📦 Checking dependencies..."
if [ ! -d "node_modules" ]; then
    print_warning "Installing dependencies..."
    npm install
fi

echo "🔧 TypeScript compilation check..."
if npx tsc --noEmit; then
    print_status "TypeScript compilation passed"
else
    print_error "TypeScript compilation failed"
    exit 1
fi

echo "🧹 Linting check..."
if npx eslint . --ext .ts; then
    print_status "Linting passed"
else
    print_warning "Linting issues found (continuing with tests)"
fi

echo "🧪 Running tests..."
if npm test; then
    print_status "All tests passed"
else
    print_error "Tests failed"
    exit 1
fi

echo "📊 Coverage check..."
if npm run test:coverage; then
    print_status "Coverage report generated"
else
    print_warning "Coverage check failed"
fi

echo "🎯 Validation complete!"
print_status "Hexy Core is ready for development" 