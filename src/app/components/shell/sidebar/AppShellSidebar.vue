<script lang="ts" setup>
import { defineAsyncComponent, watch } from 'vue';

import { useAppStore } from '~app/store';
import { Screen } from '~common/screen/screen-service';
import AppScrollScroller from '~common/scroll/AppScrollScroller.vue';

const AppShellSidebarBackpack = defineAsyncComponent(() => import('~app/components/shell/sidebar/AppShellSidebarBackpack.vue'));
const AppShellSidebarContext = defineAsyncComponent(() => import('~app/components/shell/sidebar/AppShellSidebarContext.vue'));
const AppShellSidebarLibrary = defineAsyncComponent(() => import('~app/components/shell/sidebar/AppShellSidebarLibrary.vue'));
const AppShellSidebarMobile = defineAsyncComponent(() => import('~app/components/shell/sidebar/AppShellSidebarMobile.vue'));
const AppShellSidebarQuests = defineAsyncComponent(() => import('~app/components/shell/sidebar/AppShellSidebarQuests.vue'));
const AppShellSidebarChat = defineAsyncComponent(() => import('~app/components/shell/sidebar/AppShellSidebarChat.vue'));
const AppShellSidebarJoltydex = defineAsyncComponent(() => import('~app/components/shell/sidebar/AppShellSidebarJoltydex.vue'));

const { visibleLeftPane, checkBackdrop } = useAppStore();

watch(
	() => Screen.isLg,
	() => {
		// Since our context pane is an overlay for breakpoints other than Lg,
		// we want to trigger this action to add or remove the backdrop as
		// needed.
		checkBackdrop();
	}
);
</script>

<template>
	<!--
	Chat handles its scrolling internally. Everything else should be wrapped in
	[AppScrollScroller].
	-->
	<component
		:is="visibleLeftPane === 'chat' ? 'div' : AppScrollScroller"
		id="shell-sidebar"
		class="shell-pane shell-pane-left"
		thin
	>
		<AppShellSidebarChat v-if="visibleLeftPane === 'chat'" />
		<AppShellSidebarLibrary v-else-if="visibleLeftPane === 'library'" />
		<AppShellSidebarContext v-else-if="visibleLeftPane === 'context'" />
		<AppShellSidebarMobile v-else-if="visibleLeftPane === 'mobile'" />
		<AppShellSidebarBackpack v-else-if="visibleLeftPane === 'backpack'" />
		<AppShellSidebarQuests v-else-if="visibleLeftPane === 'quests'" />
		<AppShellSidebarJoltydex v-else-if="visibleLeftPane === 'joltydex'" />
	</component>
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
