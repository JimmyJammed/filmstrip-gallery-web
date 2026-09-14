# Accessibility

Original frames use native buttons, descriptive labels, and visible focus. Clones are aria-hidden and excluded from Tab, but pointer clicks resolve to their original image. Keyboard focus switches the reel to manual scrolling and brings the original frame into view. Focus leaving the track resumes the loop only when other pause conditions permit.

A visible pause/play button controls autoplay. Reduced-motion and Save-Data users receive a scrollable strip and working lightbox without importing GSAP. Preferences are observed for changes. Offscreen galleries and hidden documents pause their tweens.

The native dialog provides modal focus containment and Escape. Previous/next buttons and left/right arrows wrap through images. The caption includes position and updates politely. Close restores focus to the original frame, including when opened from a visual clone. Forced-colors mode removes film decoration and fading while retaining images and controls.

Provide meaningful alt text. Captions add context rather than replacing alt text. Browser emulation and automated focus checks do not establish a full screen-reader audit; physical devices and assistive-technology coverage are recorded separately in VALIDATION.md.

The client-rendered factory requires JavaScript. For a no-JavaScript experience, put static images or links inside the host before mounting; these remain if initialization never runs and return on destroy. The demo offers a noscript explanation.
