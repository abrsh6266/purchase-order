# GL Account Management System

A comprehensive, professional GL Account management system with modal interface, hierarchical views, and advanced analytics.

## Features

### 🏦 **Professional Modal Interface**
- **Tabbed Interface**: List view, hierarchy view, and statistics
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Professional Styling**: Clean, modern UI with intuitive navigation

### 📊 **Multiple View Modes**
1. **List View**: Traditional table with search, filtering, and pagination
2. **Hierarchy View**: Tree structure showing parent-child relationships
3. **Statistics View**: Analytics and usage metrics
4. **Details View**: Comprehensive account information

### 🔍 **Advanced Search & Filtering**
- **Real-time Search**: Debounced search across account codes and names
- **Type Filtering**: Filter by account type (Asset, Liability, Equity, Revenue, Expense)
- **Status Filtering**: Filter by active/inactive status
- **Sorting**: Sort by any column with server-side pagination

### 📈 **Analytics & Statistics**
- **Account Distribution**: Visual breakdown by account type
- **Usage Statistics**: Track accounts with children and line items
- **Most Used Accounts**: Identify frequently used accounts
- **Performance Metrics**: Active vs inactive account ratios

### 🏗️ **Hierarchical Management**
- **Parent-Child Relationships**: Create nested account structures
- **Tree Visualization**: Intuitive tree view with expand/collapse
- **Validation**: Prevents circular references and invalid hierarchies

## Components

### Core Components

#### `GLAccountModal`
The main modal component that orchestrates the entire GL Account management experience.

**Props:**
- `visible`: Controls modal visibility
- `onClose`: Callback when modal is closed
- `onSelect`: Optional callback for account selection mode
- `mode`: 'select' | 'manage' - determines available actions
- `selectedAccountId`: Optional pre-selected account ID

**Usage:**
```tsx
<GLAccountModal
  visible={showModal}
  onClose={() => setShowModal(false)}
  onSelect={handleAccountSelect}
  mode="manage"
/>
```

#### `GLAccountForm`
Professional form for creating and editing GL accounts.

**Features:**
- **Validation**: Real-time validation with error messages
- **Parent Selection**: Dropdown for selecting parent accounts
- **Account Types**: Predefined account type options with descriptions
- **Status Toggle**: Active/inactive status control

#### `GLAccountList`
Advanced table component with search, filtering, and pagination.

**Features:**
- **Debounced Search**: Prevents excessive API calls
- **Server-side Pagination**: Efficient data loading
- **Action Buttons**: View, edit, delete, and select actions
- **Statistics Cards**: Overview metrics at the top

#### `GLAccountHierarchy`
Tree view component for hierarchical account visualization.

**Features:**
- **Expand/Collapse**: Control tree visibility
- **Visual Indicators**: Icons for parent/child accounts
- **Quick Actions**: Inline action buttons
- **Usage Tags**: Show child count and line item usage

#### `GLAccountStats`
Analytics component with comprehensive statistics.

**Features:**
- **Account Distribution**: Visual breakdown by type
- **Usage Analytics**: Track account usage patterns
- **Performance Metrics**: Active vs inactive ratios
- **Most Used Accounts**: Top accounts by line item usage

## Integration

### Purchase Order Line Items
The GL Account system integrates seamlessly with purchase order line items:

```tsx
// In PurchaseOrderLineItemRow component
<Space.Compact style={{ width: '100%' }}>
  <Select
    value={localData.glAccountId}
    onChange={(value) => handleFieldChange('glAccountId', value)}
    placeholder="Select account (required)"
    options={glAccountOptions}
    showSearch
    optionFilterProp="label"
  />
  <Tooltip title="Manage GL Accounts">
    <Button
      type="default"
      icon={<BankOutlined />}
      onClick={() => setShowGLAccountModal(true)}
    />
  </Tooltip>
</Space.Compact>

<GLAccountModal
  visible={showGLAccountModal}
  onClose={() => setShowGLAccountModal(false)}
  onSelect={handleGLAccountSelect}
  mode="select"
/>
```

### Hook Integration
The system uses a custom hook for state management:

```tsx
const {
  glAccounts,
  loading,
  error,
  pagination,
  filters,
  fetchGLAccounts,
  createGLAccount,
  updateGLAccount,
  deleteGLAccount,
  setFilters,
  clearFilters,
} = useGLAccounts({
  autoFetch: true,
  pageSize: 10,
});
```

## Database Schema

### GLAccount Model
```prisma
model GLAccount {
  id          String   @id @default(uuid())
  accountCode String   @unique @db.VarChar(20)
  accountName String   @db.VarChar(255)
  accountType String   @db.VarChar(50) // ASSET, LIABILITY, EQUITY, REVENUE, EXPENSE
  description String?  @db.Text
  isActive    Boolean  @default(true)
  parentId    String?  // For hierarchical accounts
  parent      GLAccount? @relation("GLAccountHierarchy", fields: [parentId], references: [id])
  children    GLAccount[] @relation("GLAccountHierarchy")
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  lineItems   PurchaseOrderLineItem[]

  @@map("gl_accounts")
}
```

## Setup Instructions

### 1. Database Migration
```bash
cd backend
npm run prisma:migrate:dev
```

### 2. Seed Data
```bash
npm run prisma:seed
```

This will create sample GL accounts with hierarchical structure for testing.

### 3. Backend API
The backend provides comprehensive GL Account APIs:

- `GET /gl-accounts` - List accounts with filtering and pagination
- `POST /gl-accounts` - Create new account
- `GET /gl-accounts/:id` - Get account details
- `PATCH /gl-accounts/:id` - Update account
- `DELETE /gl-accounts/:id` - Delete account
- `GET /gl-accounts/hierarchy` - Get hierarchical structure
- `GET /gl-accounts/active` - Get active accounts only

### 4. Frontend Integration
The components are ready to use in your React application:

```tsx
import { GLAccountModal } from './components/gl-accounts/GLAccountModal';

// In your component
const [showModal, setShowModal] = useState(false);

<Button onClick={() => setShowModal(true)}>
  Manage GL Accounts
</Button>

<GLAccountModal
  visible={showModal}
  onClose={() => setShowModal(false)}
  mode="manage"
/>
```

## Demo Page

Visit `/gl-accounts` to see the demo page showcasing all features:

- **Management Mode**: Full CRUD operations
- **Selection Mode**: Simplified account selection
- **Feature Overview**: Key capabilities demonstration

## Best Practices

### 1. **Account Naming**
- Use consistent naming conventions
- Include account codes for easy identification
- Provide clear descriptions

### 2. **Hierarchy Design**
- Keep hierarchies shallow (max 3-4 levels)
- Use meaningful parent accounts
- Avoid circular references

### 3. **Performance**
- Use pagination for large datasets
- Implement debounced search
- Cache frequently accessed accounts

### 4. **Validation**
- Validate account codes for uniqueness
- Check for circular references
- Prevent deletion of accounts in use

## Troubleshooting

### Infinite Loop Issues
If you encounter infinite loops, check:

1. **useEffect Dependencies**: Ensure proper dependency arrays
2. **Callback Functions**: Use `useCallback` for event handlers
3. **State Updates**: Avoid updating state in render functions

### API Errors
Common issues and solutions:

1. **404 Errors**: Ensure backend routes are properly configured
2. **Validation Errors**: Check required fields and data types
3. **Database Errors**: Verify database connection and schema

### Performance Issues
For performance optimization:

1. **Debounce Search**: Implement search debouncing
2. **Pagination**: Use server-side pagination
3. **Caching**: Cache frequently accessed data
4. **Lazy Loading**: Load components on demand

## Future Enhancements

### Planned Features
- **Bulk Operations**: Import/export accounts
- **Advanced Analytics**: Charts and graphs
- **Audit Trail**: Track account changes
- **Multi-currency Support**: International account standards
- **Integration APIs**: Connect with external accounting systems

### Customization Options
- **Themes**: Custom color schemes
- **Layouts**: Flexible component arrangements
- **Permissions**: Role-based access control
- **Workflows**: Approval processes for account changes

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review the component documentation
3. Examine the demo page for examples
4. Check browser console for error messages

The GL Account management system provides a professional, user-friendly interface for managing general ledger accounts with advanced features and comprehensive analytics. 