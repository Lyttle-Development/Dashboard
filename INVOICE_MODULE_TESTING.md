# Invoice Module Testing Guide

## Overview

This document provides comprehensive testing instructions for the Invoice module enhancements, including modal-based creation, hierarchical filtering, detail page with edit functionality, and relation management.

## Prerequisites

1. Ensure the database is running and seeded with test data
2. Start the development server: `npm run dev`
3. Navigate to the invoice module: `http://localhost:3000/invoice`

## Test Scenarios

### 1. Invoice Overview Page

#### 1.1 HierarchicalFilter Testing
**Objective**: Verify that the hierarchical filter (customer → project) works correctly

**Steps**:
1. Navigate to `/invoice`
2. Observe that no invoices are shown initially (requires customer selection)
3. Click on the customer dropdown in the HierarchicalFilter
4. Search for a customer by typing in the search box
5. Select a customer
6. Verify that invoices for that customer are displayed
7. Click on the project dropdown (if available)
8. Select a project
9. Verify that only invoices associated with that project are shown
10. Clear the project filter
11. Verify all customer invoices are shown again

**Expected Result**:
- Customer filter is required to show invoices
- Project filter further narrows down results
- Search functionality works in all dropdowns
- Statistics update based on filtered invoices

#### 1.2 Create Invoice Modal Testing
**Objective**: Verify that the modal creation flow works correctly

**Steps**:
1. Click the "Create Invoice" button in the header
2. Verify the modal opens with the following fields:
   - Customer (dropdown, required)
   - Status (dropdown, required)
   - Invoice Date (date picker, defaults to today)
   - Amount (number input)
   - Price Reference (dropdown, optional)
3. Try to submit without selecting customer → should show validation error
4. Try to submit without selecting status → should show validation error
5. Fill in all required fields:
   - Select a customer (use search)
   - Select a status (e.g., "Open" or "Unpaid")
   - Keep default date or change it
   - Enter an amount (e.g., 1500.00)
6. Click "Create Invoice"
7. Verify the modal closes
8. Verify the new invoice appears in the list (if customer is selected in filter)

**Expected Result**:
- Modal opens and displays correctly
- All dropdowns are searchable
- Validation prevents submission without required fields
- Invoice is created successfully
- List refreshes to show the new invoice

#### 1.3 Invoice Statistics Testing
**Objective**: Verify that statistics update based on filtered invoices

**Steps**:
1. Select a customer with multiple invoices
2. Note the statistics:
   - Total Invoices (count)
   - Open Invoices (count of non-paid)
   - Total Amount (sum of amounts)
3. Apply a project filter
4. Verify statistics update to reflect only filtered invoices
5. Remove the project filter
6. Verify statistics return to customer-level totals

**Expected Result**:
- Statistics accurately reflect filtered invoices
- Totals recalculate when filters change

#### 1.4 Delete Invoice Testing
**Objective**: Verify that invoice deletion works correctly

**Steps**:
1. Locate an invoice in the list
2. Click the delete button (trash icon)
3. Confirm the deletion in the confirmation dialog
4. Verify the invoice is removed from the list
5. Verify statistics update accordingly

**Expected Result**:
- Confirmation dialog appears
- Invoice is deleted from database
- List updates without the deleted invoice
- No errors occur

### 2. Invoice Detail Page

#### 2.1 View Mode Testing
**Objective**: Verify that invoice details are displayed correctly in read-only mode

**Steps**:
1. From the overview page, click "View Details" on any invoice
2. Verify navigation to `/invoice/[id]`
3. Verify the following information is displayed:
   - Customer name
   - Status
   - Invoice Date
   - Amount (formatted as currency)
   - Price Reference (if any)
4. Verify the Relations section shows:
   - Projects (with count)
   - Print Jobs (with count)
5. Verify all information matches the data from the overview

**Expected Result**:
- All invoice details are visible
- Information is formatted correctly
- Relations are displayed properly
- Page has dark/purple theme styling

#### 2.2 Edit Mode Testing
**Objective**: Verify that invoice editing works correctly

**Steps**:
1. On the invoice detail page, click the "Edit Invoice" button
2. Verify the page enters edit mode:
   - Edit button is replaced with Save and Cancel buttons
   - Fields become editable (Field and Select components)
3. Change the customer using the dropdown (searchable)
4. Change the status using the dropdown (searchable)
5. Modify the invoice date
6. Change the amount
7. Click "Save"
8. Verify the changes are saved
9. Verify the page returns to view mode with updated information

**Expected Result**:
- Edit mode activates correctly
- All fields are editable
- Dropdowns are searchable
- Changes save successfully
- View mode displays updated data

#### 2.3 Cancel Edit Testing
**Objective**: Verify that canceling an edit discards changes

**Steps**:
1. Click "Edit Invoice"
2. Make changes to several fields
3. Click "Cancel"
4. Verify the page returns to view mode
5. Verify no changes were saved (original data is displayed)

**Expected Result**:
- Cancel button discards all changes
- Page returns to view mode
- Original data is preserved

#### 2.4 Edit Validation Testing
**Objective**: Verify that edit validation works correctly

**Steps**:
1. Click "Edit Invoice"
2. Try to clear required fields (if possible via UI)
3. Try to save with invalid data
4. Verify appropriate error messages

**Expected Result**:
- Required fields are enforced
- Invalid data prevents saving
- Appropriate error messages are shown

### 3. API Integration Testing

#### 3.1 Fetch Invoices with Relations
**Test via browser console or API client**:

```javascript
// Fetch all invoices with relations
const response = await fetch('/api/invoice?relations[customer]=true&relations[status]=true&relations[projects]=true&relations[printJobs]=true&relations[price]=true');
const invoices = await response.json();
console.log(invoices);
```

**Expected Result**:
- All invoices returned with nested relations
- Customer, status, projects, printJobs, and price included

#### 3.2 Create Invoice via API
**Test via browser console or API client**:

```javascript
// Create a new invoice
const response = await fetch('/api/invoice', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    invoiceDate: new Date().toISOString(),
    amount: 2500.00,
    customerId: 'existing-customer-id',
    statusId: 'existing-status-id',
  })
});
const newInvoice = await response.json();
console.log(newInvoice);
```

**Expected Result**:
- Invoice created successfully
- Returns the new invoice object with ID

#### 3.3 Update Invoice via API
**Test via browser console or API client**:

```javascript
// Update an invoice
const response = await fetch('/api/invoice/invoice-id', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    amount: 3000.00,
    statusId: 'different-status-id',
  })
});
const updated = await response.json();
console.log(updated);
```

**Expected Result**:
- Invoice updated successfully
- Returns updated invoice object

#### 3.4 Delete Invoice via API
**Test via browser console or API client**:

```javascript
// Delete an invoice
const response = await fetch('/api/invoice/invoice-id', {
  method: 'DELETE'
});
console.log(response.status); // Should be 200
```

**Expected Result**:
- Invoice deleted successfully
- Returns success status

## Edge Cases and Error Handling

### 4.1 Empty States
**Test**:
1. Navigate to `/invoice` without selecting a customer
2. Verify empty state message: "Select a Customer"
3. Select a customer with no invoices
4. Verify empty state message: "No Invoices Found"

**Expected Result**:
- Appropriate empty states are shown
- Messages are clear and helpful

### 4.2 Loading States
**Test**:
1. Navigate to `/invoice` (slow network simulation)
2. Verify loader is shown while fetching data
3. Navigate to invoice detail page
4. Verify loader is shown while fetching invoice
5. Click "Save" after editing
6. Verify button is disabled during save

**Expected Result**:
- Loading states prevent duplicate actions
- User is informed when operations are in progress

### 4.3 Error Handling
**Test**:
1. Try to create an invoice with invalid data
2. Try to delete an invoice that doesn't exist
3. Try to update an invoice with server error simulation

**Expected Result**:
- Errors are caught and displayed
- User-friendly error messages
- Application doesn't crash

## UI/UX Validation

### 5.1 Dark Theme Consistency
**Checklist**:
- [ ] All cards use `$color-background-elevated`
- [ ] All inputs have dark purple backgrounds
- [ ] All selects use dark theme styling
- [ ] Focus states show purple glow
- [ ] Text colors use proper hierarchy
- [ ] Borders use design system values
- [ ] Shadows and transitions are consistent

### 5.2 Responsive Design
**Test**:
1. Resize browser window to mobile size
2. Verify layout adapts appropriately
3. Test modal on mobile
4. Test detail page on mobile

**Expected Result**:
- Layout is responsive
- Content is readable at all screen sizes
- Modals work on mobile

### 5.3 Searchable Selects
**Test**:
1. Open any select dropdown
2. Type to search
3. Verify results filter based on search term

**Expected Result**:
- All selects are searchable
- Search functionality works smoothly
- Results update in real-time

## Browser Compatibility

Test the invoice module in the following browsers:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

## Performance Testing

### 7.1 Large Dataset Handling
**Test**:
1. Create a customer with 50+ invoices
2. Select that customer in the filter
3. Verify page loads and performs well
4. Scroll through the invoice list
5. Open multiple invoice details

**Expected Result**:
- Page handles large datasets
- No performance degradation
- Smooth scrolling and interactions

## Accessibility Testing

### 8.1 Keyboard Navigation
**Test**:
1. Navigate the page using Tab key
2. Activate buttons using Enter/Space
3. Navigate modals using keyboard
4. Close modals using Escape

**Expected Result**:
- All interactive elements are keyboard accessible
- Focus indicators are visible
- Logical tab order

### 8.2 Screen Reader Testing
**Test** (if applicable):
1. Use a screen reader to navigate the page
2. Verify labels are read correctly
3. Verify form fields have proper labels
4. Verify error messages are announced

**Expected Result**:
- Page is screen reader friendly
- Content is properly labeled
- Semantic HTML is used

## Summary

All test scenarios should pass before considering the invoice module complete. Document any failures or issues discovered during testing.

## Components Used

### Reused Components:
- `Modal` - For invoice creation dialog
- `HierarchicalFilter` - For customer → project filtering
- `Button`, `Icon`, `Loader`, `Container` - Existing UI components
- `fetchApi` - API utility
- `Field`, `Select` - Form components
- `KeyValue` - For readonly data display

### Extended Components:
- Invoice overview page - Added modal creation and delete functionality
- Invoice detail page - Created new page with edit mode

### Newly Created:
- Invoice detail page (`/invoice/[id]`) - Complete new page with CRUD functionality

## Notes

- All Prisma relations are properly displayed (customer, status, projects, printJobs, price)
- Edit functionality follows the same pattern as customer and expense modules
- Dark/purple theme is consistently applied
- All selects are searchable
- Proper loading and error states throughout
