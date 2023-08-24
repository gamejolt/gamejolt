<script lang="ts">
import { mixins, Options } from 'vue-property-decorator';
import { BaseForm } from '../../../../_common/form-vue/form.service';
import { GamePlaylistModel } from '../../../../_common/game-playlist/game-playlist.model';

class Wrapper extends BaseForm<GamePlaylistModel> {}

@Options({})
export default class FormPlaylist extends mixins(Wrapper) {
	modelClass = GamePlaylistModel;
}
</script>

<template>
	<AppForm :controller="form">
		<AppFormGroup name="name" :label="$gettext('Name')">
			<AppFormControl type="text" :validators="[validateMaxLength(100)]" focus />
			<AppFormControlErrors />
		</AppFormGroup>

		<AppFormButton>
			<AppTranslate v-if="method === 'add'">Add Playlist</AppTranslate>
			<AppTranslate v-else>Save Playlist</AppTranslate>
		</AppFormButton>
	</AppForm>
</template>
