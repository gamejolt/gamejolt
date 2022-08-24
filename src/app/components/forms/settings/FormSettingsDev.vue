<script lang="ts" setup>
import { computed } from 'vue';
import {
	ConfigOption,
	ConfigOptionBoolean,
	ConfigOptionString,
	configSaveOverrides,
	ConfigService,
} from '../../../../_common/config/config.service';
import AppForm, { createForm, FormController } from '../../../../_common/form-vue/AppForm.vue';
import AppFormControl from '../../../../_common/form-vue/AppFormControl.vue';
import AppFormGroup from '../../../../_common/form-vue/AppFormGroup.vue';
import AppFormControlSelect from '../../../../_common/form-vue/controls/AppFormControlSelect.vue';
import AppFormControlToggle from '../../../../_common/form-vue/controls/AppFormControlToggle.vue';
import AppTranslate from '../../../../_common/translate/AppTranslate.vue';

type FormModel = Record<string, boolean | string>;

const tests = computed((): (ConfigOptionBoolean | ConfigOptionString)[] => {
	return ConfigService.options.filter(
		i => i instanceof ConfigOptionBoolean || i instanceof ConfigOptionString
	);
});

const form: FormController<FormModel> = createForm({
	warnOnDiscard: false,
	onInit() {
		for (const test of tests.value) {
			form.formModel[test.name] = test.value;
		}
	},
	onChange() {
		configSaveOverrides(form.formModel);
	},
});

function isBool(option: ConfigOption) {
	return option instanceof ConfigOptionBoolean;
}

function isString(option: ConfigOption) {
	return option instanceof ConfigOptionString && option.validValues !== false;
}

function stringValues(option: ConfigOption): string[] {
	if (option instanceof ConfigOptionString && option.validValues !== false) {
		return option.validValues;
	}
	return [];
}

function isStringCustom(option: ConfigOption) {
	return option instanceof ConfigOptionString && option.validValues === false;
}
</script>

<template>
	<AppForm :controller="form">
		<fieldset id="settings-dev">
			<legend>
				<AppTranslate>Dev</AppTranslate>
			</legend>

			<AppFormGroup
				v-for="test of tests"
				:key="test.name"
				:name="test.name"
				:label="`Test: ${test.name}`"
			>
				<template v-if="isBool(test)" #inline-control>
					<AppFormControlToggle />
				</template>

				<AppFormControlSelect v-if="isString(test)">
					<option v-for="v in stringValues(test)" :key="v" :value="v">
						{{ v }}
					</option>
				</AppFormControlSelect>

				<AppFormControl v-if="isStringCustom(test)" />
			</AppFormGroup>
		</fieldset>
	</AppForm>
</template>
