<script lang="ts">
import { computed, inject, InjectionKey, provide, ref } from 'vue';
import { useForm } from './AppForm.vue';
import { useFormGroup } from './AppFormGroup.vue';
import { FormValidatorError, processFormValidatorErrorMessage } from './validators';

type Controller = ReturnType<typeof createFormControlErrors>;

const Key: InjectionKey<Controller> = Symbol('form-control-errors');

export function useFormControlErrors() {
	return inject(Key, null);
}

export function createFormControlErrors() {
	const overrides = ref(new Map<string, string>());

	function setOverride(validationKey: string, message: string) {
		overrides.value.set(validationKey, message);
	}

	return {
		overrides,
		setOverride,
	};
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

const { overrides } = c;
const form = useForm()!;
const { name, humanLabel: groupLabel, error, dirty } = useFormGroup()!;

const _label = computed(() => (props.label || groupLabel.value || '').toLocaleLowerCase());
const hasServerError = computed(() => !!form.serverErrors[name.value]);

const errorMessage = computed(() => {
	// Only show input errors if the field has been modified from its initial
	// state, or if they tried submitting the form.
	if (error.value && (dirty.value || form.attemptedSubmit)) {
		return _processMessage(error.value);
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
	const message = overrides.value.get(error.type) ?? error.message;
	return processFormValidatorErrorMessage(message, _label.value);
}
</script>

<template>
	<div class="control-errors">
		<p
			v-if="errorMessage"
			class="help-block error anim-fade-in"
			:class="{
				'hide-caret': hideCaret,
				above: position === 'above',
			}"
		>
			{{ errorMessage }}
		</p>

		<slot style="display: none" />
	</div>
</template>
