import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./image.html';

import { GameScreenshot } from '../../../../../lib/gj-lib-client/components/game/screenshot/screenshot.model';
import {
	BaseForm,
	FormOnInit,
} from '../../../../../lib/gj-lib-client/components/form-vue/form.service';
import { Game } from '../../../../../lib/gj-lib-client/components/game/game.model';
import { AppFormLoader } from '../../../../../lib/gj-lib-client/components/form-vue/loader/loader';
import { AppFormControlUpload } from '../../../../../lib/gj-lib-client/components/form-vue/control/upload/upload';
import { AppForm } from '../../../../../lib/gj-lib-client/components/form-vue/form';

@View
@Component({
	components: {
		AppFormLoader,
		AppFormControlUpload,
	},
})
export class FormGameImage extends BaseForm<GameScreenshot> implements FormOnInit {
	modelClass = GameScreenshot;
	resetOnSubmit = true;

	@Prop(Game) game: Game;

	$refs: {
		form: AppForm;
	};

	maxFilesize = 0;
	maxWidth = 0;
	maxHeight = 0;

	onInit() {
		this.setField('game_id', this.game.id);
	}

	onLoaded(payload: any) {
		this.maxFilesize = payload.maxFilesize;
		this.maxWidth = payload.maxWidth;
		this.maxHeight = payload.maxHeight;
	}

	imagesSelected() {
		// When images are selected, submit the form immediately.
		this.$refs.form.submit();
	}
}
