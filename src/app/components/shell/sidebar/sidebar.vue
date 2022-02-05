<script lang="ts">
import { defineAsyncComponent } from '@vue/runtime-core';
import { setup } from 'vue-class-component';
import { Options, Vue, Watch } from 'vue-property-decorator';
import { Screen } from '../../../../_common/screen/screen-service';
import AppScrollScroller from '../../../../_common/scroll/AppScrollScroller.vue';
import AppShortkey from '../../../../_common/shortkey/AppShortkey.vue';
import { useCommonStore } from '../../../../_common/store/common-store';
import { useAppStore } from '../../../store';
import AppShellSidebarContext from './context/context.vue';
import AppShellSidebarLibrary from './library/library.vue';

const components = {
	AppScrollScroller,
	AppShortkey,
	AppShellSidebarChat: defineAsyncComponent(() => import('./chat/chat.vue')),
	AppShellSidebarLibrary,
	AppShellSidebarContext,
};

@Options({
	components,
})
export default class AppShellSidebar extends Vue {
	store = setup(() => useAppStore());
	commonStore = setup(() => useCommonStore());

	get user() {
		return this.commonStore.user;
	}
	get visibleLeftPane() {
		return this.store.visibleLeftPane;
	}

	readonly Screen = Screen;

	@Watch('Screen.isLg')
	onBreakpointChange() {
		// Since our context pane is an overlay for breakpoints other than Lg,
		// we want to trigger this action to add or remove the backdrop as needed.
		this.store.checkBackdrop();
	}
}
</script>

<template>
	<AppScrollScroller id="shell-sidebar" class="shell-pane shell-pane-left" thin>
		<AppShortkey v-if="user" shortkey="c" @press="store.toggleLeftPane('chat')" />
		<AppShortkey
			v-if="user || Screen.isXs"
			shortkey="m"
			@press="store.toggleLeftPane('library')"
		/>
		<AppShortkey shortkey="y" @press="store.toggleLeftPane('context')" />

		<AppShellSidebarChat v-if="visibleLeftPane === 'chat'" />
		<AppShellSidebarLibrary v-if="visibleLeftPane === 'library'" />
		<AppShellSidebarContext v-if="visibleLeftPane === 'context'" />
	</AppScrollScroller>
</template>

<style lang="stylus" scoped>
#shell-sidebar
	display: flex
	flex-direction: column

	hr
		margin: $line-height-computed 15px

	.tag
		margin-top: 15px

	.alert
		border-radius: 0
</style>
