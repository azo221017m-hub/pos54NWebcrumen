#!/bin/bash

# Script to validate and fix the estatusdepago ENUM column
# This script helps diagnose and fix the "Data truncated for column 'estatusdepago'" error

set -e

echo "=========================================="
echo "estatusdepago Column Validation & Fix"
echo "=========================================="
echo ""

# Check if mysql client is available
if ! command -v mysql &> /dev/null; then
    echo "❌ ERROR: mysql client is not installed or not in PATH"
    echo "Please install mysql-client to run this script"
    exit 1
fi

# Get database credentials
echo "Please enter your database credentials:"
read -p "Database host [localhost]: " DB_HOST
DB_HOST=${DB_HOST:-localhost}

read -p "Database name: " DB_NAME
if [ -z "$DB_NAME" ]; then
    echo "❌ ERROR: Database name is required"
    exit 1
fi

read -p "Database user: " DB_USER
if [ -z "$DB_USER" ]; then
    echo "❌ ERROR: Database user is required"
    exit 1
fi

read -sp "Database password: " DB_PASSWORD
echo ""
echo ""

# Test database connection
echo "Testing database connection..."
if ! mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -e "SELECT 1;" &> /dev/null; then
    echo "❌ ERROR: Cannot connect to database. Please check your credentials."
    exit 1
fi
echo "✓ Database connection successful"
echo ""

# Check current ENUM definition
echo "Checking current estatusdepago column definition..."
CURRENT_TYPE=$(mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" -D "$DB_NAME" -N -e "
SELECT COLUMN_TYPE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'tblposcrumenwebventas' 
  AND COLUMN_NAME = 'estatusdepago';
")

echo "Current definition: $CURRENT_TYPE"
echo ""

# Check if PARCIAL is included
if [[ $CURRENT_TYPE == *"PARCIAL"* ]]; then
    echo "✅ SUCCESS: The column already includes 'PARCIAL' value"
    echo "No migration needed. The error should not occur."
    exit 0
else
    echo "⚠️  WARNING: The column does NOT include 'PARCIAL' value"
    echo "This is causing the 'Data truncated' error."
    echo ""
    
    # Ask for confirmation to apply fix
    read -p "Do you want to apply the fix now? (yes/no): " CONFIRM
    
    if [ "$CONFIRM" != "yes" ]; then
        echo "Migration cancelled by user."
        echo ""
        echo "To apply manually, run:"
        echo "  mysql -h $DB_HOST -u $DB_USER -p $DB_NAME < backend/src/scripts/fix_estatusdepago_enum.sql"
        exit 0
    fi
    
    echo ""
    echo "Applying migration..."
    
    # Apply the fix
    mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" -D "$DB_NAME" <<'EOF'
ALTER TABLE tblposcrumenwebventas 
MODIFY COLUMN estatusdepago ENUM('PENDIENTE', 'PAGADO', 'PARCIAL', 'ESPERAR') 
NOT NULL DEFAULT 'PENDIENTE';
EOF
    
    echo "✓ Migration applied successfully"
    echo ""
    
    # Verify the fix
    echo "Verifying the migration..."
    NEW_TYPE=$(mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" -D "$DB_NAME" -N -e "
SELECT COLUMN_TYPE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'tblposcrumenwebventas' 
  AND COLUMN_NAME = 'estatusdepago';
")
    
    echo "New definition: $NEW_TYPE"
    echo ""
    
    if [[ $NEW_TYPE == *"PARCIAL"* ]]; then
        echo "✅ SUCCESS: Migration verified successfully!"
        echo "The 'Data truncated' error should now be resolved."
    else
        echo "❌ ERROR: Migration verification failed"
        echo "Please contact support with this information."
        exit 1
    fi
fi

echo ""
echo "=========================================="
echo "Done!"
echo "=========================================="
