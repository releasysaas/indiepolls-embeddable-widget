# Indie Polls Embeddable Widget by Releasy CORP

This widget lets you inlcude the Indie Polls feature requests in any website. [Indie Polls](https://indiepolls.io).

## ✨ Features

- 🛡️ **Fully Isolated** - Shadow DOM encapsulation prevents style conflicts
- 🚀 **Modern Stack** - Built with React 19, TypeScript, and Vite
- 🔌 **Simple Integration** - Single line of code to embed
- 🛠️ **Developer Experience** - Hot reload, TypeScript, and modern tooling

## How to install the widget in your web app

### Basic embed

Add this script tag anywhere in your page (usually before `</body>`):

```html
<script
  src="https://cdn.jsdelivr.net/gh/releasysaas/indie-polls-embeddable-widget@1.0.0/dist/widget.js"
  defer
  data-public-token="YOUR_PUBLIC_TOKEN"
  data-class-name="dark"
></script>
```

- **`data-public-token`**: required. The public token of the poll/widget, generated from the Indie Polls backoffice.
- **`data-class-name`**: optional. Set to `dark` for dark mode, or leave empty for light.

### Optional attributes

The script tag also supports a few optional attributes:

- **`data-external-id`**: a stable identifier for the end user in your system. Used to prevent multiple submissions.
- **`data-email`**: pre-fill contributor email.
- **`data-name`**: pre-fill contributor name.
- **`data-embed-target`**: a CSS selector; if provided, the widget will be rendered inside the matching element instead of attaching to `document.body`.
- **`data-height`**: desired height for the widget container when using `data-embed-target` (e.g. `800px`, `70vh`, `100%`).

Example with more options:

```html
<script
  src="https://cdn.jsdelivr.net/gh/releasysaas/indie-polls-embeddable-widget@1.0.0/dist/widget.js"
  defer
  data-public-token="YOUR_PUBLIC_TOKEN"
  data-external-id="user-123"
  data-email="user@example.com"
  data-name="Jane Doe"
  data-class-name="dark"
  data-embed-target="#indie-polls-widget-container"
  data-height="800px"
></script>
```

Then in your HTML:

```html
<div id="indie-polls-widget-container"></div>
```

### Dynamic example (like `test/index.html`)

You can also inject the widget dynamically and assign a random external id at runtime:

```html
<script>
  const dynamicUser = Math.random().toString(36).slice(2);
  const s = document.createElement('script');
  s.async = true;
  s.src = 'https://cdn.jsdelivr.net/gh/releasysaas/indie-polls-embeddable-widget@1.0.0/dist/widget.js';
  s.dataset.publicToken = 'YOUR_PUBLIC_TOKEN';
  s.dataset.externalId = `user-${dynamicUser}`;
  s.dataset.className = 'dark';
  document.body.appendChild(s);
  // Optionally, set s.dataset.embedTarget, s.dataset.height, etc.
</script>
```

## Changelog

### 1.0.0

- Initial public release

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more information.

## About Releasy CORP, the SaaS company

[Releasy CORP](https://www.releasy.xyz), We Build SaaS and Productivity Tools!
