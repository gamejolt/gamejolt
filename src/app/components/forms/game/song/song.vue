<script lang="ts">
import { mixins, Options, Prop } from 'vue-property-decorator';
import { formatNumber } from '../../../../../_common/filters/number';
import AppFormControlUpload from '../../../../../_common/form-vue/controls/upload/AppFormControlUpload.vue';
import { BaseForm, FormOnLoad } from '../../../../../_common/form-vue/form.service';
import { Game } from '../../../../../_common/game/game.model';
import { GameSong } from '../../../../../_common/game/song/song.model';

class Wrapper extends BaseForm<GameSong> {}

@Options({
	components: {
		AppFormControlUpload,
	},
})
export default class FormGameSong extends mixins(Wrapper) implements FormOnLoad {
	@Prop(Object) game!: Game;

	modelClass = GameSong;

	maxFilesize = 0;

	readonly formatNumber = formatNumber;

	get loadUrl() {
		return `/web/dash/developer/games/music/save/${this.game.id}`;
	}

	get fileLabel() {
		if (this.method === 'add') {
			return this.$gettext('dash.games.music.form.add_file_label');
		} else {
			return this.$gettext('dash.games.music.form.change_file_label');
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
	<app-form :controller="form">
		<app-form-group name="title" :label="$gettext(`dash.games.music.form.title_label`)">
			<app-form-control type="text" :validators="[validateMaxLength(150)]" />
			<app-form-control-errors />
		</app-form-group>

		<app-form-group name="file" :label="fileLabel" :optional="method === 'edit'">
			<p class="help-block">
				<translate
					:translate-params="{
						maxFilesize: formatNumber(maxFilesize / 1024 / 1024),
					}"
				>
					Song uploads are currently capped at %{ maxFilesize }MB per file. Only MP3s are
					supported at this time.
				</translate>
			</p>

			<app-form-control-upload :validators="[validateFilesize(maxFilesize)]" accept=".mp3" />

			<app-form-control-errors :label="$gettext(`dash.games.music.form.file_error_label`)" />
		</app-form-group>

		<app-form-button>
			<translate>dash.games.music.form.submit_button</translate>
		</app-form-button>
	</app-form>
</template>
