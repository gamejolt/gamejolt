<script lang="ts">
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
</script>

<template>
	<app-form :controller="form" @changed="onChange">
		<fieldset id="settings-dev">
			<legend>
				<translate>Dev</translate>
			</legend>

			<app-form-group
				v-for="test of tests"
				:key="test.name"
				:name="test.name"
				:label="`Test: ${test.name}`"
			>
				<app-form-control-toggle v-if="isBool(test)" class="pull-right" />
				<app-form-control-select v-else-if="isString(test)">
					<option v-for="v in stringValues(test)" :key="v" :value="v">
						{{ v }}
					</option>
				</app-form-control-select>
			</app-form-group>
		</fieldset>
	</app-form>
</template>
