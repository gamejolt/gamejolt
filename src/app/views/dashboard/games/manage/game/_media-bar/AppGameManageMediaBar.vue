<script lang="ts" setup>
import AppJolticon from '../../../../../../../_common/jolticon/AppJolticon.vue';
import AppTranslate from '../../../../../../../_common/translate/AppTranslate.vue';
import { computed } from 'vue';
import draggable from 'vuedraggable';
import AppEditableOverlay from '../../../../../../../_common/editable-overlay/AppEditableOverlay.vue';
import { GameModel } from '../../../../../../../_common/game/game.model';
import AppGameMediaBarItem, {
	MediaBarItemMaxHeight,
} from '../../../../../../../_common/game/media-bar/item/AppGameMediaBarItem.vue';
import AppScrollScroller from '../../../../../../../_common/scroll/AppScrollScroller.vue';
import { showGameMediaItemAddModal } from '../../../../../../components/game/media-item/add-modal/add-modal.service';
import { showGameMediaItemEditModal } from '../../../../../../components/game/media-item/edit-modal/edit-modal.service';
import { Media, useGameDashRouteController } from '../../manage.store';

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

			<draggable
				v-model="draggableItems"
				style="display: inline-flex"
				v-bind="{ delay: 100, delayOnTouchOnly: true }"
				item-key="id"
			>
				<template #item="{ element: item }">
					<div>
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
				</template>
			</draggable>
		</div>
	</AppScrollScroller>
</template>

<style lang="stylus" src="./AppGameManageMediaBar.styl" scoped></style>
