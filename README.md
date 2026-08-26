# RJMUN Website — Backend

## Synchronize the 2026 brochure content

The public committees, organizing team, DESTINIQUE schedule, and fest pricing
are stored in MongoDB. Preview the idempotent 2026 brochure migration with:

```bash
npm run sync:brochure-2026
```

Apply it after reviewing the dry-run output:

```bash
npm run sync:brochure-2026 -- --apply
```

Entries from the previous schedule are archived rather than deleted, preserving
historical registration references.

This is the **backend** for the [RJMUN](https://rjmun.in) (Ramakrishna Junior Model United Nations) website, built using **NestJS**. It handles core application logic, authentication, payment integrations via Razorpay, and interacts with MongoDB and Google Sheets for registration data storage.

> ⚠️ **Note**: This repository is **only one half** of the complete project. The frontend is located here:
> 👉 [https://github.com/DebdipWritesCode/RJMUN-Frontend](https://github.com/DebdipWritesCode/RJMUN-Frontend)

---

## 🚀 Tech Stack

* [NestJS](https://nestjs.com/) — Node.js framework
* [MongoDB](https://www.mongodb.com/) — Database
* [Razorpay](https://razorpay.com/) — Payment integration
* [Google Sheets API](https://developers.google.com/sheets/api) — Used for registration data
* [Resend](https://resend.com/) with Gmail SMTP fallback — Email confirmations
* [TypeScript](https://www.typescriptlang.org/)

---

## 📦 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/DebdipWritesCode/RJMUN-Backend.git
cd RJMUN-Backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

Create a `.env` file at the root of the project with the following values:

```env
# MongoDB connection
MONGO_URI=

# Razorpay credentials
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

# App environment
NODE_ENV=development

# Resend (email)
RESEND_API_KEY=       # From https://resend.com/api-keys
RESEND_FROM_EMAIL=    # e.g. "RJMUN 3.0 <noreply@rjmun-backend.shop>" (must use a verified domain in Resend)

# Gmail SMTP fallback (use a Google app password, not the account password)
GMAIL_SMTP_USER=      # e.g. rjmun@example.com
GMAIL_SMTP_APP_PASSWORD=
GMAIL_FROM_EMAIL=     # optional; defaults to "RJMUN 3.0 <GMAIL_SMTP_USER>"

# Google Sheets integration
REGISTRATION_SHEET_ID=

# Google service account credentials
GOOGLE_TYPE=service_account
GOOGLE_PROJECT_ID=
GOOGLE_PRIVATE_KEY_ID=
GOOGLE_PRIVATE_KEY=
GOOGLE_CLIENT_EMAIL=
GOOGLE_CLIENT_ID=
GOOGLE_AUTH_URI=
GOOGLE_TOKEN_URI=
GOOGLE_AUTH_PROVIDER_X509_CERT_URL=
GOOGLE_CLIENT_X509_CERT_URL=
GOOGLE_UNIVERSAL_DOMAIN=
```

> 🛡️ Make sure `.env` is listed in your `.gitignore` to avoid committing sensitive information.

Resend is attempted first. If it rejects or fails to deliver a message, the
same message is sent through Gmail SMTP. The Gmail fallback requires both
`GMAIL_SMTP_USER` and `GMAIL_SMTP_APP_PASSWORD`; `EMAIL_USER` and `EMAIL_PASS`
remain supported as legacy aliases.

---

### 4. Run the Development Server

```bash
npm run start:dev
```

The server will be available at `http://localhost:3000` by default.

---

## 🛠 Available Scripts

* `npm run start` — Start the production server
* `npm run start:dev` — Start the development server with hot reload
* `npm run build` — Build the app
* `npm run lint` — Run ESLint
* `npm run test` — Run unit tests

---

## 🧪 Testing the API

Use [Postman](https://www.postman.com/) or any other API testing tool to interact with the endpoints.
Ensure you have the correct `.env` values set before running requests.

---

## 🔐 Deployment Tips

* Use a process manager like [PM2](https://pm2.keymetrics.io/) in production.
* Set `NODE_ENV=production` in your environment.
* Consider using a cloud provider like **Render**, **Railway**, or **DigitalOcean** for deployment.

---

## 📫 Contact & Contribute

If you'd like to contribute or report an issue, feel free to open a pull request or issue. For frontend-related changes, check the [RJMUN Frontend Repository](https://github.com/DebdipWritesCode/RJMUN-Frontend).
