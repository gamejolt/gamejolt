<script lang="ts">
import { mixins, Options } from 'vue-property-decorator';
import { AppFocusWhen } from '../../../../../form-vue/focus-when.directive';
import { BaseForm } from '../../../../../form-vue/form.service';
import { LinkData } from '../link-modal.service';

class Wrapper extends BaseForm<LinkData> {}

@Options({
	directives: {
		AppFocusWhen,
	},
})
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
	<app-form :controller="form">
		<app-form-group name="href" :optional="false" :label="$gettext(`Link Destination`)">
			<app-form-control v-app-focus-when placeholder="https://example.com" />
		</app-form-group>

		<!-- <app-form-group
		name="title"
		:optional="true"
		:label="$gettext(`Link Title`)">
		<app-form-control
			:placeholder="$gettext(`Enter a text that describes your link destination.`)"
			/>
		</app-form-group> -->

		<app-form-button :disabled="!valid">
			<translate>Insert Link</translate>
		</app-form-button>
	</app-form>
</template>
