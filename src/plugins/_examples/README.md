# Revcord Supreme Plugin SDK

Revcord's plugin API is designed to be **dramatically easier** to use than
Vencord's raw `definePlugin`. You get chainable builders, a central command
registry (with a built-in Command Palette), a crash-safe event bus, a typed
settings layer, i18n, and hot-reload — all with far less boilerplate.

## The fastest path: scaffold

```ts
import { scaffoldPlugin } from "@api/PluginScaffold";

await scaffoldPlugin({
    id: "my-cool-plugin",
    name: "My Cool Plugin",
    description: "Does cool things",
    author: "You",
    authorId: "123456789012345678"
});
```

This writes `src/plugins/my-cool-plugin/index.ts` + `README.md` with a working
plugin. Copy any file from `src/plugins/_examples/` to start from a template.

## The fluent builder

```ts
import { plugin, OptionType } from "@api/PluginSDK";

export default plugin("Hello World", "Says hi")
    .by("You", "123456789012345678")          // author + snowflake id
    .command({ name: "hello", description: "Say hi", run: () => alert("hi") })
    .stylesheet(`[class*="app"] { outline: 2px solid rebeccapurple; }`)
    .setting("greeting", { type: OptionType.STRING, description: "Text", default: "hi" })
    .start(() => console.log("started"))
    .build();
```

Compared to Vencord you no longer have to:

- manually declare `authors: [Devs.xxx]`
- wire `required` / `startAt` plumbing
- register commands in two places
- manage stylesheet enable/disable (handled by `managedStyle`)
- repeat `definePluginSettings({...})` boilerplate for every setting

## Core APIs (all re-exported from `@api`)

| Export | What it does |
| --- | --- |
| `PluginSDK` (`plugin`, `OptionType`) | Chainable plugin builder |
| `EventBus` | Typed, crash-safe pub/sub between plugins |
| `CommandRegistry` | Discord-independent command registry (powers the palette) |
| `CommandPalette` | `Ctrl/⌘+K` palette; `CommandPalette.open()` / `.toggle()` |
| `Loggers` | Central logger registry + in-memory capture |
| `i18n` / `t()` | Safe-fallback translation |
| `Lifecycle` | `onReady` / `onStop` hooks without being a plugin |
| `HotReload` | Declare code that can re-init without a full restart |
| `PluginScaffold` | `scaffoldPlugin()` to generate plugin files |

## Stability guarantees

- Every `EventBus` listener is isolated — one bad plugin can't crash others.
- `SafeMode` quarantines plugins that crash on startup 3× in 60s.
- Settings writes are debounced and (on desktop) atomic, so a crash mid-write
  can never corrupt your settings file.
- `Logger` funnels every log through a central registry the dev overlay can read.

## Lifecycle example

```ts
import { Lifecycle } from "@api";

Lifecycle.onReady(() => console.log("Revcord is fully ready"));
```
