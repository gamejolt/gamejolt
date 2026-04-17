<script lang="ts" setup>
import FormPlaylist from '~app/components/forms/playlist/FormPlaylist.vue';
import { GameCollectionModel } from '~app/components/game/collection/collection.model';
import AppButton from '~common/button/AppButton.vue';
import { GamePlaylistModel } from '~common/game-playlist/game-playlist.model';
import AppModal from '~common/modal/AppModal.vue';
import { useModal } from '~common/modal/modal.service';
import AppTranslate from '~common/translate/AppTranslate.vue';

type Props = {
	collection?: GameCollectionModel;
};

const { collection } = defineProps<Props>();

const modal = useModal()!;

function onSaved(_formModel: GamePlaylistModel, response: any) {
	if (collection) {
		collection.assign(response.gameCollection);
		modal.resolve(collection);
	} else {
		modal.resolve(new GameCollectionModel(response.gameCollection));
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

		<div class="modal-header">
			<h2 class="modal-title">
				<AppTranslate v-if="!collection">Add Playlist</AppTranslate>
				<AppTranslate v-else>Edit Playlist</AppTranslate>
			</h2>
		</div>

		<div class="modal-body">
			<FormPlaylist :model="collection ? collection.playlist : undefined" @submit="onSaved" />
		</div>
	</AppModal>
</template>
