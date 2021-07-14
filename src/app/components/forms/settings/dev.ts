import { Component } from 'vue-property-decorator';
import {
	configGetAll,
	ConfigOptionBoolean,
	configSaveOverrides,
} from '../../../../_common/config/config.service';
import AppFormControlToggle from '../../../../_common/form-vue/control/toggle/toggle.vue';
import { BaseForm, FormOnInit } from '../../../../_common/form-vue/form.service';

type FormModel = Record<string, boolean>;

@Component({
	components: {
		AppFormControlToggle,
	},
})
export default class FormSettingsDev extends BaseForm<FormModel> implements FormOnInit {
	warnOnDiscard = false;

	// Currently we only support modifying toggles.
	get tests(): ConfigOptionBoolean[] {
		return configGetAll().filter(i => i instanceof ConfigOptionBoolean);
	}

	onInit() {
		for (const test of this.tests) {
			this.setField(test.name, test.value);
		}
	}

	onChange() {
		configSaveOverrides(this.formModel);
	}
}
