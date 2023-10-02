<script lang="ts">
import { mixins, Options, Prop } from 'vue-property-decorator';
import { formatNumber } from '../../../../../_common/filters/number';
import AppFormControlUpload from '../../../../../_common/form-vue/controls/upload/AppFormControlUpload.vue';
import { BaseForm, FormOnLoad } from '../../../../../_common/form-vue/form.service';
import { GameModel } from '../../../../../_common/game/game.model';
import { $saveGameSong, GameSongModel } from '../../../../../_common/game/song/song.model';

class Wrapper extends BaseForm<GameSongModel> {}

@Options({
	components: {
		AppFormControlUpload,
	},
})
export default class FormGameSong extends mixins(Wrapper) implements FormOnLoad {
	@Prop(Object) game!: GameModel;

	modelClass = GameSongModel;
	modelSaveHandler = $saveGameSong;

	maxFilesize = 0;

	readonly formatNumber = formatNumber;

	get loadUrl() {
		return `/web/dash/developer/games/music/save/${this.game.id}`;
	}

	get fileLabel() {
		if (this.method === 'add') {
			return this.$gettext('Song File');
		} else {
			return this.$gettext('Change Song File');
		}
	}

	created() {
		this.form.warnOnDiscard = false;
	}

	onInit() {
		this.setField('game_id', this.game.id);
	}

	onLoad(payload: any) {
		this.maxFilesize = payload.maxFilesize;
	}
}
</script>

<template>
	<AppForm :controller="form">
		<AppFormGroup name="title" :label="$gettext(`Song Title`)">
			<AppFormControl type="text" :validators="[validateMaxLength(150)]" />
			<AppFormControlErrors />
		</AppFormGroup>

		<AppFormGroup name="file" :label="fileLabel" :optional="method === 'edit'">
			<p class="help-block">
				<AppTranslate
					:translate-params="{
						maxFilesize: formatNumber(maxFilesize / 1024 / 1024),
					}"
				>
					Song uploads are currently capped at %{ maxFilesize }MB per file. Only MP3s are
					supported at this time.
				</AppTranslate>
			</p>

			<AppFormControlUpload :validators="[validateFilesize(maxFilesize)]" accept=".mp3" />

			<AppFormControlErrors :label="$gettext(`song`)" />
		</AppFormGroup>

		<AppFormButton>
			<AppTranslate>Save Song</AppTranslate>
		</AppFormButton>
	</AppForm>
</template>
