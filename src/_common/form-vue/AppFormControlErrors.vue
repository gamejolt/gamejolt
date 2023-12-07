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

const errorMessage = computed(() => {
	// Only show input errors if the field has been modified from its initial
	// state, or if they tried submitting the form.
	if (error.value && (dirty.value || form.attemptedSubmit)) {
		return _processMessage(error.value);
	}

	const serverErrors = form.serverErrors;

	// Generic server error.
	if (serverErrors[name.value]) {
		return _processMessage({
			type: 'server',
			message: `The {} you've entered is invalid.`,
		});
	}

	// We may have different server errors that are relevant to this field, such
	// as 'title-reserved' or 'title-in-use', etc. We want to check all the
	// overrides just in case one of them triggers against the server error.
	for (const errorType of overrides.value.keys()) {
		if (serverErrors[errorType]) {
			return _processServerMessage(errorType);
		}
	}

	return undefined;
});

function _processMessage(error: FormValidatorError) {
	const message = overrides.value.get(error.type) ?? error.message;
	return processFormValidatorErrorMessage(message, _label.value);
}

function _processServerMessage(errorType: string) {
	const message = overrides.value.get(errorType)!;
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
