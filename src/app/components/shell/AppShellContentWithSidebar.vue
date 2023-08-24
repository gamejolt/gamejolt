<script lang="ts" setup>
import { computed, onBeforeUnmount, watch } from 'vue';
import { useSidebarStore } from '../../../_common/sidebar/sidebar.store';
import { useAppStore } from '../../store/index';
import AppShellPageBackdrop from './AppShellPageBackdrop.vue';

const { visibleLeftPane, setHasContentSidebar } = useAppStore();
const { activeContextPane } = useSidebarStore();

const hasContext = computed(() => !!activeContextPane.value);
const isShowingSidebar = computed(() => visibleLeftPane.value === 'context');

onBeforeUnmount(() => {
	setHasContentSidebar(false);
});

/**
 * Sync into the store so that the AppShellBody can style appropriately.
 */
watch(
	isShowingSidebar,
	() => {
		setHasContentSidebar(isShowingSidebar.value);
	},
	{ immediate: true }
);
</script>

<template>
	<div>
		<AppShellPageBackdrop
			class="content-with-sidebar--content"
			:class="{ '-context-available': hasContext }"
		>
			<slot />
		</AppShellPageBackdrop>
	</div>
</template>

<style lang="stylus" scoped>
.content-with-sidebar--content
	// Make it full-size height at least, so that the sidebar doesn't get cut
	// off weird.
	min-height: calc(100vh - var(--theme-top) - var(--theme-bottom))

	// Make room for the sidebar on large screens if the route has context
	// available. All other breakpoints should instead overlay their content.
	&.-context-available
		@media $media-lg
			padding-left: var(--shell-content-sidebar-width-base)
</style>
