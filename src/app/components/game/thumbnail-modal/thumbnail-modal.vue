<script lang="ts">
import { mixins, Options, Prop } from 'vue-property-decorator';
import { GameModel } from '../../../../_common/game/game.model';
import { BaseModal } from '../../../../_common/modal/base';
import FormGameThumbnail from '../../forms/game/thumbnail/FormGameThumbnail.vue';

@Options({
	components: {
		FormGameThumbnail,
	},
})
export default class AppGameThumbnailModal extends mixins(BaseModal) {
	@Prop(Object) game!: GameModel;

	// We don't want to close the modal after they've uploaded a thumbnail since they can set a crop
	// after. We want to auto-close it after they've saved the crop, though.
	previousThumbnailId: number | null = null;

	created() {
		if (this.game.thumbnail_media_item) {
			this.previousThumbnailId = this.game.thumbnail_media_item.id;
		}
	}

	onSubmit(game: GameModel) {
		const newThumbnailId = (game.thumbnail_media_item && game.thumbnail_media_item.id) || null;
		if (this.previousThumbnailId === newThumbnailId) {
			this.modal.resolve(this.game);
		}
		this.previousThumbnailId = newThumbnailId;
	}
}
</script>

<template>
	<AppModal>
		<div class="modal-controls">
			<AppButton @click="modal.dismiss()">
				<AppTranslate>Close</AppTranslate>
			</AppButton>
		</div>

		<div class="modal-body">
			<FormGameThumbnail :game="game" @submit="onSubmit" />
		</div>
	</AppModal>
</template>
