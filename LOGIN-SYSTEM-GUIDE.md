# 🔐 Login System Guide

## ✅ Restored & Enhanced!

Your fake login system has been restored and enhanced with a better UI and full integration.

---

## 🎨 What's New

### **Enhanced Login Page**
- 🎨 Beautiful gradient background
- 🚀 Quick login buttons for Customer and Provider
- ⚡ One-click login for testing
- 📱 Responsive design
- ⚠️ Clear "Testing Mode" indicator

### **Navigation Bar**
- 👤 Shows current user ID (shortened)
- 🚪 Logout button always visible
- 🔗 Clean navigation to Providers and Tenders
- 🎯 Only shows when logged in

---

## 🚀 How to Use

### **Quick Login (Recommended for Testing)**

1. Navigate to `http://localhost:8081`
2. You'll see the login page with two quick options:

   **Customer Login:**
   - Click "Use This" under Customer
   - User ID: `urn:ngsi-ld:individual:ab450747-7204-448b-8a8c-77b88f46e81f`
   - Auto-redirects to Providers page

   **Provider Login:**
   - Click "Use This" under Provider  
   - User ID: `urn:ngsi-ld:organization:38817de3-8c3e-4141-a344-86ffd915cc3b`
   - Auto-redirects to Providers page

### **Manual Login**

1. Navigate to `http://localhost:8081`
2. Type or paste any User ID in the input field
3. Click "Login"
4. Redirects to Providers page

### **Logout**

- Click the "Logout" button in the top-right corner of the navigation bar
- Automatically redirects to login page
- Clears all session data

---

## 🏗️ Architecture

### **Two Service Integration**

The system uses **both** services for maximum compatibility:

#### **LoginService** (`login.service.ts`)
- Simple session-based storage
- Stores `userId` in `sessionStorage`
- Used by legacy components

#### **AuthService** (`auth.service.ts`)
- Enhanced authentication service
- Stores `token` and `userId` in `localStorage`
- Has `fakeLogin()` method for testing
- Ready for real API integration when backend adds auth

### **Authentication Flow**

```
User clicks "Login"
     ↓
LoginService.setUserId(userId)
     ↓
AuthService.fakeLogin(userId)
     ↓
Stores in both localStorage & sessionStorage
     ↓
Router navigates to /providers
     ↓
authGuard checks authentication
     ↓
Access granted ✅
```

---

## 🔒 Route Protection

All routes except `/login` are protected by `authGuard`:

```typescript
// Protected Routes (require login)
/providers  → ProviderListComponent
/tenders    → TenderDashboardComponent

// Public Route (no login required)
/login      → LoginComponent

// Default Redirect
/           → Redirects to /login
/**         → Redirects to /login
```

### **authGuard Behavior**

```typescript
if (user is logged in) {
  ✅ Allow access to route
} else {
  ❌ Redirect to /login
}
```

---

## 💾 Data Storage

### **Current Implementation (Fake Login)**

| Data | Storage | Service |
|------|---------|---------|
| User ID | `sessionStorage` | LoginService |
| User ID | `localStorage` | AuthService |
| Auth Token | `localStorage` | AuthService (fake token) |

### **When Backend Adds Real Auth**

Just update `AuthService.login()` to call the real API:

```typescript
login(username: string, password: string): Observable<{ token: string; userId: string }> {
  return this.http.post<{ token: string; userId: string }>(`${environment.apiUrl}/auth/login`, {
    username,
    password
  }).pipe(
    tap(response => {
      localStorage.setItem(this.TOKEN_KEY, response.token);
      localStorage.setItem(this.USER_ID_KEY, response.userId);
      this.isAuthenticatedSubject.next(true);
    })
  );
}
```

The auth interceptor will automatically add the token to all API requests.

---

## 🧪 Test User IDs

### **Customer User**
```
ID: urn:ngsi-ld:individual:ab450747-7204-448b-8a8c-77b88f46e81f
Type: Individual/Customer
Use for: Creating tenders, browsing providers
```

### **Provider User**
```
ID: urn:ngsi-ld:organization:38817de3-8c3e-4141-a344-86ffd915cc3b
Type: Organization/Provider
Use for: Receiving tenders, responding to quotes
```

### **Custom User ID**
You can use any string as a user ID:
- `test-user-123`
- `admin`
- `customer-1`
- Any URN format

---

## 🎯 User Experience Flow

### **First Visit**
1. User goes to `http://localhost:8081`
2. Not authenticated → Redirects to `/login`
3. Login page appears with quick options

### **After Login**
1. User clicks quick login or enters ID
2. Redirects to `/providers`
3. Navigation bar appears with:
   - Providers link
   - Tenders link
   - User ID display
   - Logout button

### **Navigation**
1. Click "Providers" → Browse and create tenders
2. Click "Tenders" → View tender dashboard
3. Click "Logout" → Return to login page

### **Session Persistence**
- ✅ Login persists on page refresh (localStorage)
- ✅ Stays logged in across tabs
- ❌ Clears on logout
- ❌ Clears when closing browser (sessionStorage only)

---

## 🛠️ Files Modified

### **Services**
- ✅ `src/app/core/services/auth.service.ts` - Added `fakeLogin()` method
- ✅ `src/app/core/services/login.service.ts` - Already working

### **Components**
- ✅ `src/app/features/auth/pages/login/login.component.ts` - Enhanced UI
- ✅ `src/app/app.component.ts` - Added navbar with logout

### **Guards & Routes**
- ✅ `src/app/core/guards/auth.guard.ts` - Already working
- ✅ `src/app/app.routes.ts` - Default redirects to login

---

## 🔧 Customization

### **Change Default Test Users**

Edit `login.component.ts`:

```typescript
private readonly CUSTOMER_ID = 'your-customer-id';
private readonly PROVIDER_ID = 'your-provider-id';
```

### **Change Default Redirect After Login**

Edit `login.component.ts`:

```typescript
onLogin() {
  if (this.userId.trim()) {
    this.loginService.setUserId(this.userId.trim());
    this.authService.fakeLogin(this.userId.trim()).subscribe(() => {
      this.router.navigate(['/your-page']); // Change here
    });
  }
}
```

### **Add Password Field (for future real auth)**

Update the login form in `login.component.ts`:

```html
<input 
  [(ngModel)]="password" 
  name="password" 
  type="password"
  placeholder="Password"
  class="w-full px-4 py-3 border..."
/>
```

Then use `authService.login(username, password)` instead of `fakeLogin()`.

---

## 🐛 Troubleshooting

### **Can't Access Protected Routes**
- Check browser console for errors
- Verify user is logged in: Check localStorage for `user_id` or sessionStorage for `userId`
- Try logging out and back in

### **Login Not Persisting**
- Check browser privacy settings
- Ensure localStorage is enabled
- Clear browser cache and try again

### **Redirecting to Login After Login**
- Check `authGuard.ts` is working
- Verify `LoginService.isLoggedIn()` returns true
- Check browser DevTools → Application → Storage

---

## ✨ Summary

✅ **Fake login system restored**  
✅ **Beautiful UI with quick login buttons**  
✅ **Full navigation bar with user info & logout**  
✅ **Route protection working**  
✅ **Session persistence across refreshes**  
✅ **Ready for real backend auth when available**  

Your login system is now fully functional and ready for testing! 🚀

