import AppFormControlUpload from '../../../../../_common/form-vue/control/upload/upload.vue';
import AppForm from '../../../../../_common/form-vue/form';
import { BaseForm, FormOnInit, FormOnLoad } from '../../../../../_common/form-vue/form.service';
import { Game } from '../../../../../_common/game/game.model';
import { GameScreenshot } from '../../../../../_common/game/screenshot/screenshot.model';
import { Component, Prop } from 'vue-property-decorator';

@Component({
	components: {
		AppFormControlUpload,
	},
})
export default class FormGameImage extends BaseForm<GameScreenshot>
	implements FormOnInit, FormOnLoad {
	modelClass = GameScreenshot;
	resetOnSubmit = true;

	@Prop(Game) game!: Game;

	$refs!: {
		form: AppForm;
	};

	maxFilesize = 0;
	maxWidth = 0;
	maxHeight = 0;

	get loadUrl() {
		return `/web/dash/developer/games/media/save/image/${this.game.id}`;
	}

	onInit() {
		this.setField('game_id', this.game.id);
	}

	onLoad(payload: any) {
		this.maxFilesize = payload.maxFilesize;
		this.maxWidth = payload.maxWidth;
		this.maxHeight = payload.maxHeight;
	}

	imagesSelected() {
		// When images are selected, submit the form immediately.
		this.$refs.form.submit();
	}
}
