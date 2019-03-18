import AppExpand from 'game-jolt-frontend-lib/components/expand/expand.vue';
import AppFormControlToggle from 'game-jolt-frontend-lib/components/form-vue/control/toggle/toggle.vue';
import { BaseForm, FormOnInit } from 'game-jolt-frontend-lib/components/form-vue/form.service';
import { Game } from 'game-jolt-frontend-lib/components/game/game.model';
import { Site } from 'game-jolt-frontend-lib/components/site/site-model';
import { User } from 'game-jolt-frontend-lib/components/user/user.model';
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
