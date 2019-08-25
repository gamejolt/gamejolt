import { Component, Prop } from 'vue-property-decorator';
import { BaseModal } from '../../../../modal/base';
import AppFormContentEditorLink from './form/link-form.vue';
import { LinkData } from './link-modal.service';

@Component({
	components: {
		AppFormContentEditorLink,
	},
})
export default class AppContentEditorLinkModal extends BaseModal {
	@Prop(String)
	selectedText!: string;

	linkData: LinkData = {
		href: '',
		title: '',
	};

	private isValidUrl(text: string) {
		try {
			// This will throw if text is not a valid URL.
			new URL(text);
			return true;
		} catch (error) {
			return false;
		}
	}

	mounted() {
		// Preset the href when the input looks like a url
		if (this.isValidUrl(this.selectedText)) {
			this.linkData.href = this.selectedText;
		}
	}

	onSubmit(data: LinkData) {
		if (!data.title) {
			data.title = data.href;
		}

		if (!this.isValidUrl(data.href)) {
			// Insert protocol if none given
			if (!/^[a-z][a-z0-9+\-\.]*:\/\//i.test(data.href)) {
				data.href = '//' + data.href;
			}
		}

		this.modal.resolve(data);
	}
}
