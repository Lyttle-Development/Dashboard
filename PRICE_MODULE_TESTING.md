# Price Module Testing Guide

## Overview
This document provides comprehensive testing instructions for the Price module enhancement, including modal-based creation, overview filtering, detail page editing, and relation management.

## Prerequisites
- Database seeded with categories
- Access to the Dashboard application
- Browser with developer tools

## Module Structure

### Pages
1. **Overview Page** (`/price`) - List view with modal creation
2. **Detail Page** (`/price/[id]`) - Full CRUD with edit mode

### API Endpoints
- `GET /api/servicePrice` - Fetch all prices with relations
- `GET /api/servicePrice/[id]` - Fetch single price with relations
- `POST /api/servicePrice` - Create new price
- `PUT /api/servicePrice/[id]` - Update price
- `DELETE /api/servicePrice/[id]` - Delete price

## Test Scenarios

### 1. Overview Page Tests

#### 1.1 Modal Creation Flow
**Steps:**
1. Navigate to `/price`
2. Click "Create Price" button
3. Modal should appear with form fields:
   - Service Name (required)
   - Price (required, number input)
   - Category (searchable dropdown)
   - Interval (searchable dropdown: One Time, Hourly, Daily, Weekly, Monthly, Yearly)
   - Description (optional)
   - Notes (optional)
4. Fill in required fields
5. Click "Create Price"
6. Modal should close
7. New price should appear in the list

**Expected Results:**
- Modal opens and closes smoothly
- Form validation prevents creation without required fields
- New price appears immediately after creation
- All fields save correctly

#### 1.2 Search Filtering
**Steps:**
1. Navigate to `/price`
2. Enter text in the search field
3. Observe filtered results

**Test Cases:**
- Search by service name
- Search by description
- Search with partial matches
- Clear search to show all results

**Expected Results:**
- Results filter in real-time
- Search is case-insensitive
- Empty state appears when no matches

#### 1.3 Category Filtering
**Steps:**
1. Navigate to `/price`
2. Select a category from the dropdown
3. Observe filtered results
4. Select "All Categories"

**Expected Results:**
- Only prices in selected category appear
- Dropdown is searchable
- "All Categories" shows all prices
- Statistics update based on filters

#### 1.4 Delete Functionality
**Steps:**
1. Navigate to `/price`
2. Click "Delete" button on a price card
3. Confirm deletion in the dialog
4. Price should be removed from the list

**Expected Results:**
- Confirmation dialog appears
- Price is removed after confirmation
- Canceling keeps the price
- List updates immediately

### 2. Detail Page Tests

#### 2.1 View Mode
**Steps:**
1. Navigate to `/price/[id]`
2. Observe the readonly display

**Expected Results:**
- Service name displayed as page title
- All price information shown using KeyValue components:
  - Service
  - Price (formatted as currency)
  - Category
  - Interval
  - Description
  - Notes
- Edit button visible in header

#### 2.2 Edit Mode Toggle
**Steps:**
1. Navigate to `/price/[id]`
2. Click "Edit" button
3. Observe form fields appear
4. Click "Cancel" button
5. Observe return to view mode

**Expected Results:**
- Edit button changes to Save/Cancel buttons
- KeyValue components replaced with Field/Select components
- All current values pre-populated
- Cancel restores original view without saving

#### 2.3 Editing Price Information
**Steps:**
1. Navigate to `/price/[id]`
2. Click "Edit" button
3. Modify price fields:
   - Change service name
   - Update price amount
   - Select different category
   - Change interval
   - Update description
   - Update notes
4. Click "Save" button

**Expected Results:**
- All fields are editable
- Category dropdown is searchable
- Interval dropdown is searchable
- Changes persist after save
- Page returns to view mode
- Updated values display correctly

#### 2.4 Relations Display
**Steps:**
1. Navigate to `/price/[id]`
2. Scroll to Relations section
3. Observe all related items

**Expected Results:**
- **Projects** section shows count and list
- **Print Jobs** section shows count and list
- **Invoices** section shows count and list with amount
- Empty state message when no relations
- All relation cards styled consistently

### 3. Integration Tests

#### 3.1 Create → View → Edit Flow
**Steps:**
1. Create a new price via modal
2. Click "View" on the new price
3. Verify all information displays correctly
4. Click "Edit"
5. Make changes
6. Save and verify

#### 3.2 Category Assignment
**Steps:**
1. Create a price with a specific category
2. View the price detail page
3. Verify category displays correctly
4. Edit and change category
5. Save and verify new category

#### 3.3 Search and Filter
**Steps:**
1. Create several prices with different categories and services
2. Test search with each price's service name
3. Filter by each category
4. Combine search and category filter

## API Testing

### Create Price
```bash
curl -X POST http://localhost:3000/api/servicePrice \
  -H "Content-Type: application/json" \
  -d '{
    "service": "Web Development",
    "price": 85.00,
    "categoryId": "category-uuid",
    "interval": "HOURLY",
    "description": "Custom web application development",
    "notes": "Includes design and testing"
  }'
```

### Get All Prices
```bash
curl http://localhost:3000/api/servicePrice?relations=true
```

### Get Single Price
```bash
curl http://localhost:3000/api/servicePrice/[price-uuid]?relations=true
```

### Update Price
```bash
curl -X PUT http://localhost:3000/api/servicePrice/[price-uuid] \
  -H "Content-Type: application/json" \
  -d '{
    "service": "Updated Service Name",
    "price": 95.00,
    "categoryId": "new-category-uuid"
  }'
```

### Delete Price
```bash
curl -X DELETE http://localhost:3000/api/servicePrice/[price-uuid]
```

## Error Handling Tests

### 1. Missing Required Fields
**Steps:**
1. Open create modal
2. Leave service name or price empty
3. Attempt to create

**Expected:** Validation prevents creation

### 2. Invalid Price Amount
**Steps:**
1. Open create modal
2. Enter negative or non-numeric price
3. Attempt to create

**Expected:** Validation shows error

### 3. Network Errors
**Steps:**
1. Disconnect network
2. Attempt any operation
3. Observe error handling

**Expected:** User-friendly error message

### 4. Non-existent Price
**Steps:**
1. Navigate to `/price/invalid-uuid`

**Expected:** "Price not found" message

## Performance Tests

### 1. Large Dataset
**Steps:**
1. Seed database with 100+ prices
2. Navigate to overview page
3. Test search and filtering

**Expected:** Smooth performance, no lag

### 2. Many Relations
**Steps:**
1. Create price with many projects/printJobs
2. Navigate to detail page

**Expected:** All relations load and display properly

## Browser Compatibility

Test in:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## Accessibility Tests

1. Keyboard navigation through forms
2. Screen reader compatibility
3. Focus indicators visible
4. ARIA labels present

## Summary Checklist

- [ ] Modal creation works
- [ ] Search filtering works
- [ ] Category filtering works
- [ ] Delete functionality works with confirmation
- [ ] Detail page displays all information
- [ ] Edit mode toggle works
- [ ] All fields editable and saveable
- [ ] Category dropdown searchable
- [ ] Interval dropdown searchable
- [ ] All 4 relations display correctly
- [ ] Dark/purple theme consistent
- [ ] Loading states display
- [ ] Error handling works
- [ ] API endpoints functional
- [ ] Responsive design works
- [ ] Statistics update with filters

## Notes

- All selects are searchable for better UX
- Price amounts formatted as currency (€)
- Empty states guide users
- Confirmation dialogs prevent accidental deletions
- Dark/purple theme matches application design system
- Old create page and category-based pages removed
