# Elwaseet API Collection Copy 2

> Complete API documentation for Client and Lawyer flows. 
  

**Base URL:** `{{base_url}}`

---

## Table of Contents

- [Shared](#shared)
    
- [Admin](#admin)
    
    - [1. Authentication](#1-authentication)
        
    - [2. Profile Management](#2-profile-management)
        
    - [3. Sub-Admins Management](#3-sub-admins-management)
        
    - [4. Statistics (Dashboard)](#4-statistics-dashboard)
        
    - [5. License Verifications](#5-license-verifications)
        
    - [5. Permissions Management](#5-permissions-management)
        
    - [6. Clients Management](#6-clients-management)
        
    - [7. Lawyers Management](#7-lawyers-management)
        
    - [8. Law Firms Management](#8-law-firms-management)
        
    - [Blogs Management](#blogs-management)
        
    - [Codes Management](#codes-management)
        
    - [Complaints Management](#complaints-management)
        
    - [Contacts Management](#contacts-management)
        
    - [Footer Settings Management](#footer-settings-management)
        
    - [Languages Management](#languages-management)
        
    - [Lawyer Deletion Requests](#lawyer-deletion-requests)
        
    - [Payments Management](#payments-management)
        
    - [Practice Areas Management](#practice-areas-management)
        
    - [Questions Management](#questions-management)
        
    - [Regions Management](#regions-management)
        
    - [Subscription Plans Management](#subscription-plans-management)
        

## Shared

|  |  |  |
| --- | --- | --- |
|  |  |  |

---

## Admin

### 1\. Authentication

| Method | Endpoint | Name |
| --- | --- | --- |
| `POST` | `/api/v1/admin/auth/login` | 1\. Admin Login (Super Admin) |
| `POST` | `/api/v1/admin/auth/login` | 2\. Admin Login (Sub Admin) |
| `POST` | `/api/v1/admin/auth/logout` | 3\. Admin Logout |

---

### 2\. Profile Management

| Method | Endpoint | Name |
| --- | --- | --- |
| `GET` | `/api/v1/admin/profile` | 4\. Get Admin Profile |
| `PUT` | `/api/v1/admin/profile` | 5\. Update Admin Profile |
| `PUT` | `/api/v1/admin/profile/change-password` | 6\. Change Password |

---

### 3\. Sub-Admins Management

| Method | Endpoint | Name |
| --- | --- | --- |
| `GET` | `/api/v1/admin/sub-admins?page=1&per_page=15` | 7\. List Sub-Admins |
| `GET` | `/api/v1/admin/sub-admins/:id` | 8\. Show Sub-Admin Details |
| `POST` | `/api/v1/admin/sub-admins` | 9\. Create Sub-Admin |
| `PUT` | `/api/v1/admin/sub-admins/:id` | 10\. Update Sub-Admin Profile & Permissions |
| `DELETE` | `/api/v1/admin/sub-admins/:id` | 11\. Delete Sub-Admin |

---

### 4\. Statistics (Dashboard)

| Method | Endpoint | Name |
| --- | --- | --- |
| `GET` | `/api/v1/admin/statistics` | 12\. Get Dashboard Statistics |

---

### 5\. License Verifications

| Method | Endpoint | Name |
| --- | --- | --- |
| `GET` | `/api/v1/admin/verifications?type=all` | 13\. List Verification Requests |
| `GET` | `/api/v1/admin/verifications/:id?type={{verification_type}}` | 14\. View Verification Details |
| `PUT` | `/api/v1/admin/verifications/:id/approve` | 15\. Approve Verification |
| `PUT` | `/api/v1/admin/verifications/:id/reject` | 16\. Reject Verification |

---

### 5\. Permissions Management

| Method | Endpoint | Name |
| --- | --- | --- |
| `GET` | `/api/v1/admin/permissions` | Get All Permissions & Routes |
| `POST` | `/api/v1/admin/permissions` | Create Dynamic Permission |

---

### 6\. Clients Management

| Method | Endpoint | Name |
| --- | --- | --- |
| `GET` | `/api/v1/admin/clients` | List Clients |
| `GET` | `/api/v1/admin/clients/1` | Show Client |
| `DELETE` | `/api/v1/admin/clients/1` | Suspend (Soft Delete) Client |
| `PUT` | `/api/v1/admin/clients/1/restore` | Unrestore Client |

---

### 7\. Lawyers Management

| Method | Endpoint | Name |
| --- | --- | --- |
| `GET` | `/api/v1/admin/lawyers` | List Lawyers |
| `GET` | `/api/v1/admin/lawyers/1` | Show Lawyer |
| `DELETE` | `/api/v1/admin/lawyers/1` | Suspend (Soft Delete) Lawyer |
| `PUT` | `/api/v1/admin/lawyers/1/restore` | Unrestore Lawyer |

---

### 8\. Law Firms Management

| Method | Endpoint | Name |
| --- | --- | --- |
| `GET` | `/api/v1/admin/law-firms` | List Law Firms |
| `GET` | `/api/v1/admin/law-firms/1` | Show Law Firm |
| `DELETE` | `/api/v1/admin/law-firms/1` | Suspend (Soft Delete) Law Firm |
| `PUT` | `/api/v1/admin/law-firms/1/restore` | Unrestore Law Firm |

---

### Blogs Management

| Method | Endpoint | Name |
| --- | --- | --- |
| `GET` | `/api/v1/admin/blogs?is_published=1&per_page=15` | List Blogs |
| `POST` | `/api/v1/admin/blogs` | Create Blog |
| `GET` | `/api/v1/admin/blogs/1` | Show Blog |
| `PUT` | `/api/v1/admin/blogs/1` | Update Blog |
| `DELETE` | `/api/v1/admin/blogs/1` | Delete Blog |

---

### Codes Management

| Method | Endpoint | Name |
| --- | --- | --- |
| `GET` | `/api/v1/admin/codes` | List Codes |
| `GET` | `/api/v1/admin/codes/1` | Show Code Details |
| `POST` | `/api/v1/admin/codes/generate` | Generate Codes |
| `DELETE` | `/api/v1/admin/codes/1` | Delete Code |

---

### Complaints Management

| Method | Endpoint | Name |
| --- | --- | --- |
| `GET` | `/api/v1/admin/complaints?type=all` | List Complaints |
| `GET` | `/api/v1/admin/complaints/1` | Show Complaint |
| `PUT` | `/api/v1/admin/complaints/1/close` | Close Complaint |

---

### Contacts Management

| Method | Endpoint | Name |
| --- | --- | --- |
| `GET` | `/api/v1/admin/contacts?is_read=0&per_page=15` | List Contacts |
| `GET` | `/api/v1/admin/contacts/1` | Show Contact |
| `DELETE` | `/api/v1/admin/contacts/1` | Delete Contact |

---

### Footer Settings Management

| Method | Endpoint | Name |
| --- | --- | --- |
| `GET` | `/api/v1/admin/footer-settings` | Get Footer Settings Details |
| `PUT` | `/api/v1/admin/footer-settings` | Update Footer Settings |

---

### Languages Management

| Method | Endpoint | Name |
| --- | --- | --- |
| `GET` | `/api/v1/admin/languages?is_active=1&per_page=15` | List Languages |
| `GET` | `/api/v1/admin/languages/1` | Show Language |
| `POST` | `/api/v1/admin/languages` | Create Language |
| `PUT` | `/api/v1/admin/languages/1` | Update Language |
| `DELETE` | `/api/v1/admin/languages/1` | Delete Language |

---

### Lawyer Deletion Requests

| Method | Endpoint | Name |
| --- | --- | --- |
| `GET` | `/api/v1/admin/lawyer-deletion-requests?per_page=15` | List Requests |
| `GET` | `/api/v1/admin/lawyer-deletion-requests/1` | Show Request |
| `PUT` | `/api/v1/admin/lawyer-deletion-requests/1/approve` | Approve Request |
| `PUT` | `/api/v1/admin/lawyer-deletion-requests/1/reject` | Reject Request |

---

### Payments Management

| Method | Endpoint | Name |
| --- | --- | --- |
| `GET` | `/api/v1/admin/payments?per_page=15` | List Payments |
| `GET` | `/api/v1/admin/payments/1` | Show Payment Details |

---

### Practice Areas Management

| Method | Endpoint | Name |
| --- | --- | --- |
| `GET` | `/api/v1/admin/practice-areas?is_active=1&per_page=15` | List Practice Areas |
| `GET` | `/api/v1/admin/practice-areas/1` | Show Practice Area |
| `POST` | `/api/v1/admin/practice-areas` | Create Practice Area |
| `PUT` | `/api/v1/admin/practice-areas/1` | Update Practice Area |
| `DELETE` | `/api/v1/admin/practice-areas/1` | Delete Practice Area |

---

### Questions Management

| Method | Endpoint | Name |
| --- | --- | --- |
| `GET` | `/api/v1/admin/questions?per_page=15` | List Questions |
| `GET` | `/api/v1/admin/questions/1` | Show Question |
| `PUT` | `/api/v1/admin/questions/1/answer` | Answer Question |
| `DELETE` | `/api/v1/admin/questions/1` | Delete Question |
| `PUT` | `/api/v1/admin/questions/1/publish` | Publish Question |
| `PUT` | `/api/v1/admin/questions/1/unpublish` | Unpublish Question |

---

### Regions Management

| Method | Endpoint | Name |
| --- | --- | --- |
| `GET` | `/api/v1/admin/regions?is_active=1&per_page=15` | List Regions |
| `GET` | `/api/v1/admin/regions/1` | Show Region |
| `POST` | `/api/v1/admin/regions` | Create Region |
| `PUT` | `/api/v1/admin/regions/1` | Update Region |
| `DELETE` | `/api/v1/admin/regions/1` | Delete Region |

---

### Subscription Plans Management

| Method | Endpoint | Name |
| --- | --- | --- |
| `GET` | `/api/v1/admin/subscription-plans?is_active=1&per_page=15` | List Subscription Plans |
| `GET` | `/api/v1/admin/subscription-plans/1` | Show Subscription Plan |
| `PUT` | `/api/v1/admin/subscription-plans/1` | Update Subscription Plan |
