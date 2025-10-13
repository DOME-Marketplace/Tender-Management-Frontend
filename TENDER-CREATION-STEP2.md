# Tender Creation - Step 2 Implementation

## ✅ Step 2 Complete: Completion Dates

After creating the coordinator quote with a title (Step 1), the modal now reopens automatically with Step 2, allowing users to set completion dates.

---

## 🎯 What's New in Step 2

### **Flow After Step 1**
```
User saves tender title (Step 1)
         ↓
createCoordinatorQuote API called
         ↓
Success: Quote created with ID
         ↓
Modal stays open, moves to Step 2 ✨
         ↓
Shows: Title (read-only) + Date fields
```

### **UI Features**

✅ **Title Display** - Shows the entered title (read-only) in a highlighted box  
✅ **Two Date Fields**:
  - Expected Quote Completion Date
  - Requested Quote Completion Date
✅ **Set Buttons** - Each date has a dedicated "Set" button  
✅ **Visual Feedback** - Checkmark (✓) when date is set  
✅ **Disabled After Set** - Date input and Set button disabled once set  
✅ **Greyed Out Save** - Main Save button disabled until both dates are set  
✅ **Tooltip on Hover** - "Complete all fields first" appears on hover  

---

## 📝 Step 2 UI Layout

```
┌─────────────────────────────────────────────┐
│  Create New Tender                        × │
├─────────────────────────────────────────────┤
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ Tender Title                        │   │
│  │ New IT Equipment Tender             │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  Expected Quote Completion Date *           │
│  ┌───────────────────────┐  ┌────────┐     │
│  │ [Date Picker]         │  │  Set   │     │
│  └───────────────────────┘  └────────┘     │
│  Format: DD/MM/YYYY                         │
│                                             │
│  Requested Quote Completion Date *          │
│  ┌───────────────────────┐  ┌────────┐     │
│  │ [Date Picker]         │  │  Set   │     │
│  └───────────────────────┘  └────────┘     │
│  Format: DD/MM/YYYY                         │
│                                             │
├─────────────────────────────────────────────┤
│                    [Cancel]  [Save]         │
│                             (greyed out)    │
└─────────────────────────────────────────────┘
```

**After Setting Dates:**
```
Expected Date: ✓ Set (disabled)
Requested Date: ✓ Set (disabled)
Save button: ENABLED
```

---

## 🔌 API Integration

### **1. Create Coordinator Quote (Step 1)**
```http
POST /quoteManagement/tendering/createCoordinatorQuote
{
  "customerMessage": "New IT Equipment Tender",
  "customerIdRef": "urn:ngsi-ld:individual:..."
}

Response: { id: "quote-xxx", ... }
```

### **2. Set Expected Date**
```http
PATCH /quoteManagement/updateQuoteDate/{quoteId}?date=15-10-2025&dateType=expected

Response: Updated quote with expectedQuoteCompletionDate
```

### **3. Set Requested Date**
```http
PATCH /quoteManagement/updateQuoteDate/{quoteId}?date=20-10-2025&dateType=requested

Response: Updated quote with requestedQuoteCompletionDate
```

---

## 💻 Code Implementation

### **New Component Properties**

```typescript
// Step 2: Date fields
expectedCompletionDate: string = '';
requestedCompletionDate: string = '';
expectedDateSet: boolean = false;
requestedDateSet: boolean = false;

// Track created quote
createdQuoteId: string | null = null;

// Track steps
tenderCreationStep: number = 1; // 1 = Title, 2 = Dates, ...
```

### **Updated saveInitialTender() Method**

```typescript
saveInitialTender() {
  // ... validation ...
  
  this.tenderService.createCoordinatorTender(userId, this.tenderTitle.trim()).subscribe({
    next: (createdTender) => {
      this.createdQuoteId = createdTender.id;
      this.notificationService.showSuccess('Tender created! Now set the completion dates.');
      
      // Move to Step 2 instead of closing ✨
      this.tenderCreationStep = 2;
    },
    error: (error) => {
      this.notificationService.showError('Failed to create tender');
    }
  });
}
```

### **New Methods**

#### **formatDateForAPI()**
```typescript
formatDateForAPI(dateString: string): string {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  return `${day}-${month}-${year}`; // Convert YYYY-MM-DD to DD-MM-YYYY
}
```

#### **setExpectedDate()**
```typescript
setExpectedDate() {
  if (!this.expectedCompletionDate || !this.createdQuoteId) {
    this.notificationService.showError('Please select a date');
    return;
  }

  this.tenderLoading = true;
  const formattedDate = this.formatDateForAPI(this.expectedCompletionDate);
  
  this.tenderService.updateTenderDate(this.createdQuoteId, formattedDate, 'expected').subscribe({
    next: (updatedTender) => {
      this.expectedDateSet = true;
      this.notificationService.showSuccess('Expected completion date set!');
      this.tenderLoading = false;
    },
    error: (error) => {
      this.notificationService.showError('Failed to set expected date');
      this.tenderLoading = false;
    }
  });
}
```

#### **setRequestedDate()**
```typescript
setRequestedDate() {
  // Similar to setExpectedDate but with 'requested' dateType
  const formattedDate = this.formatDateForAPI(this.requestedCompletionDate);
  
  this.tenderService.updateTenderDate(this.createdQuoteId, formattedDate, 'requested').subscribe({
    next: (updatedTender) => {
      this.requestedDateSet = true;
      this.notificationService.showSuccess('Requested completion date set!');
    },
    // ... error handling
  });
}
```

#### **isStep2Complete()**
```typescript
isStep2Complete(): boolean {
  return this.expectedDateSet && this.requestedDateSet;
}
```

---

## 🎨 Template Changes

### **Step 2 Section**

```html
<!-- Step 2: Completion Dates -->
<div *ngIf="tenderCreationStep === 2">
  
  <!-- Display Title (Read-only) -->
  <div class="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
    <label class="block text-sm font-medium text-gray-700 mb-2">Tender Title</label>
    <p class="text-gray-900 font-medium">{{ tenderTitle }}</p>
  </div>

  <!-- Expected Completion Date -->
  <div class="mb-6">
    <label>Expected Quote Completion Date *</label>
    <div class="flex items-center space-x-3">
      <input 
        type="date" 
        [(ngModel)]="expectedCompletionDate"
        [disabled]="expectedDateSet"
      />
      <button 
        (click)="setExpectedDate()" 
        [disabled]="!expectedCompletionDate || expectedDateSet || tenderLoading"
      >
        {{ expectedDateSet ? '✓ Set' : 'Set' }}
      </button>
    </div>
    <p class="mt-1 text-xs text-gray-500">Format: DD/MM/YYYY</p>
  </div>

  <!-- Requested Completion Date -->
  <div class="mb-6">
    <label>Requested Quote Completion Date *</label>
    <div class="flex items-center space-x-3">
      <input 
        type="date" 
        [(ngModel)]="requestedCompletionDate"
        [disabled]="requestedDateSet"
      />
      <button 
        (click)="setRequestedDate()" 
        [disabled]="!requestedCompletionDate || requestedDateSet || tenderLoading"
      >
        {{ requestedDateSet ? '✓ Set' : 'Set' }}
      </button>
    </div>
    <p class="mt-1 text-xs text-gray-500">Format: DD/MM/YYYY</p>
  </div>

  <!-- Actions -->
  <div class="flex justify-end space-x-3">
    <button (click)="closeTenderModal()">Cancel</button>
    <button 
      [disabled]="!isStep2Complete()"
      [title]="!isStep2Complete() ? 'Complete all fields first' : ''"
      class="relative group"
    >
      Save
      <!-- Tooltip on Hover -->
      <span 
        *ngIf="!isStep2Complete()" 
        class="absolute bottom-full ... opacity-0 group-hover:opacity-100"
      >
        Complete all fields first
      </span>
    </button>
  </div>
</div>
```

---

## 🧪 Testing

### **Test Scenario**

1. **Start App**: `npm start` → Login
2. **Go to Providers** page
3. **Click "Create a Tender"**
4. **Step 1**: Enter title "New Equipment Tender" → Click Save
5. **Verify**:
   - ✅ Modal stays open
   - ✅ Shows Step 2 with title displayed
   - ✅ Two date fields visible
   - ✅ Save button is greyed out

6. **Select Expected Date**: Choose a date → Click "Set"
7. **Verify**:
   - ✅ API call to `/updateQuoteDate` with `dateType=expected`
   - ✅ Success notification
   - ✅ Date input becomes disabled
   - ✅ Button shows "✓ Set"
   - ✅ Save button still greyed out

8. **Select Requested Date**: Choose a date → Click "Set"
9. **Verify**:
   - ✅ API call to `/updateQuoteDate` with `dateType=requested`
   - ✅ Success notification
   - ✅ Date input becomes disabled
   - ✅ Button shows "✓ Set"
   - ✅ Save button becomes ENABLED

10. **Hover Over Save** (before both dates set):
    - ✅ Tooltip "Complete all fields first" appears

11. **Click Save** (after both dates set):
    - ✅ Ready for Step 3 (to be implemented)

---

## 🔄 User Flow

### **Complete Step 2 Flow**

```
1. Modal opens → Step 1 (Title)
         ↓
2. User enters title → Clicks Save
         ↓
3. createCoordinatorQuote() called
         ↓
4. Modal transitions to Step 2
         ↓
5. User sees title + date fields
         ↓
6. User selects expected date → Clicks "Set"
         ↓
7. updateQuoteDate(id, date, 'expected')
         ↓
8. Expected date marked as set ✓
         ↓
9. User selects requested date → Clicks "Set"
         ↓
10. updateQuoteDate(id, date, 'requested')
         ↓
11. Requested date marked as set ✓
         ↓
12. Save button becomes enabled
         ↓
13. User clicks Save
         ↓
14. Ready for Step 3! (Coming next)
```

---

## 📊 Visual States

### **Initial State (Step 2 opens)**
- Title: ✅ Displayed (read-only)
- Expected Date: ⬜ Empty, enabled
- Requested Date: ⬜ Empty, enabled
- Set Buttons: ⬜ Disabled (no date selected)
- Save Button: 🚫 Greyed out

### **After Expected Date Set**
- Title: ✅ Displayed
- Expected Date: ✅ Set, disabled, shows "✓ Set"
- Requested Date: ⬜ Empty, enabled
- Set Buttons: Expected = disabled, Requested = enabled
- Save Button: 🚫 Still greyed out

### **After Both Dates Set**
- Title: ✅ Displayed
- Expected Date: ✅ Set, disabled, "✓ Set"
- Requested Date: ✅ Set, disabled, "✓ Set"
- Set Buttons: Both disabled
- Save Button: ✅ ENABLED!

---

## 🔧 Date Format Conversion

### **Browser Input → API Format**

HTML5 date input uses: `YYYY-MM-DD`  
Backend expects: `DD-MM-YYYY`

**Conversion Function:**
```typescript
formatDateForAPI(dateString: string): string {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  return `${day}-${month}-${year}`;
}
```

**Example:**
- User selects: `2025-10-15` (browser format)
- API receives: `15-10-2025` (DD-MM-YYYY)

---

## 🎯 Key Features

✅ **Modal Persistence** - Doesn't close after Step 1  
✅ **Step Progression** - Automatic transition from Step 1 → Step 2  
✅ **Individual Set Buttons** - Each date has its own API call  
✅ **Visual Confirmation** - Checkmarks when dates are set  
✅ **Input Locking** - Fields become disabled after setting  
✅ **Validation** - Save only enabled when both dates set  
✅ **Tooltip Feedback** - Hover message explains why Save is disabled  
✅ **Date Format** - Automatic conversion to DD-MM-YYYY  
✅ **Error Handling** - Notifications for success/failure  
✅ **Loading States** - Buttons show loading during API calls  

---

## 📋 Next Steps (Step 3)

Coming next:
- Attachment upload (PDF)
- Additional notes field
- Provider selection
- Final tender launch

---

## ✅ Summary

**Step 2 Complete!** 

The tender creation workflow now supports:
1. ✅ **Step 1**: Create coordinator quote with title
2. ✅ **Step 2**: Set expected & requested completion dates
3. ⏳ **Step 3**: Coming next...

Users can now create a tender and set its completion dates through a guided, multi-step process with clear visual feedback and validation! 🚀

