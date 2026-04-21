# Vue Component Style Guide

This guide defines the conventions for all Vue components in this project. It is the authoritative reference for the ongoing migration away from `vue-class-component` / `vue-property-decorator` to Vue 3 Composition API.

---

## Post-Work Checks

After completing work, run lint and format checks **only on the files you modified** — never on the full `src/` tree. Do this once at the end, not between iterations.

```sh
# Replace with the actual modified paths, space-separated
yarn eslint path/to/File1.vue path/to/File2.ts
yarn prettier --check path/to/File1.vue path/to/File2.ts
```

Fix any issues reported (`--fix` for eslint, `--write` for prettier) before reporting the task as complete.

---

## Script

- Always `<script lang="ts" setup>` with TypeScript.
- `vue-class-component` and `vue-property-decorator` are **banned** — do not add new usages.
- Don't annotate function return types unless required (e.g. to break recursion, or to tighten a type that would otherwise infer too broadly). Let TypeScript infer.

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

- Prefer inline `<style lang="stylus" scoped>` inside the component file.
- Only use an external `.styl` file (`<style lang="stylus" src="./ComponentName.styl">`) if the styles are shared across multiple components — in that case, omit `scoped`.
- Use BEM-style nesting, `change-bg()` mixin, and CSS variables for theming.
- Use `styleWhen()` from `_styles/mixins` for conditional inline styles.

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

## Template Shorthands

Use Vue's shorthand syntax in templates wherever applicable:

**Boolean `true` props** — omit the value entirely when the prop is declared with `Boolean` type. The presence of the attribute then means `true`.

```vue
<!-- Avoid -->
<AppButton :primary="true" :sparse="true" />

<!-- Prefer -->
<AppButton primary sparse />
```

**Caveat for third-party components:** some libraries (e.g. `vue-draggable-plus`) declare their props as an untyped array of names. Vue's boolean-shorthand coercion only kicks in when the prop is declared as `Boolean`; on untyped props, `<Component prop-name />` is passed as the empty string `""` (falsy), not `true`. For these, use the explicit form:

```vue
<!-- vue-draggable-plus declares props as a string array -->
<VueDraggable :delay-on-touch-only="true" />
```

**Same-name `v-bind` (Vue 3.4+)** — when the attribute name and the bound expression are the same identifier, drop the `="..."` part.

```vue
<!-- Avoid -->
<AppGameThumbnail :game="game" />
<slot name="item" :element="element" :index="index" />

<!-- Prefer -->
<AppGameThumbnail :game />
<slot name="item" :element :index />
```

Applies to regular props *and* slot props. Only use it when the names actually match — `:item="element"` stays as-is.

---

## Dependencies

Always pin dependency versions **exactly** in `package.json` — no `^`, no `~`, no ranges. Match the style of existing entries (e.g. `"vue": "3.5.13"`, not `"vue": "^3.5.13"`).

When adding a package with `yarn add`, follow up with an edit to strip the leading `^` that yarn writes by default. This applies to `dependencies`, `devDependencies`, and `optionalDependencies`.

---

## Reference Examples (New Style)

- Regular component: [src/_common/ad/widget/AppAdWidget.vue](src/_common/ad/widget/AppAdWidget.vue)
- Route component: [src/app/views/dashboard/account/edit/RouteDashAccountEdit.vue](src/app/views/dashboard/account/edit/RouteDashAccountEdit.vue)
- Route component with store: [src/app/views/communities/view/channel/RouteCommunitiesViewChannel.vue](src/app/views/communities/view/channel/RouteCommunitiesViewChannel.vue)
- Composable: [src/_common/on/useOnHover.ts](src/_common/on/useOnHover.ts)
