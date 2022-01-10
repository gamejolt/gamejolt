import { mixins, Options } from 'vue-property-decorator';
import AppFormControlToggle from '../../../../../_common/form-vue/controls/AppFormControlToggle.vue';
import { BaseForm } from '../../../../../_common/form-vue/form.service';

export type FormModel = {
	auto_feature: boolean;
};

class Wrapper extends BaseForm<FormModel> {}

@Options({
	components: {
		AppFormControlToggle,
	},
})
export default class FormFiresidePublish extends mixins(Wrapper) {
	onInit() {
		this.setField('auto_feature', true);
	}

	showAdvancedCommunityOptions = false;
}
