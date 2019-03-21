import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import AppExpand from 'game-jolt-frontend-lib/components/expand/expand.vue';
import { BaseForm, FormOnSubmit } from 'game-jolt-frontend-lib/components/form-vue/form.service';
import { KeyGroup } from 'game-jolt-frontend-lib/components/key-group/key-group.model';
import { number } from 'game-jolt-frontend-lib/vue/filters/number';
import { Component, Prop } from 'vue-property-decorator';


@Component({
	components: {
		AppExpand,
	},
	filters: {
		number,
	},
})
export default class FormGameKeyGroupAddKeys extends BaseForm<any> implements FormOnSubmit {
	@Prop(KeyGroup) keyGroup!: KeyGroup;

	warnOnDiscard = false;

	number = number;
	KeyGroup = KeyGroup;

	onSubmit() {
		return Api.sendRequest(
			`/web/dash/developer/games/key-groups/add-keys/` +
				`${this.keyGroup.game_id}/${this.keyGroup.id}`,
			this.formModel
		);
	}
}
