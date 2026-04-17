<script lang="ts" setup>
import FormGameHeader from '~app/components/forms/game/header/FormGameHeader.vue';
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

let previousHeaderId: number | null = null;

if (game.header_media_item) {
	previousHeaderId = game.header_media_item.id;
}

function onSubmit(updatedGame: GameModel) {
	const newHeaderId = (updatedGame.header_media_item && updatedGame.header_media_item.id) || null;
	if (previousHeaderId === newHeaderId) {
		modal.resolve(game);
	}
	previousHeaderId = newHeaderId;
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
