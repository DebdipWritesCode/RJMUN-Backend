# Frontend Migration Guide: Fest Day Events with Image Support

## Overview
The Fest Day API has been updated to support **image uploads for individual events**. Previously, only the main Fest Day could have an image. Now each event within a Fest Day can have its own optional image.

---

## 📋 Backend Schema Changes

### FestDayEvent Schema (Updated)
```typescript
// Before
@Schema({ _id: false })
export class FestDayEvent {
  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;
}

// After
@Schema({ _id: false })
export class FestDayEvent {
  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop()
  imageUrl?: string;  // NEW: URL to the event image on Cloudinary

  @Prop()
  imagePublicId?: string;  // NEW: Public ID for deletion/updates
}
```

---

## 🔄 API Request Format Changes

### Creating a Fest Day with Events & Event Images

**Old Request Format:**
```javascript
const formData = new FormData();
formData.append('image', mainImageFile);
formData.append('date', '2024-03-15');
formData.append('name', 'Fest Day 2024');
formData.append('price', 500);
formData.append('description', 'Annual festival');
formData.append('events', JSON.stringify([
  { title: 'Concert', description: 'Live music' },
  { title: 'Dance', description: 'Dance competition' }
]));

await api.post('/fest-days', formData);
```

**New Request Format (with event images):**
```javascript
const formData = new FormData();

// Main Fest Day image
formData.append('image', mainImageFile);

// Basic fest day info
formData.append('date', '2024-03-15');
formData.append('name', 'Fest Day 2024');
formData.append('price', 500);
formData.append('description', 'Annual festival');

// Events (as JSON)
formData.append('events', JSON.stringify([
  { title: 'Concert', description: 'Live music' },
  { title: 'Dance', description: 'Dance competition' }
]));

// ** NEW: Event images (optional, indexed by event position)
formData.append('event_0_image', concertImageFile);  // Image for first event
formData.append('event_1_image', danceImageFile);    // Image for second event

await api.post('/fest-days', formData);
```

### Updating a Fest Day with Events & Event Images

**Format (similar to creation):**
```javascript
const formData = new FormData();

// Main image (optional for update)
if (updatedMainImage) {
  formData.append('image', updatedMainImage);
}

// Updated events
formData.append('events', JSON.stringify([
  { title: 'Concert', description: 'Live music', imageUrl, imagePublicId },
  { title: 'Dance', description: 'Dance competition' },  // New event, no image
  { title: 'Theater', description: 'Theater show' }     // Another new event
]));

// ** NEW: Event images for events that have files
if (updatedConcertImage) {
  formData.append('event_0_image', updatedConcertImage);
}

await api.put(`/fest-days/${festDayId}`, formData);
```

---

## 📦 Updated TypeScript Interfaces

Update your `interfaces.ts` or similar file:

```typescript
// Add or update FestDayEvent interface
export interface FestDayEvent {
  title: string;
  description?: string;
  imageUrl?: string;        // NEW
  imagePublicId?: string;    // NEW
}

// Update FestDay interface
export interface FestDay {
  _id: string;
  date: string;
  name: string;
  price: number;
  description?: string;
  imageUrl?: string;
  imagePublicId?: string;
  events: FestDayEvent[];
}
```

---

## 🎨 Frontend Component Changes

### 1. FestDayForm Component Updates

You need to update the form to handle event image uploads:

```typescript
import { useState } from "react";
import api from "@/api/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-toastify";
import { Plus, Trash2, Upload } from "lucide-react";
import type { FestDay, FestDayEvent } from "@/utils/interfaces";

interface EventFormData extends FestDayEvent {
  id: string;
  imageFile?: File;  // Temporary storage for new image file
}

interface FestDayFormProps {
  initialData?: FestDay;
  onClose: () => void;
}

const FestDayForm = ({ initialData, onClose }: FestDayFormProps) => {
  const [formData, setFormData] = useState({
    date: initialData?.date || "",
    name: initialData?.name || "",
    price: initialData?.price || 0,
    description: initialData?.description || "",
  });

  const [mainImage, setMainImage] = useState<File | null>(null);
  const [events, setEvents] = useState<EventFormData[]>(
    initialData?.events?.map((e, i) => ({
      ...e,
      id: `${i}`,
    })) || []
  );

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMainImage(e.target.files?.[0] || null);
  };

  const handleEventImageChange = (
    eventId: string,
    file: File | null
  ) => {
    setEvents(
      events.map((e) =>
        e.id === eventId ? { ...e, imageFile: file || undefined } : e
      )
    );
  };

  const addEvent = () => {
    setEvents([
      ...events,
      {
        id: Date.now().toString(),
        title: "",
        description: "",
      },
    ]);
  };

  const removeEvent = (id: string) => {
    setEvents(events.filter((e) => e.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = new FormData();

    // Add main image if selected
    if (mainImage) {
      payload.append("image", mainImage);
    }

    // Add basic fest day info
    payload.append("date", formData.date);
    payload.append("name", formData.name);
    payload.append("price", String(formData.price));
    payload.append("description", formData.description);

    // Prepare events for submission (exclude imageFile and id)
    const eventsPayload = events.map((e) => ({
      title: e.title,
      description: e.description,
      imageUrl: e.imageUrl, // Keep existing URLs if not updating
      imagePublicId: e.imagePublicId, // Keep existing public IDs if not updating
    }));

    payload.append("events", JSON.stringify(eventsPayload));

    // ** NEW: Add event images
    events.forEach((event, index) => {
      if (event.imageFile) {
        payload.append(`event_${index}_image`, event.imageFile);
      }
    });

    try {
      if (initialData?._id) {
        await api.put(`/fest-days/${initialData._id}`, payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Fest day updated successfully");
      } else {
        await api.post("/fest-days", payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Fest day created successfully");
      }
      onClose();
    } catch (error) {
      toast.error("Failed to save fest day");
      console.error(error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-lg p-6 shadow-lg space-y-6"
    >
      {/* Main image upload */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
        <label className="flex flex-col items-center gap-2 cursor-pointer">
          <Upload className="w-5 h-5" />
          <span className="font-medium">Upload Main Image</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleMainImageChange}
            className="hidden"
          />
        </label>
        {mainImage && <p className="text-sm text-gray-600">{mainImage.name}</p>}
      </div>

      {/* Basic fest day info */}
      <div className="grid grid-cols-2 gap-4">
        <Input
          type="date"
          value={formData.date}
          onChange={(e) =>
            setFormData({ ...formData, date: e.target.value })
          }
          required
        />
        <Input
          placeholder="Fest Day Name"
          value={formData.name}
          onChange={(e) =>
            setFormData({ ...formData, name: e.target.value })
          }
          required
        />
      </div>

      <Input
        type="number"
        placeholder="Price"
        value={formData.price}
        onChange={(e) =>
          setFormData({ ...formData, price: Number(e.target.value) })
        }
        required
      />

      <textarea
        placeholder="Description"
        value={formData.description}
        onChange={(e) =>
          setFormData({ ...formData, description: e.target.value })
        }
        className="w-full p-2 border rounded-lg"
      />

      {/* Events Section */}
      <div className="border-t pt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">Events</h3>
          <Button
            type="button"
            onClick={addEvent}
            variant="outline"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Event
          </Button>
        </div>

        <div className="space-y-4">
          {events.map((event, index) => (
            <div
              key={event.id}
              className="border rounded-lg p-4 bg-gray-50 space-y-3"
            >
              <div className="flex justify-between items-start">
                <h4 className="font-medium text-sm">Event {index + 1}</h4>
                <Button
                  type="button"
                  onClick={() => removeEvent(event.id)}
                  variant="ghost"
                  size="sm"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <Input
                placeholder="Event Title"
                value={event.title}
                onChange={(e) =>
                  setEvents(
                    events.map((ev) =>
                      ev.id === event.id
                        ? { ...ev, title: e.target.value }
                        : ev
                    )
                  )
                }
                required
              />

              <textarea
                placeholder="Event Description"
                value={event.description || ""}
                onChange={(e) =>
                  setEvents(
                    events.map((ev) =>
                      ev.id === event.id
                        ? { ...ev, description: e.target.value }
                        : ev
                    )
                  )
                }
                className="w-full p-2 border rounded-lg text-sm"
              />

              {/* ** NEW: Event image upload */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 bg-white">
                <label className="flex flex-col items-center gap-2 cursor-pointer text-sm">
                  <Upload className="w-4 h-4" />
                  <span>Upload Event Image (Optional)</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleEventImageChange(event.id, e.target.files?.[0] || null)
                    }
                    className="hidden"
                  />
                </label>
                {event.imageFile && (
                  <p className="text-xs text-gray-600 mt-2">{event.imageFile.name}</p>
                )}
                {event.imageUrl && !event.imageFile && (
                  <p className="text-xs text-blue-600 mt-2">
                    ✓ Image already uploaded: {event.imageUrl.split("/").pop()}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="submit" className="flex-1">
          {initialData ? "Update" : "Create"} Fest Day
        </Button>
        <Button
          type="button"
          onClick={onClose}
          variant="outline"
          className="flex-1"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default FestDayForm;
```

---

## 🎯 Display Events with Images (Optional Enhancement)

If you want to display events in the Fest Days list view:

```typescript
// In your FestDays.tsx or detail view
<div className="mt-4">
  <h4 className="font-semibold text-sm text-gray-700 mb-2">Events:</h4>
  <div className="grid grid-cols-2 gap-2">
    {day.events?.map((event, idx) => (
      <div key={idx} className="bg-gray-100 rounded p-2 text-xs">
        <p className="font-medium">{event.title}</p>
        {event.imageUrl && (
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-16 object-cover rounded mt-1"
          />
        )}
        {event.description && (
          <p className="text-gray-600 text-xs mt-1 line-clamp-1">
            {event.description}
          </p>
        )}
      </div>
    ))}
  </div>
</div>
```

---

## ✅ Key Points to Remember

1. **FormData Structure**: When sending event images, use field names like `event_0_image`, `event_1_image`, etc.
   ```javascript
   // Correct:
   formData.append('event_0_image', file1);  // First event image
   formData.append('event_1_image', file2);  // Second event image
   
   // Do NOT use:
   formData.append('events[0].image', file1); // ❌ Wrong format
   ```

2. **Events Order Matters**: The index in `event_N_image` must match the index in the events array sent in the JSON.

3. **Optional Images**: Event images are completely optional. You can:
   - Create events without images
   - Mix events with and without images
   - Update only the main image without touching events
   - Update only event images without changing main image

4. **Image Deletion**: When updating a fest day:
   - Orphaned images (from removed events or replaced event images) are automatically deleted from Cloudinary
   - You only need to pass the new image file, not worry about cleanup

5. **Preserve Existing Images**: When updating:
   - Include `imageUrl` and `imagePublicId` in the events JSON if you want to keep the existing image
   - Omit them or exclude the image file if replacing

6. **Multipart FormData**: Make sure axios is configured to NOT set Content-Type header, or set it to `multipart/form-data`:
   ```typescript
   // Either omit headers:
   await api.post('/fest-days', formData);
   
   // Or explicitly set:
   await api.post('/fest-days', formData, {
     headers: { 'Content-Type': 'multipart/form-data' }
   });
   ```

---

## 📝 Migration Checklist

- [ ] Update `FestDayEvent` interface to include `imageUrl?` and `imagePublicId?`
- [ ] Update `FestDay` interface if needed
- [ ] Add event image upload fields to FestDayForm component
- [ ] Update FormData construction to include `event_N_image` files
- [ ] Test creating a fest day with event images
- [ ] Test updating a fest day with event images
- [ ] Test removing an event (verify image is deleted from Cloudinary)
- [ ] Test replacing an event image (verify old image is deleted)
- [ ] (Optional) Add event display cards to the fest days list view

---

## 🔗 Related API Endpoints

```
POST   /fest-days              - Create new fest day with events and images
GET    /fest-days              - Get all fest days
GET    /fest-days/:id          - Get single fest day
PUT    /fest-days/:id          - Update fest day with events and images
DELETE /fest-days/:id          - Delete fest day
```

All image handling is automatic on the backend - no separate upload endpoints needed.

---

## 📞 Questions?

Refer to the backend implementation:
- Schema: `src/modules/admin/fest-days/fest-day.schema.ts`
- Service: `src/modules/admin/fest-days/fest-days.service.ts`
- Controller: `src/modules/admin/fest-days/fest-days.controller.ts`
- DTOs: `src/modules/admin/fest-days/dto/`
