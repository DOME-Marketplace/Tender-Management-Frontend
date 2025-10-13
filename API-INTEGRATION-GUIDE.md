# Tender Management Frontend - API Integration Guide

## 🎉 Integration Complete!

Your frontend is now fully integrated with your Quote Management backend. The system uses **TMForum Quote entities** to manage the **Tender workflow**.

---

## 📋 Architecture Overview

### **Backend ↔ Frontend Mapping**

| Frontend (User-facing) | Backend (API) | Purpose |
|------------------------|---------------|---------|
| `Tender` (model) | `Quote` (TMF entity) | Data structure |
| `category: 'coordinator'` | `category: 'coordinator'` | Parent tender for managing process |
| `category: 'tendering'` | `category: 'tender'` | Child tender for specific provider |
| `TenderService` | Quote Management API | Service layer with DTO mapping |

---

## 🔗 API Endpoints Configured

### **Base Configuration**
- **Backend URL**: `http://localhost:8080/quoteManagement`
- **Frontend Dev Port**: `8081` (configured for CORS)
- **Swagger UI**: `http://localhost:8080/swagger-ui.html`

### **Tendering Endpoints** (Tender-specific)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/tendering/createCoordinatorQuote` | Create parent coordinator tender |
| `POST` | `/tendering/createQuote` | Create child tender for provider |
| `GET` | `/tendering/coordinatorQuotes/{userId}` | Get coordinator tenders by user |
| `GET` | `/tendering/quotes/{userId}?role={role}&externalId={id}` | Get tendering quotes by user & process |

### **General Quote Endpoints**

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/createQuote` | Create tailored quote |
| `GET` | `/listAllQuotes` | List all quotes |
| `GET` | `/quoteById/{id}` | Get quote by ID |
| `GET` | `/quoteByUser/{userId}?role={role}` | Get tailored quotes by user |
| `PATCH` | `/updateQuoteStatus/{id}?statusValue={status}` | Update quote status |
| `PATCH` | `/updateQuoteDate/{id}?date={date}&dateType={type}` | Update completion date |
| `PATCH` | `/addNoteToQuote/{id}?userId={id}&messageContent={msg}` | Add conversation note |
| `PATCH` | `/addAttachmentToQuote/{id}` | Upload PDF attachment (multipart) |
| `DELETE` | `/quote/{id}` | Delete quote |

---

## 🏗️ Project Structure

### **Updated File Structure**

```
src/
├── app/
│   ├── core/
│   │   ├── services/
│   │   │   ├── api.service.ts           ✅ Base HTTP service
│   │   │   ├── tender.service.ts        ✅ Tender API service (NEW)
│   │   │   ├── provider.service.ts      ✅ Provider service
│   │   │   ├── auth.service.ts          ✅ Authentication
│   │   │   └── login.service.ts
│   │   ├── guards/
│   │   │   └── auth.guard.ts
│   │   └── interceptors/
│   │       └── auth.interceptor.ts
│   ├── features/
│   │   ├── auth/                        ✅ Authentication feature
│   │   ├── providers/                   ✅ Provider management + tender creation
│   │   └── tenders/                     ✅ Tender dashboard (NEW)
│   │       ├── pages/
│   │       │   └── tender-dashboard/
│   │       ├── tenders.module.ts
│   │       └── tenders.routes.ts
│   ├── shared/
│   │   ├── models/
│   │   │   ├── tender.model.ts          ✅ Tender interfaces
│   │   │   ├── quote.model.ts           ✅ Quote/TMF interfaces
│   │   │   └── product.model.ts
│   │   ├── components/
│   │   └── services/
│   └── app.routes.ts                    ✅ Updated routes
├── environments/
│   ├── environment.ts                   ✅ Updated config
│   └── environment.prod.ts              ✅ Updated config
└── proxy.conf.json                      ✅ Updated proxy config
```

### **Removed Legacy Code** ❌

All old quote and product features have been removed:
- ❌ `src/app/features/quotes/` (entire folder)
- ❌ `src/app/features/products/` (entire folder)
- ❌ `src/app/core/services/quote.service.ts`
- ❌ `src/app/core/services/product.service.ts`

---

## 🔧 Key Services

### **1. TenderService** (`src/app/core/services/tender.service.ts`)

The main service handling all tender operations with automatic Quote ↔ Tender mapping.

**Key Methods:**

```typescript
// CREATE
createCoordinatorTender(customerIdRef: string, customerMessage: string): Observable<Tender>
createTenderingQuote(customerIdRef, providerIdRef, externalId, message?): Observable<Tender>
createMultipleTenderingQuotes(customerIdRef, providerIds[], externalId, message?): Observable<Tender[]>

// READ
getAllTenders(): Observable<Tender[]>
getTenderById(id: string): Observable<Tender>
getCoordinatorTendersByUser(userId: string): Observable<Tender[]>
getTenderingQuotesByUser(userId, role, externalId): Observable<Tender[]>

// UPDATE
updateTenderStatus(id: string, status: string): Observable<Tender>
addNoteToTender(id: string, userId: string, messageContent: string): Observable<Tender>
addAttachmentToTender(id: string, file: File, description?): Observable<Tender>
updateTenderDate(id: string, date: string, dateType: 'requested' | 'expected'): Observable<Tender>

// DELETE
deleteTender(id: string): Observable<void>

// UTILS
fileToBase64(file: File): Promise<string>
downloadAttachment(tender: Tender): void
```

### **2. ProviderService** (`src/app/core/services/provider.service.ts`)

Handles provider management (uses external TMF API).

---

## 📱 Application Flow

### **Tender Creation Workflow**

1. **User navigates to** `/providers`
2. **Provider List** displays available providers
3. **Click "Create a Tender"** button
4. **Modal opens** with:
   - Response deadline picker
   - PDF attachment upload
   - Note/message field
   - Provider selection checkboxes
5. **Two save options:**
   - **"Save" button** → Creates draft coordinator tender
   - **"Create Tender" button** → Creates coordinator + child tenders for each provider

### **Backend Flow**

```
Create Tender Button Click
│
├─→ Creates Coordinator Quote (parent)
│   POST /tendering/createCoordinatorQuote
│   - category: 'coordinator'
│   - state: 'pre-launched'
│   - customerIdRef: current user
│   - customerMessage: tender note
│
└─→ Creates Tendering Quotes (children)
    POST /tendering/createQuote (for each provider)
    - category: 'tender'
    - state: 'pending'
    - customerIdRef: current user
    - providerIdRef: selected provider
    - externalId: parent tender ID
```

---

## 🎨 User Interface

### **Routes**

| Route | Component | Purpose |
|-------|-----------|---------|
| `/` | *Redirects to* `/providers` | - |
| `/login` | `LoginComponent` | Authentication |
| `/providers` | `ProviderListComponent` | Browse providers & create tenders |
| `/tenders` | `TenderDashboardComponent` | View all tenders |

### **Tender Dashboard** (`/tenders`)

Displays all coordinator tenders for the current user with:
- ✅ Tender status badges (draft, pre-launched, pending, sent, closed)
- ✅ Response deadline
- ✅ Provider count
- ✅ Attachment indicator
- ✅ Edit button (for draft tenders)
- ✅ View details button

---

## 🔐 Authentication

**Current State**: Backend has **NO authentication** (all endpoints public)

**Frontend Auth**:
- `AuthService` ready for future integration
- `authGuard` protects routes
- `auth.interceptor` configured to add token headers when implemented

**To enable authentication later**:
1. Update backend to require authentication
2. Implement login endpoint in backend
3. Update `AuthService.login()` to match backend response format
4. Tokens will automatically be added to requests via interceptor

---

## 📦 Data Models

### **Tender Model** (Frontend)

```typescript
interface Tender {
  id?: string;
  category: 'coordinator' | 'tendering';
  state: 'draft' | 'pre-launched' | 'pending' | 'sent' | 'closed';
  responseDeadline: string;
  tenderNote?: string;
  attachment?: TenderAttachment;
  selectedProviders: string[];
  external_id?: string;  // Parent tender ID (for child tenders)
  provider?: string;      // Provider name (for child tenders)
  createdAt?: string;
  updatedAt?: string;
}

interface TenderAttachment {
  name: string;
  mimeType: string;
  content: string;  // Base64 encoded
  size?: number;
}
```

### **Quote Model** (Backend TMF)

The backend uses full TMForum Quote specification. The `TenderService` handles all mapping automatically.

---

## 🚀 Running the Application

### **1. Start Backend**
```bash
# Backend should be running on http://localhost:8080
# Check health: http://localhost:9000/actuator/health
```

### **2. Start Frontend**
```bash
npm start
# or
ng serve --proxy-config proxy.conf.json
```

Frontend will run on `http://localhost:8081` (configured for CORS)

### **3. Access Application**
- **Frontend**: http://localhost:8081
- **Backend Swagger**: http://localhost:8080/swagger-ui.html
- **Backend OpenAPI**: http://localhost:8080/api-docs

---

## 🧪 Testing the Integration

### **Test Scenario 1: Create Coordinator Tender**

1. Navigate to http://localhost:8081/providers
2. Click "Create a Tender"
3. Fill in:
   - Response deadline (future date/time)
   - Upload PDF
   - Add note
   - Select providers
4. Click "Save" (creates draft)
5. Check `/tenders` page to see the tender

**Expected API call**:
```http
POST http://localhost:8080/quoteManagement/tendering/createCoordinatorQuote
Content-Type: application/json

{
  "customerMessage": "Your tender note",
  "customerIdRef": "user-id"
}
```

### **Test Scenario 2: Launch Tender to Providers**

1. Create tender (as above)
2. Click "Create Tender" instead of "Save"
3. Backend creates:
   - 1 coordinator quote (parent)
   - N tendering quotes (one per selected provider)

**Expected API calls**:
```http
POST /quoteManagement/tendering/createCoordinatorQuote
POST /quoteManagement/tendering/createQuote  (× N providers)
```

### **Test Scenario 3: View Tenders**

1. Navigate to http://localhost:8081/tenders
2. Should see all coordinator tenders
3. Can edit drafts
4. Can view details

**Expected API call**:
```http
GET http://localhost:8080/quoteManagement/tendering/coordinatorQuotes/{userId}
```

---

## 🐛 Troubleshooting

### **CORS Errors**

If you see CORS errors, ensure:
1. Backend is configured for `http://localhost:8081`
2. Frontend is running on port `8081` (check `npm start`)
3. Proxy configuration is correct in `proxy.conf.json`

### **404 Errors**

- Check backend is running on port `8080`
- Verify `environment.apiUrl` = `http://localhost:8080/quoteManagement`
- Check Swagger UI to confirm endpoints exist

### **Authentication Issues**

Currently, no authentication is required. When you add it:
- Check `AuthService.login()` response format matches backend
- Verify `auth.interceptor` is adding headers correctly
- Check browser DevTools → Network → Request Headers

### **Tender Not Appearing**

- Check browser console for errors
- Verify `userId` is set (check `localStorage` in DevTools)
- Check network tab for API response
- Verify tender has correct `category` ('coordinator' or 'tender')

---

## 📝 Next Steps / TODO

### **Immediate**
- ✅ All core API integration completed
- ✅ Tender CRUD operations working
- ✅ File upload/download implemented
- ✅ Provider selection workflow complete

### **Future Enhancements**
- [ ] Implement authentication (when backend adds it)
- [ ] Add tender details modal/page
- [ ] Add quote response workflow for providers
- [ ] Add real-time notifications
- [ ] Add tender filtering and search
- [ ] Add export to PDF functionality
- [ ] Add tender history/audit log

---

## 🎓 Key Concepts

### **Why Quotes for Tenders?**

Your backend uses **TMForum Quote Management API** as the foundation. This is a standard telecommunications industry data model that's flexible enough to represent tender workflows:

- **Quote** = Tender (the offer/request)
- **Quote Items** = Tender line items
- **Related Parties** = Customers and Providers
- **Quote State** = Tender lifecycle states
- **Notes** = Conversation/messaging
- **Attachments** = PDF documents

The `TenderService` abstracts this complexity and provides a clean tender-focused API to your frontend components.

---

## 📞 Support

**Frontend Issues:**
- Check this guide
- Review browser console errors
- Check Network tab in DevTools
- Verify environment configuration

**Backend Issues:**
- Check Swagger documentation
- Verify backend is running
- Check backend console logs
- Review TMForum API responses

---

## ✅ Summary

Your frontend is now **fully integrated** with your Quote Management backend:

✅ TenderService with complete CRUD operations  
✅ Automatic Quote ↔ Tender DTO mapping  
✅ Provider management and selection  
✅ PDF attachment upload/download  
✅ Conversation notes/messaging  
✅ Tender dashboard and workflow  
✅ Proper routing and navigation  
✅ Clean architecture with no legacy code  

**You're ready to start developing and testing!** 🚀

