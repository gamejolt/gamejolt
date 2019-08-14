import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { findRequiredVueParent } from '../../../utils/vue';
import { number } from '../../../vue/filters/number';
import AppFormTS from '../form';
import AppFormGroupTS from '../group/group';

// These are default messages that don't need any extra validation data.
// They are also common enough to be applied to all elements.
const ErrorMessagesBase: { [k: string]: string } = {
	required: `You must enter a {}.`,
	server: `The {} you've entered is invalid.`,
	pattern: `Please enter a valid {}.`,
	url: `Please enter a valid URL.`,
	accept: `The chosen {} is the wrong type of file.`,
	email: `Please enter a valid email address.`,
	number: `Please enter a valid number.`,
	currency: `Please enter a valid amount.`,
	decimal: `Please enter a valid amount.`,
	min_value: `The {} entered is too low.`,
	max_value: `The {} entered is too high.`,
	availability: `This {} is already in use.`,
	min_date: `The time you selected is too early.`,
	max_date: `The time you selected is too late.`,
	max_content_length: `The {} is too long.`,
	content_required: `You must enter a {}.`,
	content_no_media_uploads: `We are uploading your images...`,
};

@Component({})
export default class AppFormControlErrors extends Vue {
	@Prop(String) label?: string;
	@Prop(String) position?: string;
	@Prop(Boolean) hideCaret?: boolean;

	form!: AppFormTS;
	group!: AppFormGroupTS;

	private errorMessageOverrides: { [k: string]: string } = {};

	created() {
		this.form = findRequiredVueParent(this, require('../form.vue').default) as AppFormTS;
		this.group = findRequiredVueParent(
			this,
			require('../group/group.vue').default
		) as AppFormGroupTS;
	}

	get _label() {
		const ourLabel = this.label;
		const groupLabel = this.group.humanLabel;
		return (ourLabel || groupLabel || '').toLowerCase();
	}

	get hasServerError(): boolean {
		return !!this.form.base.serverErrors[this.group.name];
	}

	get error() {
		const label = this._label;

		// Only show input errors if the field has been modified from its initial state, or if they
		// tried submitting the form.
		if (this.group.inputErrors && (this.group.changed || this.form.base.attemptedSubmit)) {
			const errors = (this.group.inputErrors as any).errors;
			if (errors.length) {
				return this.processMessage(errors[0].rule, label);
			}
		}

		if (this.hasServerError) {
			return this.processMessage('server', label);
		}

		return undefined;
	}

	setMessageOverride(when: string, message: string) {
		this.errorMessageOverrides[when] = message;
	}

	private processMessage(rule: string, label: string) {
		let message = '';
		const data = this.group.control.validationRules && this.group.control.validationRules[rule];
		const errorMessages = Object.assign({}, ErrorMessagesBase, this.errorMessageOverrides);

		// Pull from the group's validation data to find out the rest of the messages.
		// When an input has validations like maxlength, we register the attribute's value.
		// This way we can message on it better.
		switch (rule) {
			case 'max':
				message =
					'Please enter a {} shorter than or equal to ' + number(data) + ' characters.';
				break;

			case 'min':
				message =
					'Please enter a {} longer than or equal to ' + number(data) + ' characters.';
				break;

			case 'pattern':
				if (data === 'urlPath') {
					message = 'Please use only letters, numbers, and hyphens (-).';
				} else if (data === 'hashtag') {
					message = 'Please use only letters, numbers, and underscores (_).';
				} else if (data === 'username') {
					message = 'Please use only letters, numbers, hyphens (-), and underscores (_).';
				}
				break;

			case 'filesize':
				message =
					'The chosen {} exceeds the maximum file size of ' +
					number(data / 1024 / 1024) +
					'MB.';
				break;

			case 'img_dimensions':
				{
					const width = data[0];
					const height = data[1];

					if (width && height) {
						message =
							'The dimensions of your {} must be exactly ' +
							number(width) +
							'x' +
							number(height) +
							'px.';
					} else if (width) {
						message = 'The width of your {} must be exactly ' + number(width) + 'px.';
					} else if (height) {
						message = 'The height of your {} must be exactly ' + number(height) + 'px.';
					}
				}
				break;

			case 'min_img_dimensions':
				{
					const width = data[0];
					const height = data[1];

					if (width && height) {
						message =
							'What is this, a center for ants!? ' +
							'The dimensions of your {} must be at least ' +
							number(width) +
							'x' +
							number(height) +
							'px.';
					} else if (width) {
						message =
							'What is this, a center for ants!? ' +
							'The width of your {} must be at least ' +
							number(width) +
							'px.';
					} else if (height) {
						message =
							'What is this, a center for ants!? ' +
							'The height of your {} must be at least ' +
							number(height) +
							'px.';
					}
				}
				break;

			case 'max_img_dimensions':
				{
					const width = data[0];
					const height = data[1];

					if (width && height) {
						message =
							'Your {} is too large. ' +
							'The dimensions must be no greater than ' +
							number(width) +
							'x' +
							number(height) +
							'px.';
					} else if (width) {
						message =
							'Your {} is too wide. ' +
							'The width must be no greater than ' +
							number(width) +
							'px.';
					} else if (height) {
						message =
							'Your {} is too tall. ' +
							'The height must be no greater than ' +
							number(height) +
							'px.';
					}
				}
				break;

			case 'img_ratio':
				message =
					'Your {} has an incorrect aspect ratio. ' +
					'Its width divided by height must be exactly ' +
					number(data) +
					'.';
				break;

			case 'min_img_ratio':
				message =
					'Your {} has an incorrect aspect ratio. ' +
					'Its width divided by height must be at least ' +
					number(data) +
					'.';
				break;

			case 'max_img_ratio':
				message =
					'Your {} has an incorrect aspect ratio. ' +
					'Its width divided by height must be no greater than ' +
					number(data) +
					'.';
				break;
		}

		if (!message) {
			message = errorMessages[rule];
		}

		return message.replace(/\{\}/g, label);
	}
}
