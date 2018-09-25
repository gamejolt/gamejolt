import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./domain.html';

import {
	BaseForm,
	FormOnInit,
} from '../../../../../lib/gj-lib-client/components/form-vue/form.service';
import { Site } from '../../../../../lib/gj-lib-client/components/site/site-model';
import { AppFormControlToggle } from '../../../../../lib/gj-lib-client/components/form-vue/control/toggle/toggle';
import { User } from '../../../../../lib/gj-lib-client/components/user/user.model';
import { Game } from '../../../../../lib/gj-lib-client/components/game/game.model';
import { AppExpand } from '../../../../../lib/gj-lib-client/components/expand/expand';

interface FormModel {
	type: string;
}

@View
@Component({
	components: {
		AppFormControlToggle,
		AppExpand,
	},
})
export class FormSiteDomain extends BaseForm<FormModel> implements FormOnInit {
	modelClass = Site as any;
	saveMethod = '$saveDomain' as any;

	@Prop(User) user!: User;
	@Prop(Game) game?: Game;

	onInit() {}

	get ioUrl() {
		return this.createUrl('gamejolt.io');
	}

	get afUrl() {
		return this.createUrl('indie.af');
	}

	private createUrl(baseDomain: string) {
		let url = this.user.username.toLowerCase() + `.<strong>${baseDomain}</strong>`;
		if (this.game) {
			url += '/' + this.game.path;
		}
		return url;
	}
}
