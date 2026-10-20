# PlaceTrack Entities

- User
- Company
- Job
- Application
- Interview
- Online Assessment (OA)


# PlaceTrack — Data Entities

## 1. Overview

PlaceTrack is a placement and job application tracking application.

This document defines the core data entities, their attributes, constraints, and relationships used in the application.

The current backend uses PostgreSQL hosted on Neon to store company information.

---

## 2. Company Entity

The Company entity represents an organization that a user wants to track during their placement or job search journey.

### Attributes

| Attribute | Database Type | Constraints | Description |
|---|---|---|---|
| id | INTEGER | Primary Key, Identity, NOT NULL | Unique identifier for each company |
| company_name | TEXT | NOT NULL | Name of the company |
| role | TEXT | NULL allowed | Job role associated with the company |
| status | TEXT | NOT NULL, DEFAULT 'Applied' | Current application status |
| website | TEXT | NULL allowed | Official website of the company |
| location | TEXT | NULL allowed | Location of the company |
| notes | TEXT | NULL allowed | Additional information about the company |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Date and time when the record was created |

### Database Constraints

- `id` is the primary key and is generated automatically.
- `company_name` is required.
- `role` is optional.
- `status` defaults to `Applied`.
- Allowed status values are:
  - Applied
  - Interview
  - Offer
  - Rejected
- `website`, `location`, and `notes` are optional.
- `created_at` is automatically assigned the current timestamp.

### Example Company Record

```json
{
  "id": 2,
  "name": "Google",
  "website": "https://google.com",
  "location": "Bengaluru",
  "notes": "Preparing for SDE Internship interview",
  "role": null,
  "status": "Applied",
  "created_at": "2026-10-20T13:04:31.007Z"
}