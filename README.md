# Rent-manager

Rent and maintenance management for landlords and tenants, with M-Pesa payments

## Data model (Firestore)

| Collection            | Holds                                       |
| --------------------- | ------------------------------------------- |
| `users`               | name, email, role (landlord or tenant)      |
| `properties`          | owner, name, address                        |
| `units`               | property, name, monthly rent, linked tenant |
| `rentRecords`         | unit, month, amount due, amount paid        |
| `payments`            | tenant, rent record, amount, reference      |
| `maintenanceRequests` | unit, tenant, title, description, status    |

Access rules are in `firestore.rules`.

## Testing

Tests cover validation, rent status logic, route protection by role, the login and register flows, the landlord and tenant pages, and the Firestore services (with Firebase mocked). Coverage is above 90%. Run `npm run coverage` to see the report.

## CI/CD

GitHub Actions installs dependencies, lints, runs the tests with coverage and builds the app on every push and pull request. The app is deployed to Firebase Hosting. Secrets live in a local `.env` file that is git-ignored, and `.env.example` lists the variables needed.

## Design

Complementary colour scheme: deep teal `#0F766E` with warm coral `#F97316`. Status colours (green, amber, red) always appear with a text label, so they don't rely on colour alone. See `docs/design.md` and the Figma wireframes above.

## Known limits

- **Payments are simulated.** Pressing Pay records a payment and a reference number in Firestore but does not move money. Real M-Pesa STK Push needs a server-side Daraja integration (for example Cloud Functions), which is the planned next step.
- Any signed-in user can read profile documents, because landlords look tenants up by email. A server-side lookup would remove this.
- Google sign-in creates accounts with the tenant role by default.
  EOF
