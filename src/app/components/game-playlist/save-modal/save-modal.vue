<script lang="ts">
import { mixins, Options, Prop } from 'vue-property-decorator';
import { GamePlaylistModel } from '../../../../_common/game-playlist/game-playlist.model';
import { BaseModal } from '../../../../_common/modal/base';
import FormPlaylist from '../../forms/playlist/playlist.vue';
import { GameCollectionModel } from '../../game/collection/collection.model';

@Options({
	components: {
		FormPlaylist,
	},
})
export default class AppGamePlaylistSaveModal extends mixins(BaseModal) {
	@Prop(Object) collection?: GameCollectionModel;

	onSaved(_formModel: GamePlaylistModel, response: any) {
		if (this.collection) {
			this.collection.assign(response.gameCollection);
			this.modal.resolve(this.collection);
		} else {
			this.modal.resolve(new GameCollectionModel(response.gameCollection));
		}
	}
}
</script>

<template>
	<AppModal :modal="modal">
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
