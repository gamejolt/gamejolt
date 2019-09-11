import { Component } from 'vue-property-decorator';
import { AppFocusWhen } from '../../../../../form-vue/focus-when.directive';
import { BaseForm, FormOnInit } from '../../../../../form-vue/form.service';
import { LinkData } from '../link-modal.service';

@Component({
	directives: {
		AppFocusWhen,
	},
})
export default class AppFormContentEditorLink extends BaseForm<LinkData> implements FormOnInit {
	get valid() {
		// Matches something.something
		return this.formModel.href.length > 0 && !!this.formModel.href.match(/.+\..+/);
	}

	onInit() {
		this.setField('href', this.formModel.href || '');
		this.setField('title', this.formModel.title || '');
	}
}
