<script lang="ts">
import { Options, Prop, Vue } from 'vue-property-decorator';
import draggable from 'vuedraggable';
import AppEditableOverlay from '../../../../../../../_common/editable-overlay/editable-overlay.vue';
import { Game } from '../../../../../../../_common/game/game.model';
import { MediaBarItemMaxHeight } from '../../../../../../../_common/game/media-bar/item/item';
import AppGameMediaBarItem from '../../../../../../../_common/game/media-bar/item/item.vue';
import AppScrollScroller from '../../../../../../../_common/scroll/scroller/scroller.vue';
import { GameMediaItemAddModal } from '../../../../../../components/game/media-item/add-modal/add-modal.service';
import { GameMediaItemEditModal } from '../../../../../../components/game/media-item/edit-modal/edit-modal.service';
import { Media, RouteStore, RouteStoreModule } from '../../manage.store';

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

	@RouteStoreModule.Mutation
	addMedia!: RouteStore['addMedia'];

	@RouteStoreModule.Mutation
	removeMedia!: RouteStore['removeMedia'];

	@RouteStoreModule.Action
	saveMediaSort!: RouteStore['saveMediaSort'];

	mediaBarHeight = MediaBarItemMaxHeight + 40;
	addButtonSize = MediaBarItemMaxHeight;

	get draggableItems() {
		return this.mediaItems;
	}

	set draggableItems(items: Media[]) {
		this.saveMediaSort(items);
	}

	async add() {
		const newItems = await GameMediaItemAddModal.show(this.game);
		if (newItems) {
			this.addMedia(newItems);
		}
	}

	async open(item: Media) {
		const newItem = await GameMediaItemEditModal.show(this.game, item, () => {
			this.removeMedia(item);
		});

		// Copy properties of new item into old item to update it.
		if (newItem) {
			Object.assign(item, newItem);
		}
	}
}
</script>

<template>
	<app-scroll-scroller class="fill-darker" horizontal thin>
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
						<app-jolticon icon="add" big />
						<br />
						<b class="-label">
							<translate>Add Media</translate>
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
						<app-game-media-bar-item class="-item" :item="item" @click="open(item)">
							<app-editable-overlay class="-item-hover hidden-xs" @click="open(item)">
								<template #overlay>
									<translate>click to edit</translate>
									<br />
									<translate>drag to sort</translate>
								</template>
							</app-editable-overlay>
						</app-game-media-bar-item>
					</div>
				</template>
			</draggable>
		</div>
	</app-scroll-scroller>
</template>

<style lang="stylus" src="./media-bar.styl" scoped></style>
