#!/bin/bash
# Script to run complete database audit

echo "🔍 Running Complete Database Audit..."
echo "======================================"
echo ""

# Check if supabase CLI is available
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found"
    exit 1
fi

# Run the audit script
echo "📊 Executing audit queries..."
supabase db execute --file supabase-migrations/complete_database_audit.sql --output table

echo ""
echo "✅ Audit complete!"
echo ""
echo "📋 Key things to check:"
echo "  1. Does 'send_review_request' field exist?"
echo "  2. What is the subscription_status distribution?"
echo "  3. Are triggers active?"
echo "  4. How many users are in trial vs active?"
