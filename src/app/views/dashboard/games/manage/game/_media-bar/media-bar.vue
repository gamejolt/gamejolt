<script lang="ts">
import { setup } from 'vue-class-component';
import { Options, Prop, Vue } from 'vue-property-decorator';
import draggable from 'vuedraggable';
import AppEditableOverlay from '../../../../../../../_common/editable-overlay/AppEditableOverlay.vue';
import { Game } from '../../../../../../../_common/game/game.model';
import AppGameMediaBarItem, {
	MediaBarItemMaxHeight,
} from '../../../../../../../_common/game/media-bar/item/item.vue';
import AppScrollScroller from '../../../../../../../_common/scroll/AppScrollScroller.vue';
import { GameMediaItemAddModal } from '../../../../../../components/game/media-item/add-modal/add-modal.service';
import { GameMediaItemEditModal } from '../../../../../../components/game/media-item/edit-modal/edit-modal.service';
import { Media, useGameDashRouteController } from '../../manage.store';

@Options({
	components: {
		draggable,
		AppScrollScroller,
		AppGameMediaBarItem,
		AppEditableOverlay,
	},
})
export default class AppManageGameMediaBar extends Vue {
	@Prop(Object)
	game!: Game;

	@Prop(Array)
	mediaItems!: Media[];

	routeStore = setup(() => useGameDashRouteController()!);

	mediaBarHeight = MediaBarItemMaxHeight + 40;
	addButtonSize = MediaBarItemMaxHeight;

	get draggableItems() {
		return this.mediaItems;
	}

	set draggableItems(items: Media[]) {
		this.routeStore.saveMediaSort(items);
	}

	async add() {
		const newItems = await GameMediaItemAddModal.show(this.game);
		if (newItems) {
			this.routeStore.addMedia(newItems);
		}
	}

	async open(item: Media) {
		const newItem = await GameMediaItemEditModal.show(this.game, item, () => {
			this.routeStore.removeMedia(item);
		});

		// Copy properties of new item into old item to update it.
		if (newItem) {
			Object.assign(item, newItem);
		}
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
							<AppEditableOverlay class="-item-hover hidden-xs" @click="open(item)">
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

<style lang="stylus" src="./media-bar.styl" scoped></style>
