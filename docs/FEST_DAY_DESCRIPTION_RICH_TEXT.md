# Fest Day: Plain Text Description (Updated)

> ⚠️ **DEPRECATED**: This document previously described rich-text HTML descriptions. **As of the latest update, descriptions are now simple PLAIN TEXT only.** No HTML or WYSIWYG editing is needed.

This document describes the change from a **list of events** per fest day to a **plain text description** field.

---

## 1. What changed

| Before | After |
|--------|--------|
| `events: string[]` (e.g. `["Big event", "the boldest ever", "RCB"]`) | `description: string` (simple plain text) |
| Plain text, one line per event | Simple text field, no formatting |

The backend now stores and returns a single `description` string (plain text). The frontend is responsible for editing and displaying it as-is.

---

## 2. Backend changes

### Schema (`fest-day.schema.ts`)

- **Removed:** `events: string[]`
- **Added:** `description: string` (optional). Comment: plain text description.
- **Added:** `events: Array<FestDayEvent>` - new events array with title and optional description.

### DTOs

- **CreateFestDayDto:** `description` optional string (plain text); omit or send undefined to leave empty.
- **UpdateFestDayDto:** `description` optional string (plain text); omit to keep existing.

### Service

- **Create:** Sets `description: dto.description` (no default, can be undefined).
- **Update:** Passes through `description` when present in the DTO.

### API

- **Request (create/update):** Form field `description` (string). Send plain text, no HTML.
- **Response (list / get one / day-registration days):** Fest day object includes `description: string` (plain text) and `events: Array`.

---

## 3. Frontend: Plain text editor and display

### Editor (admin form)

The **description** field holds **plain text** only. No formatting, no HTML.

**Recommended input type:** `<textarea>` or simple text input.

```jsx
<textarea
  value={description}
  onChange={(e) => setDescription(e.target.value)}
  placeholder="Enter a simple text description"
/>
```

### Display (user-facing)

Simply render the plain text as-is. No sanitization needed (since it's plain text).

```jsx
<p>{festDay.description}</p>
```

---

## 4. Events Array (New)

Fest days now support an optional `events` array. Each event has:

```json
{
  "title": "Event Title",
  "description": "Optional plain text description"
}
```

This allows organizing activities or phases within a fest day without needing rich text formatting.

---

## Summary

✅ **Simple plain text descriptions** - No HTML, no WYSIWYG editor needed  
✅ **Events array for activities** - Add multiple events per fest day  
✅ **Date field required** - Fest days must have a date  
✅ **All backward compatible** - Old fest days still work  

For complete API documentation, see [FEST_DAY_API_UPDATES.md](../FEST_DAY_API_UPDATES.md).
- **React-Quill** (`react-quill`) – Simple Quill wrapper. Use the editor value as HTML.
- **Lexical** (Meta) – Modern and performant; more setup.

**Storing:** Send the editor’s HTML as the `description` form field (string) in create/update requests. The backend stores it as-is.

### Display (read-only)

Always **sanitize** HTML before rendering to avoid XSS. Use **DOMPurify** (e.g. `dompurify`; `isomorphic-dompurify` if you need SSR), then render:

```tsx
import DOMPurify from 'dompurify';

// When displaying fest day description (admin or public):
<div
  className="fest-day-description prose"
  dangerouslySetInnerHTML={{
    __html: DOMPurify.sanitize(festDay.description ?? ''),
  }}
/>
```

Use Tailwind’s `prose` (or your own typography styles) so headings, lists, bold, and italic render correctly.

---

## 4. Migration from old data

If you had existing fest days with the old `events` (array) field:

- **Option A:** Run a one-time DB migration: for each document, set `description` from `events` (e.g. join with `<br/>` or wrap in `<ul><li>...</li></ul>`), then remove `events` if desired.
- **Option B:** Have the frontend treat missing `description` as `''` (or, during transition, fall back to rendering `events` as plain list if present).

The backend does not auto-migrate; it only reads/writes `description`.
