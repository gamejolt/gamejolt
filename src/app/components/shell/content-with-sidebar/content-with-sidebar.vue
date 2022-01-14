<script lang="ts">
import { setup } from 'vue-class-component';
import { Options, Vue, Watch } from 'vue-property-decorator';
import AppScrollScroller from '../../../../_common/scroll/scroller/scroller.vue';
import { useSidebarStore } from '../../../../_common/sidebar/sidebar.store';
import { useAppStore } from '../../../store/index';

@Options({
	components: {
		AppScrollScroller,
	},
})
export default class AppShellContentWithSidebar extends Vue {
	store = setup(() => useAppStore());
	sidebarStore = setup(() => useSidebarStore());

	get activeContextPane() {
		return this.sidebarStore.activeContextPane;
	}

	get visibleLeftPane() {
		return this.store.visibleLeftPane;
	}

	get hasContext() {
		return !!this.activeContextPane;
	}

	get isShowingSidebar() {
		return this.visibleLeftPane === 'context';
	}

	beforeUnmount() {
		this.store.setHasContentSidebar(false);
	}

	/**
	 * Sync into the store so that the AppShellBody can style appropriately.
	 */
	@Watch('isShowingSidebar', { immediate: true })
	onSidebarChange() {
		this.store.setHasContentSidebar(this.isShowingSidebar);
	}
}
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
