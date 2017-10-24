import { Component } from 'vue-property-decorator';
import View from '!view!./header.html';

import {
	BaseForm,
	FormOnLoad,
} from '../../../../../lib/gj-lib-client/components/form-vue/form.service';
import { Game } from '../../../../../lib/gj-lib-client/components/game/game.model';
import { AppFormControlUpload } from '../../../../../lib/gj-lib-client/components/form-vue/control/upload/upload';

@View
@Component({
	components: {
		AppFormControlUpload,
	},
})
export class FormGameHeader extends BaseForm<Game> implements FormOnLoad {
	modelClass = Game;
	resetOnSubmit = true;
	saveMethod = '$saveHeader' as '$saveHeader';

	maxFilesize = 0;
	minAspectRatio = 0;
	maxAspectRatio = 0;
	minWidth = 0;
	maxWidth = 0;

	get loadUrl() {
		return `/web/dash/developer/games/header/save/${this.model!.id}`;
	}

	onLoad(payload: any) {
		this.maxFilesize = payload.maxFilesize;
		this.minAspectRatio = payload.minAspectRatio;
		this.maxAspectRatio = payload.maxAspectRatio;
		this.minWidth = payload.minWidth;
		this.maxWidth = payload.maxWidth;
	}
}
