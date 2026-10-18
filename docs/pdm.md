# Physical Data Model

```mermaid
erDiagram
  regions ||--o{ users : located_in
  regions ||--o{ vehicles : located_in
  regions ||--o{ drivers : located_in
  users ||--o{ bookings : creates
  users ||--o{ booking_approvals : approves
  vehicles ||--o{ bookings : reserved_for
  drivers ||--o{ bookings : assigned_to
  bookings ||--|{ booking_approvals : requires
  bookings ||--o{ fuel_logs : records
  vehicles ||--o{ fuel_logs : consumes
  vehicles ||--o{ service_schedules : has
  users ||--o{ activity_logs : performs
```

Tabel inti adalah `users`, `vehicles`, `drivers`, `bookings`, `booking_approvals`, dan `activity_logs`. Detail kolom, foreign key, dan indeks tersedia di [schema.sql](../database/schema.sql).
