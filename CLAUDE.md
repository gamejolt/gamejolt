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

## Reference Examples (New Style)

- Regular component: [src/_common/ad/widget/AppAdWidget.vue](src/_common/ad/widget/AppAdWidget.vue)
- Route component: [src/app/views/dashboard/account/edit/RouteDashAccountEdit.vue](src/app/views/dashboard/account/edit/RouteDashAccountEdit.vue)
- Route component with store: [src/app/views/communities/view/channel/RouteCommunitiesViewChannel.vue](src/app/views/communities/view/channel/RouteCommunitiesViewChannel.vue)
- Composable: [src/_common/on/useOnHover.ts](src/_common/on/useOnHover.ts)
