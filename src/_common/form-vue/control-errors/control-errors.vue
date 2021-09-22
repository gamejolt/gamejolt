<script lang="ts">
import { computed, inject, InjectionKey, provide, reactive } from 'vue';
import { number } from '../../filters/number';
import { useForm } from '../form.service';
import { useFormControlGroup } from '../group/group.vue';

type Controller = ReturnType<typeof createFormControlErrors>;

const Key: InjectionKey<Controller> = Symbol('form-control-errors');

export function createFormControlErrors() {
	return reactive({
		errorMessageOverrides: {} as Record<string, string>,
	});
}

export function useFormControlErrors() {
	return inject(Key, null);
}

export function setControlErrorsOverride(c: Controller, when: string, message: string) {
	c.errorMessageOverrides[when] = message;
}
</script>

<script lang="ts" setup>
const props = defineProps({
	label: {
		type: String,
		default: undefined,
	},
	position: {
		type: String,
		default: undefined,
	},
	hideCaret: {
		type: Boolean,
	},
});

const c = createFormControlErrors();
provide(Key, c);

// These are default messages that don't need any extra validation data. They
// are also common enough to be applied to all elements.
const ErrorMessagesBase: Record<string, string> = {
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

const form = useForm();
const group = useFormControlGroup()!;

const _label = computed(() => {
	const ourLabel = props.label;
	const groupLabel = group.humanLabel;
	return (ourLabel || groupLabel || '').toLowerCase();
});

const hasServerError = computed(() => {
	return !!form.serverErrors[group.name];
});

const error = computed(() => {
	const label = _label.value;

	// Only show input errors if the field has been modified from its initial
	// state, or if they tried submitting the form.
	if (group.inputErrors && (group.changed || form.attemptedSubmit)) {
		const errors = group.inputErrors.errors;
		if (errors.length) {
			return _processMessage(errors[0].rule, label);
		}
	}

	if (hasServerError.value) {
		return _processMessage('server', label);
	}

	// There may be multiple server errors that are relevant for the same field.
	// For example when adding a community channel a title can be invalid
	// because its already in use, or is a reserved name.
	//
	// If we need to show different error messages for these, we need to be able
	// to capture different custom server error, for example: "title-in-use" and
	// "title-reserved".
	//
	// For this reason, we check the rest of the returning serverErrors against
	// the error messages we overrided.
	const serverErrors = form.serverErrors;
	for (const errorType of Object.keys(serverErrors)) {
		if (serverErrors[errorType] && c.errorMessageOverrides[errorType]) {
			return _processMessage(errorType, label);
		}
	}

	return undefined;
});

function _processMessage(rule: string, label: string) {
	let message = '';
	const data = group.control?.validationRules?.[rule];
	const errorMessages = { ...ErrorMessagesBase, ...c.errorMessageOverrides };

	// Pull from the group's validation data to find out the rest of the messages.
	// When an input has validations like maxlength, we register the attribute's value.
	// This way we can message on it better.
	switch (rule) {
		case 'max':
			message = 'Please enter a {} shorter than or equal to ' + number(data) + ' characters.';
			break;

		case 'min':
			message = 'Please enter a {} longer than or equal to ' + number(data) + ' characters.';
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
</script>

<template>
	<div class="control-errors">
		<p
			v-if="error"
			class="help-block error anim-fade-in"
			:class="{
				'hide-caret': hideCaret,
				above: position === 'above',
			}"
		>
			{{ error }}
		</p>

		<slot style="display: none" />
	</div>
</template>
