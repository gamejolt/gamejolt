<script lang="ts" setup>
import { computed } from 'vue';
import { setDrawerOpen, useDrawerStore } from '../../../../_common/drawer/drawer-store';
import { Screen } from '../../../../_common/screen/screen-service';
import AppScrollScroller from '../../../../_common/scroll/AppScrollScroller.vue';
import { useFiresideController } from '../../../components/fireside/controller/controller';
import AppFiresideBottomBarButton from './AppFiresideBottomBarButton.vue';
import AppFiresideBottomBarHosts from './AppFiresideBottomBarHosts.vue';

const emit = defineEmits({
	members: () => true,
	firesideSettings: () => true,
	streamSettings: () => true,
	testBg: () => true,
});

const c = useFiresideController()!;
const { rtc, user, canEdit, canStream, isStreaming } = c;

const drawerStore = useDrawerStore();

const canPlaceStickers = computed(() => !!user.value && !Screen.isMobile && isStreaming.value);

function onClickStickerButton() {
	setDrawerOpen(drawerStore, true);
}
</script>

<template>
	<div class="-bottom-bar">
		<div class="-group -left">
			<AppFiresideBottomBarButton
				v-if="canStream"
				icon="microphone-off"
				disabled
				show-settings
				@click-settings="emit('streamSettings')"
			/>
			<AppFiresideBottomBarButton
				v-if="canStream"
				icon="video-camera-off"
				disabled
				show-settings
				@click-settings="emit('streamSettings')"
			/>
		</div>

		<AppScrollScroller v-if="rtc" class="-host-scroller" horizontal>
			<div class="-group">
				<AppFiresideBottomBarHosts />
			</div>
		</AppScrollScroller>

		<div class="-group -right">
			<AppFiresideBottomBarButton
				icon="sticker-filled"
				badge="34"
				:disabled="!canPlaceStickers"
				@click="onClickStickerButton"
			/>

			<AppFiresideBottomBarButton icon="users" @click="emit('members')" />

			<AppFiresideBottomBarButton
				v-if="canEdit"
				icon="ellipsis-h"
				@click="emit('firesideSettings')"
			/>
			<!-- TODO -->
			<AppFiresideBottomBarButton icon="bolt-unfilled" @click="emit('testBg')" />
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.-bottom-bar
.-hosts
.-group
	display: flex
	align-items: center
	justify-content: center

.-bottom-bar
	width: 100%
	padding: 0 16px

.-host-scroller
	margin: 0 20px

.-group
	gap: 8px
	padding-bottom: 16px

.-left
.-right
	flex: 1 0

.-left
	justify-content: end

.-right
	justify-content: start
</style>
