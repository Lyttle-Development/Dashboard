# Expense Module Testing Instructions

## Overview
This document provides instructions for testing the enhanced expense module features.

## Prerequisites
- Database setup with Prisma migrations applied
- Application running on `http://localhost:3000`
- Authentication configured (Discord OAuth)

## Features to Test

### 1. Expense Overview Page (`/expense`)

#### Test: Create Expense via Modal
1. Navigate to `/expense`
2. Click the "Create Expense" button (top right with plus icon)
3. A modal should appear with the title "Create New Expense"
4. Fill in the form:
   - Name * (required): "New Office Supplies"
   - Link: "https://example.com/supplies"
   - Unit Price: "50.00"
   - Quantity: "2"
   - Customer: Select a customer from dropdown (optional)
   - Status * (required): Select a status from dropdown
   - Needed At: Select a date (optional)
5. Click "Create" button
6. Modal should close and new expense should appear in the list
7. **Expected**: Expense created successfully, modal closes, list refreshes

#### Test: Search/Filter Expenses
1. On the expenses overview page
2. Use the search bar at the top
3. Type an expense name
4. **Expected**: Expense list filters in real-time to show only matching expenses
5. Clear the search
6. **Expected**: All expenses displayed again

#### Test: Delete Expense
1. Find an expense card in the list
2. Click the "Delete" button (trash icon, red)
3. Confirm deletion in the dialog
4. **Expected**: Expense removed from the list

#### Test: View Expense Details
1. Find an expense card
2. Click the "View" button (eye icon)
3. **Expected**: Navigate to expense detail page

### 2. Expense Detail Page (`/expense/[id]`)

#### Test: View Expense Information
1. Navigate to an expense detail page
2. **Expected**: Display shows:
   - Expense name as page title
   - Expense Information section (readonly by default) showing:
     - Name
     - Unit Price
     - Quantity
     - Total Amount
     - Needed At
     - Link
   - Relations section showing:
     - Customer (if assigned)
     - Status

#### Test: Edit Expense Information
1. On expense detail page
2. Click "Edit Expense" button (top right, purple)
3. **Expected**: Expense Information fields become editable
4. Modify fields (name, unit price, quantity, needed at, link)
5. Click "Save Changes" button
6. **Expected**: 
   - Changes saved to database
   - Fields return to readonly display
   - Success feedback (no errors)

#### Test: Cancel Edit
1. Click "Edit Expense"
2. Make changes to fields
3. Click "Cancel" button
4. **Expected**: Changes discarded, original values restored

#### Test: Edit Customer Relation
1. Click "Edit Expense"
2. In the Relations section, change the Customer dropdown
3. Click "Save Changes"
4. **Expected**: Customer relation updated successfully

#### Test: Edit Status Relation
1. Click "Edit Expense"
2. In the Relations section, change the Status dropdown
3. Click "Save Changes"
4. **Expected**: Status relation updated successfully

#### Test: Delete Expense
1. Click "Delete" button (top right, red)
2. Confirm deletion
3. **Expected**: Redirect to expense overview page

### 3. API Testing

#### Test: Expense API Endpoints
```bash
# Get all expenses with relations
GET /api/expense?relations={"customer":true,"status":true}

# Get expense with relations
GET /api/expense/[id]?relations={"customer":true,"status":true}

# Create expense
POST /api/expense
Content-Type: application/json
{
  "name": "Test Expense",
  "link": "https://example.com",
  "unitPrice": 100,
  "quantity": 1,
  "customerId": "[customer-id]",
  "statusId": "[status-id]"
}

# Update expense
PUT /api/expense/[id]
Content-Type: application/json
{
  "name": "Updated Expense",
  "unitPrice": 150,
  "customerId": "[customer-id]",
  "statusId": "[status-id]"
}

# Delete expense
DELETE /api/expense/[id]
```

## Error Handling Tests

### Test: Create Expense with Missing Required Fields
1. Open create modal
2. Leave Name or Status empty
3. Click "Create"
4. **Expected**: Alert shown: "Please fill in expense name and select a status"

### Test: Network Error Handling
1. Simulate network error (disconnect internet or use dev tools)
2. Try to create/update/delete expense
3. **Expected**: Error alert shown, loading state cleared

### Test: Delete Non-existent Expense
1. Try to delete an expense that doesn't exist
2. **Expected**: Error alert shown

## UI/UX Validation

### Visual Checks
- [ ] Modal appears centered on screen with backdrop
- [ ] Modal has close button (X) and closes on backdrop click
- [ ] Buttons have correct colors (primary=purple, danger=red)
- [ ] Loading states show "Creating...", "Saving...", etc.
- [ ] Empty states show appropriate messages
- [ ] Cards have hover effects (border color change, shadow, slight lift)
- [ ] Search bar has search icon
- [ ] Forms are responsive (mobile/tablet/desktop)
- [ ] All UI elements use dark/purple theme
- [ ] Info items have dark purple background with borders
- [ ] Sections have proper shadows and spacing

### Accessibility Checks
- [ ] Modal can be closed with Escape key
- [ ] Buttons have appropriate icons
- [ ] Form fields have labels
- [ ] Required fields marked with *
- [ ] Error messages are clear and helpful

## Comparison with Customer Module

The expense module should behave similarly to the customer module:
- Both have modal-based creation
- Both have edit mode toggle on detail pages
- Both show relations that can be edited
- Both have consistent dark/purple theme styling

## Summary Checklist
- [ ] Expense creation via modal works
- [ ] Expense search/filter works
- [ ] Expense detail page shows all relations
- [ ] Edit mode toggle works
- [ ] Customer and status can be changed
- [ ] All API calls use Prisma types
- [ ] No hardcoded values used
- [ ] Loading and error states handled
- [ ] Old create page removed
- [ ] Dark/purple theme styling consistent
- [ ] Code follows existing conventions
- [ ] Linting passes with no new errors

## Known Limitations
- The Field component doesn't support disabled prop, so we use conditional rendering for edit/view modes
- Customer selection is optional (can be set to "No customer")

## Next Steps
After testing, consider:
1. Adding bulk operations (bulk delete, bulk edit)
2. Adding export functionality (CSV, PDF)
3. Adding more advanced filtering (by status, by date range, by customer)
4. Adding expense categories
5. Adding recurring expense automation
