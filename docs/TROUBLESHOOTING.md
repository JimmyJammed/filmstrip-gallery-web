# Troubleshooting

- **No film border:** import `filmstrip-gallery/styles.css` and ensure your bundler resolves CSS asset URLs.
- **Reel stationary:** check user pause, keyboard focus, open lightbox, document visibility, viewport intersection, reduced motion and Save-Data. A single image is deliberately static.
- **Assets fail below a path prefix:** rebuild using the final `DEMO_BASE`; relative image paths in your own options remain your responsibility.
- **Image is unavailable:** alt text and frame controls remain usable; fix the source URL. No external fallback image is fetched.
- **React duplication or stale items:** use the adapter, immutable options, and do not directly mutate its generated DOM. Strict Mode is covered by the browser suite.
- **Copied local image missing:** blob previews cannot be exported as permanent URLs. Replace exported placeholder paths with files deployed by your app.
- **Browser test cannot launch:** run `npx playwright install`; environment launch failures are not assertion failures.
