# Forma Online Clothing Store

Forma uses a Next.js frontend in `frontend/` and an Express API in `Backend/`. PayHere Sandbox checkout is integrated with the existing product catalog. Order prices are recalculated by Express from `Backend/data/products.json`; payment orders stay `pending` until a valid PayHere notification is received.

## PayHere Sandbox Setup

1. Create a Sandbox account at [PayHere](https://www.payhere.lk/). In the Sandbox merchant dashboard, add the app/domain you will use and copy its Sandbox Merchant ID and Merchant Secret. Do not use live credentials for local testing.
2. Configure the backend. Copy `Backend/.env.example` to `Backend/.env` only if you do not already have a backend `.env`; otherwise add the entries below to the existing file so other local settings are preserved. Set the Sandbox credentials and keep the delivery fee equal to the frontend fee.

	```env
	PORT=5000
	PAYHERE_MERCHANT_ID=your_sandbox_merchant_id
	PAYHERE_MERCHANT_SECRET=your_sandbox_merchant_secret
	BASE_URL=https://your-public-backend.ngrok-free.app
	FRONTEND_URL=http://localhost:3000
	DELIVERY_FEE=350
	```

	Configure the frontend by copying `frontend/.env.example` to `frontend/.env.local`:

	```env
	NEXT_PUBLIC_API_URL=http://localhost:5000/api
	NEXT_PUBLIC_DELIVERY_FEE=350
	```

3. Start the Express server in one terminal:

	```powershell
	cd Backend
	npm install
	npm run dev
	```

	Start Next.js in a second terminal:

	```powershell
	cd frontend
	npm install
	npm run dev
	```

	Open `http://localhost:3000/shop`, add products to the cart, then choose Checkout. Cart contents are held in `sessionStorage` for the current browser tab.
4. PayHere cannot call a localhost notification URL. In a third terminal, expose the backend:

	```powershell
	ngrok http 5000
	```

	Put the HTTPS forwarding URL in `BASE_URL` (without a trailing slash), and allowlist that domain in the PayHere Sandbox merchant settings. Restart Express after changing `.env`. Keep `FRONTEND_URL` at `http://localhost:3000` when you are testing in the same browser; for a remote browser, expose the frontend too and set `FRONTEND_URL` to its public URL.
5. Complete a payment using one of the current successful Sandbox cards from PayHere's [official Checkout API and test-card documentation](https://support.payhere.lk/api-%26-mobile-sdk/payhere-checkout). Use a future expiry date and the CVV/OTP instructions shown there. Confirm that the return page eventually shows `paid`; the PayHere notification, not the browser redirect, updates the order. To test failure, use PayHere's documented decline/failure test card. To test cancellation, start another checkout and cancel on the hosted PayHere page. The order status will remain pending until a verified failure notification changes it.
6. Troubleshooting:
	- **Hash mismatch:** confirm the Sandbox Merchant ID and Secret, `LKR`, and the exact two-decimal amount; do not add separators or calculate the hash in the browser.
	- **Unauthorized domain:** allowlist the exact Sandbox domain used by `BASE_URL`; update it whenever a temporary tunnel URL changes.
	- **Notification not received:** confirm the tunnel forwards to port 5000, `BASE_URL` is the public HTTPS backend URL, and `/api/payhere/notify` is reachable. Watch the Express console for the received-notification and signature logs.
	- **Order remains pending:** keep the tunnel and Express process running through the payment, and check the notification signature and status logs. The success page polls the status endpoint while it is pending.

## Configuration and Data

- `Backend/.env` and `frontend/.env.local` are ignored by Git. Never place `PAYHERE_MERCHANT_SECRET` in a `NEXT_PUBLIC_*` variable or frontend file.
- The Express API writes pending orders and verified payment updates to `Backend/data/orders.json`. That file is ignored because it contains customer details.
- The API endpoints are `POST /api/checkout/create-order`, `POST /api/payhere/notify`, and `GET /api/orders/:id`.
- The former `POST /api/cart/checkout` endpoint is retired and returns HTTP 410; it accepted browser totals and must not be used for payments.

## Tests

Run the backend hash, validation, and server-priced item tests with:

```powershell
cd Backend
npm test
```
