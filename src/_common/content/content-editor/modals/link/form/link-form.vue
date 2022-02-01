<script lang="ts">
import { mixins, Options } from 'vue-property-decorator';
import { BaseForm } from '../../../../../form-vue/form.service';
import { LinkData } from '../link-modal.service';

class Wrapper extends BaseForm<LinkData> {}

@Options({})
export default class AppFormContentEditorLink extends mixins(Wrapper) {
	get valid() {
		// Matches something.something
		return this.formModel.href.length > 0 && !!this.formModel.href.match(/.+\..+/);
	}

	onInit() {
		this.setField('href', this.formModel.href || '');
		this.setField('title', this.formModel.title || '');
	}
}
</script>

<template>
	<AppForm :controller="form">
		<AppFormGroup name="href" :optional="false" :label="$gettext(`Link Destination`)">
			<AppFormControl placeholder="https://example.com" focus />
		</AppFormGroup>

		<AppFormButton :disabled="!valid">
			<AppTranslate>Insert Link</AppTranslate>
		</AppFormButton>
	</AppForm>
</template>
