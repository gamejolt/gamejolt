import { Component } from 'vue-property-decorator';
import * as View from '!view!./header.html';

import {
	BaseForm,
	FormOnInit,
} from '../../../../../lib/gj-lib-client/components/form-vue/form.service';
import { Game } from '../../../../../lib/gj-lib-client/components/game/game.model';
import { AppFormLoader } from '../../../../../lib/gj-lib-client/components/form-vue/loader/loader';
import { AppFormControlUpload } from '../../../../../lib/gj-lib-client/components/form-vue/control/upload/upload';

@View
@Component({
	components: {
		AppFormLoader,
		AppFormControlUpload,
	},
})
export class FormGameHeader extends BaseForm<Game> implements FormOnInit {
	modelClass = Game;
	resetOnSubmit = true;
	saveMethod = '$saveHeader' as '$saveHeader';

	maxFilesize = 0;
	minAspectRatio = 0;
	maxAspectRatio = 0;
	minWidth = 0;
	maxWidth = 0;

	onInit() {}

	onLoaded(payload: any) {
		this.maxFilesize = payload.maxFilesize;
		this.minAspectRatio = payload.minAspectRatio;
		this.maxAspectRatio = payload.maxAspectRatio;
		this.minWidth = payload.minWidth;
		this.maxWidth = payload.maxWidth;
	}
}
