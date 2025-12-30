# Database Migrations Guide

This directory contains database migration scripts and utility scripts for the POS54NWebcrumen application.

## 🗄️ Migration Scripts

Migration scripts must be executed on the database in order to keep the schema in sync with the application code.

### Available Migrations

#### 1. `add_idnegocio_migration.sql`
**Status**: ✅ Should already be applied  
**Purpose**: Adds `idnegocio` column to legacy tables (productos, ventas, inventario)  
**Documentation**: See `../MIGRATION_IDNEGOCIO.md`  
**When to run**: This migration should have been run earlier. Verify it's already applied.

#### 2. `add_moderadores_to_detalleventas.sql` ⚠️
**Status**: ⚠️ **REQUIRED FOR CURRENT ISSUE**  
**Purpose**: Adds `moderadores` column to `tblposcrumenwebdetalleventas` table  
**Documentation**: See `../MIGRATION_MODERADORES_COLUMN.md`  
**Error if not applied**: `"Error al registrar venta web: Unknown column 'moderadores' in field list"`  
**When to run**: **IMMEDIATELY** - This fixes the current production issue

### How to Apply Migrations

#### Quick Start (Production)

```bash
# 1. Backup the database first!
mysqldump -h <DB_HOST> -u <DB_USER> -p <DB_NAME> > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Connect to database
mysql -h <DB_HOST> -u <DB_USER> -p <DB_NAME>

# 3. Run the required migration
source backend/src/scripts/add_moderadores_to_detalleventas.sql

# 4. Verify
DESCRIBE tblposcrumenwebdetalleventas;
```

#### Detailed Instructions

See the documentation files in the parent directory:
- `../MIGRATION_IDNEGOCIO.md` - For idnegocio migration
- `../MIGRATION_MODERADORES_COLUMN.md` - For moderadores migration (current issue)

### Checking Migration Status

```sql
-- Check if idnegocio columns exist
SELECT TABLE_NAME, COLUMN_NAME 
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
    AND COLUMN_NAME = 'idnegocio'
    AND TABLE_NAME IN ('productos', 'ventas', 'inventario');

-- Check if moderadores column exists
SELECT TABLE_NAME, COLUMN_NAME 
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'tblposcrumenwebdetalleventas'
    AND COLUMN_NAME = 'moderadores';
```

## 🛠️ Utility Scripts

These are TypeScript utility scripts for various administrative tasks.

### User Management
- `createSuperuser.ts` - Create superuser account
- `seedUsuario.ts` - Seed initial user data
- `updatePoscrumenPassword.ts` - Update poscrumen user password
- `resetLoginAttempts.ts` - Reset failed login attempts

### Database Utilities
- `verifyDatabase.ts` - Verify database connection and structure
- `validateUsuariosFiltering.ts` - Validate user filtering by idnegocio
- `verifyUserFiltering.ts` - Verify user filtering implementation

### Business Logic Utilities
- `recalcularCostosSubrecetas.ts` - Recalculate subrecipe costs
- `initializeCrumensys.ts` - Initialize Crumensys data

### Testing Utilities
- `testCreateSuperuser.ts` - Test superuser creation
- `testImageConversion.ts` - Test image conversion functionality

### Running Utility Scripts

```bash
# From the backend directory
cd backend

# Install dependencies (if not already done)
npm install

# Run a utility script
npm run script <script-name>

# Example:
npm run script createSuperuser
```

## 📋 Migration Checklist

Use this checklist when deploying to production:

### Pre-Deployment
- [ ] Backup database
- [ ] Review migration script
- [ ] Test migration on staging/dev environment
- [ ] Verify application code is ready
- [ ] Schedule maintenance window (if needed)

### Deployment
- [ ] Run migration script
- [ ] Verify migration completed successfully
- [ ] Check for any errors in MySQL logs
- [ ] Verify column structure matches expected

### Post-Deployment
- [ ] Test application functionality
- [ ] Verify error is resolved
- [ ] Monitor application logs
- [ ] Verify data integrity
- [ ] Update deployment documentation

## 🆘 Troubleshooting

### Migration Fails with "Column already exists"
This is expected if you're re-running the script. The scripts use `IF NOT EXISTS` which makes them idempotent. No action needed.

### Migration Fails with "Access denied"
The database user needs `ALTER TABLE` privileges. Contact your database administrator.

### Migration Fails with "Syntax error"
Verify MySQL version is 5.7+ or MariaDB 10.2+ (required for `IF NOT EXISTS` syntax).

### After Migration, Application Still Shows Error
1. Verify the migration completed: `DESCRIBE tblposcrumenwebdetalleventas;`
2. Check that the `moderadores` column appears in the output
3. Restart the application server to clear any connection pools
4. Check application logs for different error messages

## 📞 Support

For issues with migrations:
1. Check the detailed documentation in the parent directory
2. Verify prerequisites (MySQL version, permissions, etc.)
3. Review MySQL error logs
4. Contact the development team with:
   - Error messages
   - MySQL version
   - Migration script being run
   - Database structure (output of `DESCRIBE <table>`)

## 🔐 Security Notes

- ⚠️ Always backup before running migrations
- ⚠️ Test migrations in dev/staging first
- ⚠️ Never commit database credentials to version control
- ⚠️ Use environment variables for database connection
- ⚠️ Limit database user permissions to only what's needed

## 📚 Additional Resources

- [MySQL ALTER TABLE Documentation](https://dev.mysql.com/doc/refman/8.0/en/alter-table.html)
- Project Documentation: See `../../MODERADORES_VS_USUARIOS.md` for business context
- Project Root Documentation: See various `*.md` files in project root

---

**Last Updated**: December 30, 2024  
**Maintained By**: Development Team
