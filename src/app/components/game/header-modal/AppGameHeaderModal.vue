<script lang="ts" setup>
import AppButton from '../../../../_common/button/AppButton.vue';
import { GameModel } from '../../../../_common/game/game.model';
import AppModal from '../../../../_common/modal/AppModal.vue';
import { useModal } from '../../../../_common/modal/modal.service';
import AppTranslate from '../../../../_common/translate/AppTranslate.vue';
import FormGameHeader from '../../forms/game/header/FormGameHeader.vue';

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
