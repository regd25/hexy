#!/bin/bash

# HexyEngine Demo Day Runner
# Prepares and executes the complete demonstration

set -e

echo "🚀 HexyEngine Demo Day Setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the hexy-engine root directory"
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo "🔨 Building the project..."
npm run build

echo "🎭 Starting HexyEngine Demo Day..."
echo ""
echo "🎯 Demo Scenarios:"
echo "  1. Process Definition and Validation"
echo "  2. LLM-Powered Semantic Validation"
echo "  3. Live Process Execution"
echo "  4. Metrics and Monitoring"
echo "  5. Architecture Generation"
echo ""

# Run the demo
npx ts-node demo/demo.ts

echo ""
echo "🎉 Demo Day completed!"
echo "📧 Contact: hexy-team@example.com"
echo "🌐 Repository: https://github.com/hexy-platform/hexy-engine" 