# Customer Module Testing Instructions

## Overview
This document provides instructions for testing the enhanced customer module features.

## Prerequisites
- Database setup with Prisma migrations applied
- Application running on `http://localhost:3000`
- Authentication configured (Discord OAuth)

## Features to Test

### 1. Customer Overview Page (`/customer`)

#### Test: Create Customer via Modal
1. Navigate to `/customer`
2. Click the "Add Customer" button (top right with plus icon)
3. A modal should appear with the title "Create New Customer"
4. Fill in the form:
   - First Name * (required): "John"
   - Last Name * (required): "Doe"
   - Email: "john.doe@example.com"
   - Phone: "+1 234 567 8900"
5. Click "Create" button
6. Modal should close and new customer should appear in the list
7. **Expected**: Customer created successfully, modal closes, list refreshes

#### Test: Search/Filter Customers
1. On the customers overview page
2. Use the search bar at the top
3. Type a customer name or email
4. **Expected**: Customer list filters in real-time to show only matching customers
5. Clear the search
6. **Expected**: All customers displayed again

#### Test: Inline Edit Customer
1. Find a customer card in the list
2. Click the "Edit" button (pencil icon)
3. The card should expand to show editable fields
4. Modify the customer information
5. Click "Save" (checkmark icon)
6. **Expected**: Changes saved, card returns to display mode

#### Test: Delete Customer
1. Find a customer card
2. Click the "Delete" button (trash icon, red)
3. Confirm deletion in the dialog
4. **Expected**: Customer removed from the list

#### Test: View Customer Details
1. Find a customer card
2. Click the "View" button (eye icon)
3. **Expected**: Navigate to customer detail page

### 2. Customer Detail Page (`/customer/[id]`)

#### Test: View Customer Information
1. Navigate to a customer detail page
2. **Expected**: Display shows:
   - Customer name as page title
   - Contact Information section (readonly by default)
   - Addresses section
   - Projects section
   - Print Jobs section
   - Subscriptions section
   - Expenses section

#### Test: Edit Customer Information
1. On customer detail page
2. Click "Edit Customer" button (top right, purple)
3. **Expected**: Contact Information fields become editable
4. Modify fields (firstname, lastname, email, phone)
5. Click "Save Changes" button
6. **Expected**: 
   - Changes saved to database
   - Fields return to readonly display
   - Success feedback (no errors)

#### Test: Cancel Edit
1. Click "Edit Customer"
2. Make changes to fields
3. Click "Cancel" button
4. **Expected**: Changes discarded, original values restored

#### Test: Add Address
1. In Addresses section, click "Add Address" button
2. A modal should appear: "Add New Address"
3. Fill in the form:
   - Street * (required): "123 Main St"
   - Number: "Apt 4B"
   - City * (required): "New York"
   - State: "NY"
   - Zip Code: "10001"
   - Country: "USA"
4. Click "Add Address"
5. **Expected**: 
   - Modal closes
   - New address appears in the address list
   - Page refreshes to show updated data

#### Test: Delete Address
1. Find an address card in the Addresses section
2. Click the delete button (trash icon, red)
3. Confirm deletion
4. **Expected**: Address removed from list

#### Test: View Related Items
1. Scroll through the detail page
2. **Expected**: All related items displayed:
   - Active projects (clickable links)
   - Active print jobs
   - All subscriptions
   - All expenses
3. Click a project link
4. **Expected**: Navigate to project detail page

#### Test: Delete Customer
1. Click "Delete" button (top right, red)
2. Confirm deletion
3. **Expected**: Redirect to customer overview page

### 3. Parent-Child Relationship Component

The `ParentChildRelationship` component is a generic component for self-referential models.

#### Usage Example (for Projects)
```tsx
import { ParentChildRelationship } from "@/components/ParentChildRelationship";

<ParentChildRelationship
  items={projects}
  currentItemId={currentProject.id}
  onItemClick={(project) => navigateToProject(project.id)}
/>
```

#### Test: Hierarchical Display
1. Navigate to a page using the component (e.g., Projects with parent-child relationships)
2. **Expected**:
   - Root items shown at top level
   - Child items indented under parents
   - Visual hierarchy clear with icons (folder/folder-open)
   - Current item highlighted
   - Max depth warning if hierarchy too deep (>5 levels)

## API Testing

### Test: Customer API Endpoints
```bash
# Get all customers
GET /api/customer

# Get customer with relations
GET /api/customer/[id]?relations={"addresses":true,"projects":true,"printJobs":true,"subscriptions":true,"expenses":true}

# Create customer
POST /api/customer
Content-Type: application/json
{
  "firstname": "Jane",
  "lastname": "Smith",
  "email": "jane@example.com",
  "phone": "+1 555 0100"
}

# Update customer
PUT /api/customer/[id]
Content-Type: application/json
{
  "firstname": "Jane Updated"
}

# Delete customer
DELETE /api/customer/[id]
```

### Test: Address API Endpoints
```bash
# Create address
POST /api/address
Content-Type: application/json
{
  "street": "456 Oak Ave",
  "city": "Boston",
  "state": "MA",
  "zipCode": "02101",
  "customerId": "[customer-id]"
}

# Delete address
DELETE /api/address/[id]
```

## Error Handling Tests

### Test: Create Customer with Missing Required Fields
1. Open create modal
2. Leave First Name or Last Name empty
3. Click "Create"
4. **Expected**: Alert shown: "Please fill in first and last name"

### Test: Network Error Handling
1. Simulate network error (disconnect internet or use dev tools)
2. Try to create/update/delete customer
3. **Expected**: Error alert shown, loading state cleared

### Test: Delete Non-existent Customer
1. Try to delete a customer that doesn't exist
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

### Accessibility Checks
- [ ] Modal can be closed with Escape key
- [ ] Buttons have appropriate icons
- [ ] Form fields have labels
- [ ] Required fields marked with *
- [ ] Error messages are clear and helpful

## Performance Tests
1. Create 50+ customers
2. Test search/filter performance
3. **Expected**: Instant filtering, no lag

## Regression Tests
1. Verify existing functionality still works:
   - [ ] Navigation to customer pages
   - [ ] Links to related projects
   - [ ] Print jobs association
   - [ ] Invoice creation from customer

## Browser Compatibility
Test in:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

## Summary Checklist
- [ ] Customer creation via modal works
- [ ] Customer search/filter works
- [ ] Inline editing on overview page works
- [ ] Customer detail page shows all relations
- [ ] Edit mode toggle works
- [ ] Address management (add/delete) works
- [ ] All API calls use Prisma types
- [ ] No hardcoded values used
- [ ] Loading and error states handled
- [ ] Old create page removed
- [ ] ParentChildRelationship component is reusable
- [ ] Code follows existing conventions
- [ ] Linting passes with no new errors

## Known Limitations
- The Field component doesn't support disabled prop, so we use conditional rendering for edit/view modes
- The ParentChildRelationship component has a max depth of 5 levels to prevent infinite recursion

## Next Steps
After testing, consider:
1. Adding similar modal creation to other modules (projects, subscriptions, etc.)
2. Extending ParentChildRelationship with expand/collapse functionality
3. Adding bulk operations (bulk delete, bulk edit)
4. Adding export functionality (CSV, PDF)
5. Adding more advanced filtering (by date, by status, by project count, etc.)
