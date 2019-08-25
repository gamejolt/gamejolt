import AppExpand from '../../../../../_common/expand/expand.vue';
import AppFormControlToggle from '../../../../../_common/form-vue/control/toggle/toggle.vue';
import { BaseForm, FormOnInit } from '../../../../../_common/form-vue/form.service';
import { Game } from '../../../../../_common/game/game.model';
import { Site } from '../../../../../_common/site/site-model';
import { User } from '../../../../../_common/user/user.model';
import { Component, Prop } from 'vue-property-decorator';

interface FormModel {
	type: string;
}

@Component({
	components: {
		AppFormControlToggle,
		AppExpand,
	},
})
export default class FormSiteDomain extends BaseForm<FormModel> implements FormOnInit {
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
