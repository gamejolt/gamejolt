import Component from 'vue-class-component';
import AppFormControlToggle from '../../../../../_common/form-vue/control/toggle/toggle.vue';
import { BaseForm, FormOnInit } from '../../../../../_common/form-vue/form.service';

export type FormModel = {
	auto_feature: boolean;
};

@Component({
	components: {
		AppFormControlToggle,
	},
})
export default class FormFiresidePublish extends BaseForm<FormModel> implements FormOnInit {
	onInit() {
		this.setField('auto_feature', true);
	}

	showAdvancedCommunityOptions = false;
}
