<script lang="ts">
import { mixins, Options, Prop } from 'vue-property-decorator';
import { GameModel } from '../../../../_common/game/game.model';
import { BaseModal } from '../../../../_common/modal/base';
import FormGameHeader from '../../forms/game/header/header.vue';

@Options({
	components: {
		FormGameHeader,
	},
})
export default class AppGameHeaderEditModal extends mixins(BaseModal) {
	@Prop(Object)
	game!: GameModel;

	// We don't want to close the modal after they've uploaded a header since they can set a crop
	// after. We want to auto-close it after they've saved the crop, though.
	previousHeaderId: number | null = null;

	created() {
		if (this.game.header_media_item) {
			this.previousHeaderId = this.game.header_media_item.id;
		}
	}

	onSubmit(game: GameModel) {
		const newHeaderId = (game.header_media_item && game.header_media_item.id) || null;
		if (this.previousHeaderId === newHeaderId) {
			this.modal.resolve(this.game);
		}
		this.previousHeaderId = newHeaderId;
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
			<FormGameHeader :model="game" @submit="onSubmit" />
		</div>
	</AppModal>
</template>
