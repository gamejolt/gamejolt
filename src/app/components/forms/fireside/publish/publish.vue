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
	<app-form :controller="form">
		<app-form-group
			v-if="showAdvancedCommunityOptions"
			name="auto_feature"
			:label="$gettext(`Automatically feature in community?`)"
		>
			<app-form-control-toggle class="pull-right" />

			<p class="help-block">
				<translate>
					Will automatically feature this fireside in your selected community. This will
					notify every member in the community that the fireside has started.
				</translate>
			</p>
		</app-form-group>

		<app-form-button :disabled="!valid">
			<translate>Publish</translate>
		</app-form-button>
	</app-form>
</template>

<style lang="stylus" scoped></style>
