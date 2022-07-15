<script lang="ts" setup>
import { computed, onBeforeUnmount, watch } from 'vue';
import { useSidebarStore } from '../../../_common/sidebar/sidebar.store';
import { useAppStore } from '../../store/index';

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
		<div
			class="content-with-sidebar--content fill-backdrop"
			:class="{ '-context-available': hasContext }"
		>
			<slot />
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.content-with-sidebar--content
	// Make it full-size height at least, so that the footer doesn't cut things off weird.
	min-height: 'calc(100vh - %s)' % $shell-top-nav-height

	// Make room for the sidebar on large screens if the route has context available.
	// All other breakpoints should instead overlay their content.
	&.-context-available
		@media $media-lg
			padding-left: $shell-content-sidebar-width
</style>
