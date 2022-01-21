<script lang="ts">
import { computed, inject, InjectionKey, provide, reactive } from 'vue';
import { useForm } from './AppForm.vue';
import { useFormGroup } from './AppFormGroup.vue';
import { FormValidatorError } from './validators';

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

// // These are default messages that don't need any extra validation data. They
// // are also common enough to be applied to all elements.
// const ErrorMessagesBase: Record<string, string> = {
// 	required: `You must enter a {}.`,
// 	server: `The {} you've entered is invalid.`,
// 	pattern: `Please enter a valid {}.`,
// 	url: `Please enter a valid URL.`,
// 	accept: `The chosen {} is the wrong type of file.`,
// 	email: `Please enter a valid email address.`,
// 	number: `Please enter a valid number.`,
// 	currency: `Please enter a valid amount.`,
// 	decimal: `Please enter a valid amount.`,
// 	min_value: `The {} entered is too low.`,
// 	max_value: `The {} entered is too high.`,
// 	availability: `This {} is already in use.`,
// 	min_date: `The time you selected is too early.`,
// 	max_date: `The time you selected is too late.`,
// 	max_content_length: `The {} is too long.`,
// 	content_required: `You must enter a {}.`,
// 	content_no_media_uploads: `We are uploading your images...`,
// };

const form = useForm()!;
const group = useFormGroup()!;

const _label = computed(() => (props.label || group.humanLabel || '').toLocaleLowerCase());
const hasServerError = computed(() => !!form.serverErrors[group.name]);

const error = computed(() => {
	// Only show input errors if the field has been modified from its initial
	// state, or if they tried submitting the form.
	if (group.error && (group.dirty || form.attemptedSubmit)) {
		return _processMessage(group.error);
	}

	if (hasServerError.value) {
		return _processMessage({
			type: 'server',
			message: `The {} you've entered is invalid.`,
		});
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
	// the error messages we overrode.
	// TODO(vue3)
	// const serverErrors = form.serverErrors;
	// for (const errorType of Object.keys(serverErrors)) {
	// 	if (serverErrors[errorType] && c.errorMessageOverrides[errorType]) {
	// 		return _processMessage(errorType, label);
	// 	}
	// }

	return undefined;
});

function _processMessage(error: FormValidatorError) {
	const overrides = c.errorMessageOverrides;
	const message = overrides[error.type] ?? error.message;
	return message.replace(/\{\}/g, _label.value);
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
