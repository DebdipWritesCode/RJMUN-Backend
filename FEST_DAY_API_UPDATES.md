# Fest Day API Schema Updates

> **Note**: The API endpoints remain the same. Only the request/response body structure has changed.

## Schema Changes

### New Fest Day Structure

```typescript
{
  _id: string;                    // MongoDB ID (auto-generated)
  date: string;                   // REQUIRED - e.g., "March 4"
  name: string;                   // REQUIRED - e.g., "Day 1: the Greatest Day"
  price: number;                  // REQUIRED - minimum 0 (in INR)
  description?: string;           // OPTIONAL - plain text (no HTML formatting)
  imageUrl?: string;              // OPTIONAL - Cloudinary image URL
  imagePublicId?: string;         // OPTIONAL - Cloudinary public ID
  events: Array<{                 // OPTIONAL - array of event activities
    title: string;                // REQUIRED - event title
    description?: string;         // OPTIONAL - plain text description
  }>;;
}
```

---

## Breaking Changes

### 1. **Description Field is Now Optional**
**Before**: Description had a default empty string (`''`)  
**Now**: Description is truly optional (can be `undefined` or `null`)

```diff
- Description always existed (even if empty)
+ Description only exists if explicitly provided
```

### 2. **New Events Array**
**Before**: No events array  
**Now**: Fest days can have an array of events/activities

---

## Updated API Endpoints

### 1. **Create Fest Day** - `POST /admin/fest-days`

#### Request Body
```json
{
  "date": "March 4",
  "name": "Day 1: the Greatest Day of All Time",
  "price": 400,
  "description": "This is a simple text description. No HTML formatting needed.",
  "events": [
    {
      "title": "Opening Ceremony",
      "description": "Welcome address and inaugural speech"
    },
    {
      "title": "Competitions Begin",
      "description": "Various cultural competitions start"
    }
  ]
}
```

**Note**: `imageUrl` and `imagePublicId` are handled by the backend via the `image` file upload. Do not send them in the request body.

#### Response (Status 201)
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "date": "March 4",
  "name": "Day 1: the Greatest Day of All Time",
  "price": 400,
  "description": "This is a simple text description. No HTML formatting needed.",
  "imageUrl": "https://res.cloudinary.com/...",
  "imagePublicId": "rjmun/fest-days/...",
  "events": [
    {
      "title": "Opening Ceremony",
      "description": "Welcome address and inaugural speech"
    },
    {
      "title": "Competitions Begin",
      "description": "Various cultural competitions start"
    }
  ]
}
```

---

### 2. **Get All Fest Days** - `GET /admin/fest-days`

#### Response (Status 200)
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "date": "March 4",
    "name": "Day 1: the Greatest Day of All Time",
    "price": 400,
    "description": "A simple text description.",
    "imageUrl": "https://res.cloudinary.com/...",
    "imagePublicId": "rjmun/fest-days/...",
    "events": [
      {
        "title": "Opening Ceremony",
        "description": "Welcome address"
      },
      {
        "title": "Competitions Begin"
      }
    ]
  }
]
```

---

### 3. **Get Single Fest Day** - `GET /admin/fest-days/:id`

#### Response (Status 200)
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "date": "March 4",
  "name": "Day 1: the Greatest Day of All Time",
  "price": 400,
  "description": "A simple text description.",
  "imageUrl": "https://res.cloudinary.com/...",
  "imagePublicId": "rjmun/fest-days/...",
  "events": [
    {
      "title": "Opening Ceremony",
      "description": "Welcome address"
    }
  ]
}
```

---

### 4. **Update Fest Day** - `PUT /admin/fest-days/:id`

#### Request Body (All fields optional)
```json
{
  "date": "March 5",
  "name": "Day 2: Updated Name",
  "price": 500,
  "description": "Updated plain text description.",
  "events": [
    {
      "title": "New Event",
      "description": "New event description"
    }
  ]
}
```

**Field-by-field update rules**:
- `date`: Update to new date or omit to keep existing
- `name`: Update to new name or omit to keep existing
- `price`: Update to new price or omit to keep existing
- `description`: Update to new description, send empty string to clear, omit to keep existing
- `events`: Replace entire events array, omit to keep existing
- Image: Upload new image file (separate from JSON body) or omit to keep existing

#### Response (Status 200)
Same structure as Create response with updated values.

---

### 5. **Delete Fest Day** - `DELETE /admin/fest-days/:id`

#### Response (Status 200)
Returns the deleted fest day object.

---

### 6. **Get Offers** - `GET /admin/fest-days/offers`

No changes. Response structure remains the same.

```json
{
  "1": 0,
  "2": 5,
  "3": 10
}
```

---

### 7. **Update Offers** - `PUT /admin/fest-days/offers`

No changes. Request/response structure remains the same.

---

## Frontend Implementation Checklist

### For Admin Panel (Create/Edit Fest Day)

- [ ] Add `date` field to form (required)
- [ ] Update `description` field - simple **plain text input** (no HTML editing needed)
- [ ] Add new **Events Section** with:
  - [ ] Button to add new event
  - [ ] Each event has two fields:
    - [ ] `title` (required plain text input)
    - [ ] `description` (optional plain text input)
  - [ ] Ability to remove events
  - [ ] Drag-to-reorder events (optional)
- [ ] Keep image upload as is (handled by existing form)
- [ ] Update form validation:
  - [ ] `date` is required
  - [ ] `name` is required
  - [ ] `price` is required and >= 0
  - [ ] Each event's `title` is required
- [ ] Update form submission to include `events` array

### For Day Registration (User-facing)

- [ ] Update display to show new `events` array
- [ ] Render events as a list/accordion/tabs (design choice)
- [ ] If no events, show appropriate message or hide events section
- [ ] Ensure price calculation still works (uses `price` field)

### For Edit Modal Example (React)
```jsx
// Sample structure for managing events
const [events, setEvents] = useState([
  { title: '', description: '' }
]);

const addEvent = () => {
  setEvents([...events, { title: '', description: '' }]);
};

const removeEvent = (index) => {
  setEvents(events.filter((_, i) => i !== index));
};

const updateEvent = (index, field, value) => {
  const newEvents = [...events];
  newEvents[index][field] = value;
  setEvents(newEvents);
};
```

---

## Backward Compatibility Notes

- ✅ Old fest days without `events` array will work fine (arrays default to empty)
- ✅ Old fest days without `description` will work fine (field is optional)
- ❌ Frontend expecting description to always be a non-empty string needs updating
- ❌ Frontend form must now support the new `events` structure

---

## Example cURL Requests

### Create with Events
```bash
curl -X POST http://localhost:3000/admin/fest-days \
  -H "Content-Type: application/json" \
  -d '{
    "date": "March 4",
    "name": "Day 1",
    "price": 400,
    "description": "A simple text description",
    "events": [
      {"title": "Event 1", "description": "Description 1"},
      {"title": "Event 2"}
    ]
  }'
```

### Update Only Events
```bash
curl -X PUT http://localhost:3000/admin/fest-days/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -d '{
    "events": [
      {"title": "New Event 1"},
      {"title": "New Event 2", "description": "With description"}
    ]
  }'
```

### Update with Image
```bash
curl -X PUT http://localhost:3000/admin/fest-days/507f1f77bcf86cd799439011 \
  -F 'image=@/path/to/image.jpg' \
  -F 'date=March 5' \
  -F 'name=Updated Name' \
  -F 'price=500'
```

---

## Questions?

If you encounter any issues with the new structure, check:
1. All required fields are being sent
2. `events` array format is correct (title required, description optional)
3. Image upload uses `FormData` and sends as `image` field, not in JSON
