# Admin Module

Layout completo para el panel de administración de PetSpot: sidebar + topbar + área de contenido. Paleta salmón mate, diseño estilo Skydash, responsive con colapso en mobile (< 992 px).

---

## Integración en routes.jsx

Añade `AdminLayout` como wrapper de todas las rutas de admin que actualmente van dentro de `<RequireAdmin>`:

```jsx
import AdminLayout from "./components/Admin/AdminLayout";

<Route element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
  <Route path="usuario/admin" element={<Admin />} />
  <Route path="places" element={<Places />} />
  <Route path="places/add" element={<AddPlace />} />
  <Route path="places/edit/:id" element={<EditPlace />} />
  <Route path="places/delete/:id" element={<DeletePlace />} />
  <Route path="cities" element={<Cities />} />
  <Route path="cities/add" element={<AddCity />} />
  <Route path="cities/edit/:id" element={<EditCity />} />
  <Route path="cities/delete/:id" element={<DeleteCity />} />
  <Route path="news" element={<News />} />
  <Route path="news/add" element={<AddNews />} />
  <Route path="news/edit/:id" element={<EditNews />} />
  <Route path="news/delete/:id" element={<DeleteNews />} />
  <Route path="reservations" element={<Reservations />} />
  <Route path="reservations/view/:id" element={<ReservationDetail />} />
  <Route path="reviews" element={<Reviews />} />
  <Route path="user" element={<User />} />
  <Route path="usuario/admin/pets" element={<AdminPets />} />
  {/* … el resto de rutas admin */}
</Route>
```

> El import de `AdminLayout` ya incluye el CSS del admin internamente. No necesitas importar nada más.

---

## Uso de componentes

### AdminPageHeader
```jsx
<AdminPageHeader
  title="Cities"
  breadcrumbs={[{ label: "Admin", to: "/usuario/admin" }, { label: "Cities" }]}
  actions={<Link to="/cities/add" className="admin-btn admin-btn-primary">+ New city</Link>}
/>
```

### AdminStatCard
```jsx
<AdminStatCard icon="fa-paw" label="Total pets" value={142} variant="primary" />
<AdminStatCard icon="fa-calendar-days" label="Pending" value={7} variant="warning" trend="+2 today" />
```

### AdminDataTable
```jsx
<AdminDataTable
  columns={[
    { key: "name", label: "Name" },
    { key: "city", label: "City" },
    { key: "status", label: "Status", render: (val) => <AdminBadge variant={val}>{val}</AdminBadge> },
  ]}
  data={places}
  searchable
  pageSize={10}
/>
```

### AdminBadge
```jsx
<AdminBadge variant="pending">Pending</AdminBadge>
<AdminBadge variant="confirmed">Confirmed</AdminBadge>
<AdminBadge variant="cancelled">Cancelled</AdminBadge>
```

### AdminEmptyState
```jsx
<AdminEmptyState
  icon="fa-store"
  title="No places yet"
  message="Add your first place to get started."
  action={<Link to="/places/add" className="admin-btn admin-btn-primary">+ New place</Link>}
/>
```

### AdminConfirmModal
```jsx
<AdminConfirmModal
  open={showModal}
  title="Delete city"
  message="This action cannot be undone."
  confirmLabel="Delete"
  danger
  onConfirm={handleDelete}
  onCancel={() => setShowModal(false)}
/>
```

---

## Variables CSS expuestas

Todas bajo `:root` en `_variables.css`. Puedes usarlas en cualquier componente del proyecto:

| Variable | Valor | Uso |
|---|---|---|
| `--admin-bg` | `#fdf6f1` | Fondo general del admin |
| `--admin-surface` | `#ffffff` | Cards, sidebar, tablas |
| `--admin-surface-alt` | `#f7ebe2` | Hovers, secciones destacadas |
| `--admin-primary` | `#c97b63` | Salmón mate principal |
| `--admin-primary-hover` | `#b56950` | Hover de primary |
| `--admin-primary-soft` | `#f3d9cc` | Fondos de badges, iconos |
| `--admin-accent` | `#8b4a3a` | Texto destacado, activos |
| `--admin-text` | `#3d2b25` | Texto principal |
| `--admin-text-muted` | `#8a7065` | Texto secundario |
| `--admin-border` | `#ead8cc` | Bordes |
| `--admin-success` | `#7ba05b` | Verde apagado |
| `--admin-warning` | `#d4a574` | Ámbar cálido |
| `--admin-danger` | `#b85450` | Terracota |
| `--admin-radius` | `12px` | Radio de cards |
| `--admin-radius-sm` | `8px` | Radio de botones/inputs |
| `--admin-radius-lg` | `16px` | Radio de modales |
| `--admin-shadow` | `0 2px 8px …` | Sombra estándar |
| `--admin-sidebar-width` | `260px` | Ancho del sidebar |
| `--admin-topbar-height` | `64px` | Altura del topbar |

---

## Nota sobre los widgets

Los widgets del sidebar (`AlertsWidget`, `PendingReservationsWidget`, `RecentChatsWidget`) hacen fetch a endpoints reales del backend:

- `GET /api/places` + `GET /api/places/<id>/schedule` + `GET /api/places/<id>/tables`
- `GET /api/reservations`
- `GET /api/chat`

Necesitan que el backend esté corriendo y que exista `tokenAdmin` en `localStorage`. Si el token no existe o el backend no responde, cada widget muestra "Couldn't load" de forma aislada y no rompe el sidebar.
