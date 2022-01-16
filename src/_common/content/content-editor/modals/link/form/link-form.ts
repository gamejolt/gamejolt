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