<script lang="ts">
import { mixins, Options } from 'vue-property-decorator';
import { BaseForm } from '../../../../_common/form-vue/form.service';
import { GamePlaylist } from '../../../../_common/game-playlist/game-playlist.model';

class Wrapper extends BaseForm<GamePlaylist> {}

@Options({})
export default class FormPlaylist extends mixins(Wrapper) {
	modelClass = GamePlaylist;
}
</script>

<template>
	<app-form :controller="form">
		<app-form-group name="name" :label="$gettext('library.playlists.form.name_label')">
			<app-form-control type="text" :validators="[validateMaxLength(100)]" focus />
			<app-form-control-errors />
		</app-form-group>

		<app-form-button>
			<translate v-if="method === 'add'">Add Playlist</translate>
			<translate v-else>Save Playlist</translate>
		</app-form-button>
	</app-form>
</template>
