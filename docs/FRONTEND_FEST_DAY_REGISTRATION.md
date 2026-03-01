# Fest Day Registration – Frontend Implementation Guide

This document describes what the frontend needs to implement for the **Fest Day Registration** feature. The backend is ready. You can reuse existing patterns from **admin CRUD** (committees, EB, sponsors) and **MUN registration** (initiate → Razorpay → confirm).

---

## 1. Overview

- **Admin**: Manage **fest days** (date, name, description, price, image) and **multi-day offers** (e.g. 10% off for 2 days, 15% off for 3 days).
- **User**: Choose one or more fest days, enter details + optional coupon → pay via Razorpay (or get free if total is 0) → confirmation email.

---

## 2. Admin: Fest Days CRUD

Same pattern as committees / EB / sponsors: REST + `multipart/form-data` for create/update with an image.

### Base URL

All under: **`/fest-days`** (no `/admin` prefix; same as committees/eb).

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/fest-days` | List all fest days |
| `GET` | `/fest-days/:id` | Get one fest day |
| `POST` | `/fest-days` | Create fest day (with optional image) |
| `PUT` | `/fest-days/:id` | Update fest day (optional image) |
| `DELETE` | `/fest-days/:id` | Delete fest day |

### Create / Update: request format

- **Content-Type**: `multipart/form-data`
- **Field for image**: `image` (same as committees/EB).

**Create – form fields:**

- `date` (string) – e.g. `"January 15"` (month name + date, no time)
- `name` (string) – display name for the day
- `description` (string) – rich-text description (HTML from WYSIWYG). See [FEST_DAY_DESCRIPTION_RICH_TEXT.md](./FEST_DAY_DESCRIPTION_RICH_TEXT.md).
- `price` (number) – price in INR for that day
- `image` (file, optional) – image file

**Update – form fields:**

- Same as create; all fields optional. Send only what you want to change. Include `image` only when updating the image.

### Fest day object (response / list item)

```ts
{
  _id: string;
  date: string;           // e.g. "January 15"
  name: string;
  description: string;    // HTML from WYSIWYG; sanitize before rendering
  price: number;
  imageUrl?: string;      // present if image was uploaded
  imagePublicId?: string;
}
```

For rich-text editing (bold, italic, bullets, etc.) and safe display, see **[FEST_DAY_DESCRIPTION_RICH_TEXT.md](./FEST_DAY_DESCRIPTION_RICH_TEXT.md)**.

---

## 3. Admin: Multi-day offers

Offers define a **percentage discount** when the user selects **2, 3, … n days** (e.g. 2 days → 10% off, 3 days → 15% off).

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/fest-days/offers` | Get current offers |
| `PUT` | `/fest-days/offers` | Set offers (replace entire map) |

### GET `/fest-days/offers` – response

```ts
{
  "2": 10,   // 10% off when user selects 2 days
  "3": 15,   // 15% off when user selects 3 days
  "4": 20    // 20% off when user selects 4 days
}
```

Keys are **number of days** (as string); values are **percentage off** (number). Missing key = no discount for that count.

### PUT `/fest-days/offers` – request body

```ts
{
  "discounts": {
    "2": 10,
    "3": 15,
    "4": 20
  }
}
```

- **Content-Type**: `application/json`
- Backend replaces the whole map with `discounts`.

**UI suggestion:** Form with rows “Number of days” → “Percentage off”, then send the built object as `discounts`.

---

## 4. User: List days and offers (for registration form)

Used to render the fest day options and show multi-day discounts.

### Endpoint

**`GET /day-registration/days`** (no auth)

### Response

```ts
{
  "days": [
    {
      "_id": string,
      "date": string,
      "name": string,
      "description": string,
      "price": number,
      "imageUrl"?: string,
      "imagePublicId"?: string
    }
  ],
  "offers": {
    "2": 10,
    "3": 15
  }
}
```

- **days**: Same shape as admin list (without sensitive fields if any).
- **offers**: Same as `GET /fest-days/offers` (used to show “Select 2 days – 10% off” etc.).

---

## 5. User: Initiate day registration

Same flow idea as MUN registration: call initiate → if payment needed, open Razorpay with returned `order` → on success call `/payment/confirm`.

### Endpoint

**`POST /day-registration/initiate`**

**Content-Type:** `application/json`

**Request body:**

```ts
{
  "data": {
    "firstName": string,
    "lastName": string,
    "email": string,
    "phone": string,        // 10 digits
    "selectedDayIds": string[]   // MongoDB _id of fest days, at least one
  },
  "couponCode"?: string     // optional
}
```

### Validation (backend)

- `firstName`, `lastName`, `email`, `phone` – required.
- `phone` – exactly 10 digits.
- `selectedDayIds` – at least one; each must be a valid fest day ID (backend returns 400 if invalid).
- `couponCode` – optional; if invalid or exhausted, backend returns 400.

### Possible 400 errors

| Message | When |
|--------|------|
| `Select at least one day` | `selectedDayIds` empty |
| `One or more selected days are invalid` | Any ID not found or not a fest day |
| `Invalid coupon code` | Unknown coupon |
| `Coupon has already been used` | No redemptions left |
| `This coupon is invalid for this order.` | Discount would make final amount &lt; 0 |

### Response – payment required

When `finalAmount > 0`:

```ts
{
  "order": {
    "id": string,        // Razorpay order id
    "amount": number,    // in paise
    "currency": "INR",
    // ... other Razorpay order fields
  },
  "finalAmount": number,   // in INR (rupees)
  "currency": "INR"
}
```

- Use `order` with Razorpay SDK (same as MUN registration).
- After successful payment, call **`POST /payment/confirm`** with `orderId`, `paymentId`, `signature` (see below).

### Response – free (no payment)

When `finalAmount === 0` (e.g. coupon covers full amount):

```ts
{
  "message": "Registration completed without payment",
  "registrationId": string,   // e.g. "FEST-A1B2C3D4"
  "finalAmount": 0,
  "currency": "INR"
}
```

- No Razorpay; show success and `registrationId`. User will receive confirmation email.

---

## 6. Payment confirmation (shared with MUN)

After Razorpay success, frontend calls the **same** confirm endpoint used for MUN registration. Backend infers type from payment `notes` and creates either MUN registration or fest day registration.

### Endpoint

**`POST /payment/confirm`**

**Request body:**

```ts
{
  "orderId": string,   // Razorpay order id
  "paymentId": string,  // Razorpay payment id
  "signature": string  // Razorpay signature
}
```

### Response – success

```ts
{
  "message": "Payment confirmed and registration created",
  "registrationId": string,
  "fullName": string,   // MUN: fullName; Fest: "firstName lastName"
  "email": string
}
```

### Response – already processed (idempotent)

```ts
{
  "message": "Payment already processed",
  "registrationId": null
}
```

Treat as success (e.g. show “Already confirmed” or same success screen).

---

## 7. User: Check registration status

Optional: allow user to look up status by registration ID.

### Endpoint

**`GET /day-registration/status/:registrationId`**

Example: `GET /day-registration/status/FEST-A1B2C3D4`

### Response

```ts
{
  "firstName": string,
  "lastName": string,
  "email": string,
  "phone": string,
  "paymentStatus": "pending" | "completed" | "failed",
  "selectedDays": Array<FestDay>   // populated fest day objects
}
```

---

## 8. Pricing logic (for display only)

Backend already applies this; you can mirror it in the UI to show “You save X” or “Total: Y” before submit.

1. Sum of **prices** of selected days.
2. Apply **multi-day offer**: if user selected `k` days, take `offers[k]` (e.g. 10 for 2 days) and apply as percentage off: `subtotal = sum * (1 - percentageOff / 100)`.
3. If **coupon** provided: `finalAmount = max(0, subtotal - coupon.amountOff)`. If result would be negative, backend returns “This coupon is invalid for this order.”

---

## 9. Summary: what to build

| Area | What to implement |
|------|-------------------|
| **Admin** | Fest days list + create/edit/delete (form with date, name, events, price, **image** upload like committees/EB). |
| **Admin** | Offers screen: get current offers, edit (e.g. table: “Days” → “% off”), save via `PUT /fest-days/offers`. |
| **User** | Fest registration page: load `GET /day-registration/days` → show days (with image, price, events), show multi-day offer text, let user select days + enter firstName, lastName, email, phone + optional coupon. |
| **User** | On submit → `POST /day-registration/initiate`. If `finalAmount > 0` → Razorpay (same as MUN) → on success `POST /payment/confirm` → show success with registrationId/email. If `finalAmount === 0` → show success and registrationId. |
| **User** | Optional: status check by registration ID using `GET /day-registration/status/:registrationId`. |

---

## 10. Reuse from existing app

- **Admin CRUD + image**: Same as committees/EB/sponsors (multipart, `FileInterceptor('image')`, single image field).
- **Payment flow**: Same as MUN registration (initiate → order → Razorpay → confirm with orderId, paymentId, signature).
- **Errors**: Use same pattern (400 body with `message`); show “This coupon is invalid for this order” when backend returns that message.

If you need more detail on any endpoint or want sample request/response for a specific flow, say which part and we can extend this doc.
