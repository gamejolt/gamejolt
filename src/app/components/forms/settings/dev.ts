import { Options } from 'vue-property-decorator';
import {
	ConfigOption,
	ConfigOptionBoolean,
	ConfigOptionString,
	configSaveOverrides,
	ConfigService,
} from '../../../../_common/config/config.service';
import AppFormControlToggle from '../../../../_common/form-vue/control/toggle/toggle.vue';
import { BaseForm, FormOnInit } from '../../../../_common/form-vue/form.service';

type FormModel = Record<string, boolean | string>;

@Options({
	components: {
		AppFormControlToggle,
	},
})
export default class FormSettingsDev extends BaseForm<FormModel> implements FormOnInit {
	warnOnDiscard = false;

	get tests(): (ConfigOptionBoolean | ConfigOptionString)[] {
		return ConfigService.options.filter(
			i => i instanceof ConfigOptionBoolean || i instanceof ConfigOptionString
		);
	}

	onInit() {
		for (const test of this.tests) {
			this.setField(test.name, test.value);
		}
	}

	onChange() {
		configSaveOverrides(this.formModel);
	}

	isBool(option: ConfigOption) {
		return option instanceof ConfigOptionBoolean;
	}

	isString(option: ConfigOption) {
		return option instanceof ConfigOptionString;
	}

	stringValues(option: ConfigOption): string[] {
		if (option instanceof ConfigOptionString) {
			return option.validValues;
		}
		return [];
	}
}
