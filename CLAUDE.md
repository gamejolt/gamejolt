# Vue Component Style Guide

This guide defines the conventions for all Vue components in this project. It is the authoritative reference for the ongoing migration away from `vue-class-component` / `vue-property-decorator` to Vue 3 Composition API.

---

## Script

- Always `<script lang="ts" setup>` with TypeScript.
- `vue-class-component` and `vue-property-decorator` are **banned** — do not add new usages.

---

## Props

```ts
type Props = {
  myProp: string;
  optional?: boolean;
};
const { myProp, optional = false } = defineProps<Props>();
```

- Use `type Props = { ... }` (not `interface`)
- Destructure immediately with defaults inline
- Never access `props.x` — always use the destructured name
- Do **not** use `withDefaults(defineProps<Props>(), { ... })` — defaults belong in the destructure

---

## Emits

```ts
const emit = defineEmits<{
  done: [];
  seek: [pos: number];
}>();
```

---

## v-model

Use `defineModel()` — never declare a `modelValue` prop + `update:modelValue` emit by hand.

```ts
// Default v-model
const modelValue = defineModel<string>({ required: true });

// Named v-model (v-model:packs)
const packs = defineModel<StickerPackModel[]>('packs', { required: true });
```

- The returned ref is two-way bound: reading `modelValue.value` gets the prop, assigning `modelValue.value = x` emits `update:modelValue`.
- Do **not** also declare the model name in `defineProps` — `defineModel` registers the prop and emit internally.
- In templates, refs auto-unwrap at the top level of expressions, so `@click="modelValue = foo"` works and compiles to a `.value` assignment that triggers the update emit.

---

## Reactive State

- `ref()` for reactive values, `computed()` for derived values
- Plain `let` for non-reactive helpers (timers, callbacks, etc.)
- `toRef(() => expr)` to create a reactive ref from an expression

---

## Watchers

```ts
watch(() => myProp, val => { ... });
watch([() => a, () => b], () => { ... });
watch(someRef, val => { ... }, { immediate: true });
```

Use the callback form `() => prop` for destructured props — reactive destructure requires this for watchers to track correctly.

---

## Lifecycle

```ts
import { onMounted, onBeforeUnmount } from 'vue';
onMounted(() => { ... });
onBeforeUnmount(() => { ... });
```

---

## Template Refs

```ts
const elRef = useTemplateRef('el');
```

Always use `useTemplateRef` when possible. Do not specify the generic type — Vue infers it from the template.

---

## Directives

Always import explicitly — do not rely on auto-injection:

```ts
import { vAppTooltip } from '../../_common/tooltip/tooltip-directive';
```

---

## Route Components (dual script pattern)

Route components need `defineAppRouteOptions` in a plain `<script>` (for `beforeRouteEnter`) and all reactive logic in `<script setup>`:

```vue
<script lang="ts">
import { defineAppRouteOptions } from '../../../_common/route/route-component';
import { Api } from '../../../_common/api/api.service';

export default {
  ...defineAppRouteOptions({
    reloadOn: { params: ['id'] },
    resolver: ({ route }) => Api.sendRequest(`/web/.../${route.params.id}`),
  }),
};
</script>

<script lang="ts" setup>
import { createAppRoute } from '../../../_common/route/route-component';

const routeStore = useMyRouteStore()!;

createAppRoute({
  onInit() { ... },
  onResolved({ payload, fromCache }) { ... },
  onDestroyed() { ... },
});
</script>
```

Route lifecycle mapping:

| Old (`LegacyRouteComponent`) | New (`createAppRoute`) |
|---|---|
| `routeCreated()` | `onInit()` |
| `routeResolved($payload)` | `onResolved({ payload, fromCache })` |
| `routeDestroyed()` | `onDestroyed()` |
| `this.isRouteLoading` | `appRoute.isLoading.value` |
| `this.isRouteBootstrapped` | `appRoute.isBootstrapped.value` |
| `this.reloadRoute()` | `appRoute.reload()` |

---

## Styles

We are migrating from Stylus to **Tailwind v4**. See [MIGRATION_LEDGER.md](MIGRATION_LEDGER.md) for current progress.

**New components and new styling**:

- Use Tailwind utility classes in the template. Tokens are defined in [src/_styles/tailwind.css](src/_styles/tailwind.css) and reference the existing `--theme-*` runtime CSS variables written by [src/_common/theme/AppTheme.vue](src/_common/theme/AppTheme.vue), so `.theme-dark` keeps working automatically.
- Available color tokens: `bg`, `bg-offset`, `bg-backdrop`, `bg-subtle`, `bg-actual`, `fg`, `fg-muted`, `highlight`, `highlight-fg`, `backlight`, `backlight-fg`, `notice`, `notice-fg`, `bi-bg`, `bi-fg`, `link`, `link-hover`, `primary`, `primary-fg`, `gray`, `gray-subtle`, `light`, `lighter`, `lightest`, `dark`, `darker`, `darkest`, `white`, `black`. Use as `bg-bg-offset`, `text-fg`, `border-gray`, etc.
- Elevation: `shadow-elevate-xs`, `shadow-elevate-1`, `shadow-elevate-2`, `shadow-elevate-3`.
- Fonts: `font-sans` (Nunito, default body), `font-heading` (Lato), `font-mono`, `font-display` (Staatliches).
- Type scale: `text-tiny` (11px), `text-sm` (13px), `text-base` (15px), `text-lg` (19px).
- Breakpoints: `sm:` 768px, `md:` 992px, `lg:` 1200px, `xl:` 1500px.
- Dark mode: use `dark:` variant — it targets `.theme-dark` (not the media query).
- **Spacing quirk**: `html { font-size: 62.5% }` in [src/_styles/common/scaffolding.styl](src/_styles/common/scaffolding.styl) makes `1rem = 10px`, so Tailwind's default `--spacing: 0.25rem` means `p-4` = `1rem` = `10px`. Account for this — existing pixel values in Stylus components translate as `Xpx` → `p-[X/2.5]` for spacing utilities. This is intentional; do NOT override `--spacing`.
- For conditional classes, use Vue's `:class="{ 'foo': cond }"`. `styleWhen()` from `_styles/mixins.ts` is being removed — prefer the native class binding.
- If Tailwind can't express something (keyframes, complex pseudo-element work), add a `@utility` in [src/_styles/tailwind.css](src/_styles/tailwind.css) or a plain `<style scoped>` block (no `lang="stylus"`).

**Files not yet migrated** keep their `<style lang="stylus" scoped>` blocks — don't convert opportunistically, only when the component comes up in [MIGRATION_LEDGER.md](MIGRATION_LEDGER.md). The following style-helpers from [src/_styles/mixins.ts](src/_styles/mixins.ts) have been **removed** and are blocked by eslint: `styleWhen`, `styleChangeBg`, `styleChangeBgRgba`, `styleElevate`, `styleBorderRadiusBase`/`Sm`/`Lg`, `styleFlexCenter`, `styleScrollable`/`X`, `styleTextOverflow`, `styleAbsoluteFill`, `styleOverlayTextShadow`. Use Tailwind classes and utilities instead.

Helpers that **remain** because they're genuinely runtime: `styleLineClamp(n)` (dynamic `n`), `styleCaret` (runtime color/direction), `styleMaxWidthForOptions` (runtime math), `styleTyped` (TS helper, not a style generator), `kElevateTransition` (transition constant reused by inline styles).

The Bootstrap-derived `.container` class was renamed to `.gj-container` to avoid colliding with Tailwind's `container` utility.

---

## File Naming

- **Components**: PascalCase matching the exported name — `AppButton.vue`, `RouteDownload.vue`
- **Composables**: camelCase with `use` prefix — `useOnHover.ts`
- **External style files**: PascalCase matching the component — `AppButton.styl`

When migrating old lowercase/kebab-case files (`widget.vue`, `my-form.vue`), rename them to PascalCase at the same time.

---

## Import Order

1. Vue core (`vue`, `vue-router`)
2. Internal services / utilities
3. Model classes
4. Other components
5. Local utilities / styles

---

## Reference Examples (New Style)

- Regular component: [src/_common/ad/widget/AppAdWidget.vue](src/_common/ad/widget/AppAdWidget.vue)
- Route component: [src/app/views/dashboard/account/edit/RouteDashAccountEdit.vue](src/app/views/dashboard/account/edit/RouteDashAccountEdit.vue)
- Route component with store: [src/app/views/communities/view/channel/RouteCommunitiesViewChannel.vue](src/app/views/communities/view/channel/RouteCommunitiesViewChannel.vue)
- Composable: [src/_common/on/useOnHover.ts](src/_common/on/useOnHover.ts)
