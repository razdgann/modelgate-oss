# Launch assets

`dashboard-overview.png` is captured from the deterministic, clearly labeled demo created by `npm run demo`. It represents example traffic, not production usage or a live provider response.

To refresh the screenshot:

1. Run `npm run demo`.
2. Open `http://localhost:3000` in a 1440×1000 browser viewport.
3. Capture the full page to `docs/assets/dashboard-overview.png`.

A GIF is intentionally not checked in for v0.1.0. To create one, record this sequence while the DEMO DATA banner remains visible: dashboard overview → Requests → Repetitions → Security. Save it as `docs/assets/modelgate-demo.gif`, review it for clarity and file size, then remove the GIF exclusion from `.dockerignore` only if the asset is needed inside the image.
