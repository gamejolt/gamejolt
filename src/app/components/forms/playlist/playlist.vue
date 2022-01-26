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
	<AppForm :controller="form">
		<AppFormGroup name="name" :label="$gettext('library.playlists.form.name_label')">
			<AppFormControl type="text" :validators="[validateMaxLength(100)]" focus />
			<AppFormControlErrors />
		</AppFormGroup>

		<AppFormButton>
			<AppTranslate v-if="method === 'add'">Add Playlist</AppTranslate>
			<AppTranslate v-else>Save Playlist</AppTranslate>
		</AppFormButton>
	</AppForm>
</template>
