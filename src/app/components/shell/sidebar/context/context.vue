<script lang="ts">
import { setup } from 'vue-class-component';
import { Options, Vue, Watch } from 'vue-property-decorator';
import AppScrollScroller from '../../../../../_common/scroll/scroller/scroller.vue';
import { useSidebarStore } from '../../../../../_common/sidebar/sidebar.store';
import { useAppStore } from '../../../../store/index';

@Options({
	components: {
		AppScrollScroller,
	},
})
export default class AppShellSidebarContext extends Vue {
	store = setup(() => useAppStore());
	sidebarStore = setup(() => useSidebarStore());

	get activeContextPane() {
		return this.sidebarStore.activeContextPane;
	}

	get hasCbar() {
		return this.store.hasCbar;
	}

	get visibleLeftPane() {
		return this.store.visibleLeftPane;
	}

	get isShowingSidebar() {
		return this.visibleLeftPane === 'context';
	}

	@Watch('isShowingSidebar', { immediate: true })
	onSidebarChange() {
		this.store.setHasContentSidebar(this.isShowingSidebar);
	}

	beforeUnmount() {
		this.store.setHasContentSidebar(false);
	}
}
</script>

<template>
	<div id="shell-sidebar-context">
		<component
			:is="activeContextPane.component"
			v-if="activeContextPane"
			v-bind="activeContextPane.props"
		/>
	</div>
</template>
