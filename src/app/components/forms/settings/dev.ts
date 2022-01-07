import { mixins, Options } from 'vue-property-decorator';
import {
	ConfigOption,
	ConfigOptionBoolean,
	ConfigOptionString,
	configSaveOverrides,
	ConfigService,
} from '../../../../_common/config/config.service';
import AppFormControlToggle from '../../../../_common/form-vue/controls/AppFormControlToggle.vue';
import { BaseForm } from '../../../../_common/form-vue/form.service';

type FormModel = Record<string, boolean | string>;

class Wrapper extends BaseForm<FormModel> {}

@Options({
	components: {
		AppFormControlToggle,
	},
})
export default class FormSettingsDev extends mixins(Wrapper) {
	get tests(): (ConfigOptionBoolean | ConfigOptionString)[] {
		return ConfigService.options.filter(
			i => i instanceof ConfigOptionBoolean || i instanceof ConfigOptionString
		);
	}
	created() {
		this.form.warnOnDiscard = false;
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
