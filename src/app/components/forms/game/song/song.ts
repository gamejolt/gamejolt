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
	@Prop(Game) game!: Game;

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
