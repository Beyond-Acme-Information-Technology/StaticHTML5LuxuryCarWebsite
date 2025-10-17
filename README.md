
# Static HTML5 Luxury Car Website

This is a code bundle for Static HTML5 Luxury Car Website. The original project is available at `https://www.figma.com/design/lD0mqB9KC2XeIzzFWDPWNS/Static-HTML5-Luxury-Car-Website`.

## Running the code

Run `npm i` to install the dependencies.

Run `npm run dev` to start the development server.

## Email / Contact form

The contact form POSTs to a serverless endpoint at `api/send-email.js`.

To enable delivery with SendGrid (example):

- Create a SendGrid API key with Mail Send permission.
- In Vercel or your hosting environment, set these environment variables:

  - `SENDGRID_API_KEY` — your SendGrid API key
  - `CONTACT_TO_EMAIL` — email address to receive contact messages (defaults to `awesomeluxuryservices@gmail.com`)
  - `FROM_EMAIL` — the from address used in outbound messages (a verified sender/domain)

- Deploy. The endpoint will forward messages to SendGrid when `SENDGRID_API_KEY` is present.

If you want the endpoint to require a provider (fail loudly when none is configured), set `REQUIRE_EMAIL_PROVIDER=true` in the environment.

If you prefer a different provider (SES, Mailgun, SMTP), replace the contents of `api/send-email.js` with your provider integration.

### Local email proxy (for testing locally)

If you want to test sending locally without deploying, a lightweight proxy is provided: `local-email-proxy.js`.

- Start the proxy:

```powershell
npm run dev:email-proxy
```

- By default the proxy will log payloads and return success. To enable real sends via SendGrid set the environment variables before starting the proxy:

```powershell
$env:SENDGRID_API_KEY = 'your_key_here'
$env:FROM_EMAIL = 'no-reply@yourdomain.com'
$env:CONTACT_TO_EMAIL = 'you@yourdomain.com'
npm run dev:email-proxy
```

The proxy listens on port 5001 by default and exposes POST /api/send-email which mirrors the serverless endpoint used in the app. Point the app or your tests to `http://localhost:5001/api/send-email` when testing locally.
