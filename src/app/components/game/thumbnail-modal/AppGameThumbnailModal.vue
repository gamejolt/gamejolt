<script lang="ts" setup>
import AppButton from '../../../../_common/button/AppButton.vue';
import { GameModel } from '../../../../_common/game/game.model';
import AppModal from '../../../../_common/modal/AppModal.vue';
import { useModal } from '../../../../_common/modal/modal.service';
import AppTranslate from '../../../../_common/translate/AppTranslate.vue';
import FormGameThumbnail from '../../forms/game/thumbnail/FormGameThumbnail.vue';

type Props = {
	game: GameModel;
};

const { game } = defineProps<Props>();

const modal = useModal()!;

let previousThumbnailId: number | null = null;

if (game.thumbnail_media_item) {
	previousThumbnailId = game.thumbnail_media_item.id;
}

function onSubmit(updatedGame: GameModel) {
	const newThumbnailId =
		(updatedGame.thumbnail_media_item && updatedGame.thumbnail_media_item.id) || null;
	if (previousThumbnailId === newThumbnailId) {
		modal.resolve(game);
	}
	previousThumbnailId = newThumbnailId;
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
