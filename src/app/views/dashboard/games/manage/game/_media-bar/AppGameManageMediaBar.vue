<script lang="ts" setup>
import { computed } from 'vue';
import { VueDraggable } from 'vue-draggable-plus';

import { showGameMediaItemAddModal } from '~app/components/game/media-item/add-modal/add-modal.service';
import { showGameMediaItemEditModal } from '~app/components/game/media-item/edit-modal/edit-modal.service';
import { Media, useGameDashRouteController } from '~app/views/dashboard/games/manage/manage.store';
import AppEditableOverlay from '~common/editable-overlay/AppEditableOverlay.vue';
import { GameModel } from '~common/game/game.model';
import AppGameMediaBarItem, {
	MediaBarItemMaxHeight,
} from '~common/game/media-bar/item/AppGameMediaBarItem.vue';
import AppJolticon from '~common/jolticon/AppJolticon.vue';
import AppScrollScroller from '~common/scroll/AppScrollScroller.vue';
import AppTranslate from '~common/translate/AppTranslate.vue';

type Props = {
	game: GameModel;
	mediaItems: Media[];
};

const { game, mediaItems } = defineProps<Props>();

const routeStore = useGameDashRouteController()!;

const mediaBarHeight = MediaBarItemMaxHeight + 40;
const addButtonSize = MediaBarItemMaxHeight;

const draggableItems = computed({
	get: () => mediaItems,
	set: (items: Media[]) => {
		routeStore.saveMediaSort(items);
	},
});

async function add() {
	const newItems = await showGameMediaItemAddModal(game);
	if (newItems) {
		routeStore.addMedia(newItems);
	}
}

async function open(item: Media) {
	const newItem = await showGameMediaItemEditModal(game, item, () => {
		routeStore.removeMedia(item);
	});

	// Copy properties of new item into old item to update it.
	if (newItem) {
		Object.assign(item, newItem);
	}
}
</script>

<template>
	<AppScrollScroller class="fill-darker" horizontal thin>
		<div class="-items" :style="{ height: mediaBarHeight + 'px' }">
			<a class="-add" @click="add()">
				<div
					class="-add-inner"
					:style="{
						width: addButtonSize + 'px',
						height: addButtonSize + 'px',
					}"
				>
					<div>
						<AppJolticon icon="add" big />
						<br />
						<b class="-label">
							<AppTranslate>Add Media</AppTranslate>
						</b>
					</div>
				</div>
			</a>

			<VueDraggable
				v-model="draggableItems"
				style="display: inline-flex"
				:delay="100"
				:delay-on-touch-only="true"
			>
				<div v-for="item in draggableItems" :key="item.id">
					<AppGameMediaBarItem class="-item" :item="item" @click="open(item)">
						<AppEditableOverlay class="-item-hover hidden-xs" @toggle="open(item)">
							<template #overlay>
								<AppTranslate>click to edit</AppTranslate>
								<br />
								<AppTranslate>drag to sort</AppTranslate>
							</template>
						</AppEditableOverlay>
					</AppGameMediaBarItem>
				</div>
			</VueDraggable>
		</div>
	</AppScrollScroller>
</template>

<style lang="stylus" scoped>
.-items
	padding: 20px 0
	white-space: nowrap
	text-align: center

.-add
	rounded-corners-lg()
	theme-prop('border-color', 'lighter')
	display: inline-block
	vertical-align: top
	border-width: 2px
	border-style: dashed
	margin-right: 15px
	margin-left: 15px

	@media $media-sm-up
		margin-right: 20px
		margin-left: 20px

	&:hover
		theme-prop('border-color', 'highlight')
		theme-prop('color', 'highlight')

.-add-inner
	display: flex
	align-items: center
	justify-content: center

.-item
	margin-left: 0 !important

.-item-hover
	display: none
	position: absolute !important
	top: 0
	right: 0
	bottom: 0
	left: 0
	cursor: pointer !important
	z-index: 100

	.-item:hover &
		display: block
</style>
