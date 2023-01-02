<script lang="ts">
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
</script>

<template>
	<AppForm :controller="form">
		<AppFormGroup
			v-if="showAdvancedCommunityOptions"
			name="auto_feature"
			:label="$gettext(`Automatically feature in community?`)"
		>
			<template #inline-control>
				<AppFormControlToggle />
			</template>

			<p class="help-block">
				<AppTranslate>
					Will automatically feature this fireside in your selected community. This will
					notify every member in the community that the fireside has started.
				</AppTranslate>
			</p>
		</AppFormGroup>

		<AppFormButton :disabled="!valid">
			<AppTranslate>Publish</AppTranslate>
		</AppFormButton>
	</AppForm>
</template>

<style lang="stylus" scoped></style>
