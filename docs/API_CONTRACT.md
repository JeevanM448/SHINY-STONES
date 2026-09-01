# API Contract — Shiny Stone Sales OS

## Customers

- `GET /api/customers`
- `POST /api/customers`
- `GET /api/customers/:id`
- `PATCH /api/customers/:id`
- `DELETE /api/customers/:id`

## Contacts

- `GET /api/contacts`
- `POST /api/contacts`
- `PATCH /api/contacts/:id`
- `DELETE /api/contacts/:id`

## Deals

- `GET /api/deals`
- `POST /api/deals`
- `GET /api/deals/:id`
- `PATCH /api/deals/:id`
- `PATCH /api/deals/:id/stage`
- `DELETE /api/deals/:id`

## Emails

- `GET /api/emails?folder=inbox`
- `POST /api/emails`
- `POST /api/emails/:id/reply`
- `PATCH /api/emails/:id/read`

## Purchase Orders

- `GET /api/purchase-orders`
- `POST /api/purchase-orders`
- `GET /api/purchase-orders/:id`
- `PATCH /api/purchase-orders/:id`
- `POST /api/purchase-orders/:id/extract`

## Follow-ups

- `GET /api/follow-ups`
- `POST /api/follow-ups`
- `PATCH /api/follow-ups/:id`
- `POST /api/follow-ups/:id/complete`

## Workflows

- `GET /api/workflows`
- `POST /api/workflows`
- `PATCH /api/workflows/:id`
- `DELETE /api/workflows/:id`
- `POST /api/workflows/:id/run`

## Dashboard & Reports

- `GET /api/dashboard/metrics`
- `GET /api/reports?period=6m`

## Example: Create Customer

```json
POST /api/customers
{
  "name": "ABC Corporation",
  "industry": "Manufacturing",
  "location": "Saudi Arabia",
  "contactName": "Ahmed Al-Rashid",
  "contactEmail": "ahmed@example.com",
  "contactPhone": "+966 50 123 4567",
  "ownerId": "user-2",
  "status": "active"
}
```

Response: `201` with full Customer object including computed `activeDeals`, `revenue`.
