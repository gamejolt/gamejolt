<script lang="ts" setup>
import FormGameThumbnail from '~app/components/forms/game/thumbnail/FormGameThumbnail.vue';
import AppButton from '~common/button/AppButton.vue';
import { GameModel } from '~common/game/game.model';
import AppModal from '~common/modal/AppModal.vue';
import { useModal } from '~common/modal/modal.service';
import AppTranslate from '~common/translate/AppTranslate.vue';

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
