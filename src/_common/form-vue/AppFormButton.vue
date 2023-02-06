<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import AppButton from '../button/AppButton.vue';
import AppJolticon from '../jolticon/AppJolticon.vue';
import { useForm } from './AppForm.vue';

const props = defineProps({
	showWhenValid: {
		type: Boolean,
	},
	primary: {
		type: Boolean,
		default: true,
	},
	trans: {
		type: Boolean,
	},
	overlay: {
		type: Boolean,
	},
	solid: {
		type: Boolean,
		default: true,
	},
	block: {
		type: Boolean,
	},
	lg: {
		type: Boolean,
	},
	icon: {
		type: String,
		default: undefined,
	},
	disabled: {
		type: Boolean,
	},
});

const emit = defineEmits({
	'before-submit': (_e: Event) => true,
	'after-submit': (_e: Event, _result: boolean) => true,
});

const form = useForm()!;

const isShowingSuccess = ref(false);

// When the form is submitted, we want to show a success indicator.
const shouldShow = computed(() => {
	if (!props.showWhenValid) {
		return true;
	}

	return form.changed && form.valid;
});

watch(
	() => form.submitted,
	submitted => {
		if (submitted) {
			showSuccess();
		}
	}
);

let successClearTimeout: NodeJS.Timer | undefined;

function showSuccess() {
	// Reset the timeout if it's already showing.
	if (successClearTimeout) {
		clearTimeout(successClearTimeout);
	}

	isShowingSuccess.value = true;

	successClearTimeout = setTimeout(() => {
		isShowingSuccess.value = false;
		successClearTimeout = undefined;
	}, 2000);
}

// The app-button component used to automatically submit forms through the
// native default behaviour of its underlying <button> element. (the <button>
// element's type attribute is considered to be 'submit' when unspecified), so
// in places where we wanted to use app-button in forms without submitting the
// form we'd add a @click.prevent on it.
//
// The problem with this is that if app-buttons are v-if'ed away in a
// transition, they Vue vm for the elements is destroyed and all non native vue
// event handlers we set on the element are unbound (including the
// @click.prevent) before the transition ends. This means that during the time
// between the component being v-ifed away and the transition ending clicks that
// happen on the component will not get prevented - resulting in the form being
// submitted.
//
// To fix this, we set the default behaviour of app-button to not submit the
// form, and set a NATIVE click event handler on the app-form-button component
// to manually submit the form.
async function onClick(e: Event) {
	emit('before-submit', e);
	if (e.defaultPrevented) {
		return;
	}

	const result = await form.submit();
	emit('after-submit', e, result);
}
</script>

<template>
	<AppButton
		v-if="shouldShow"
		:primary="primary"
		:trans="trans"
		:overlay="overlay"
		:solid="solid"
		:block="block"
		:disabled="disabled || form.isProcessing"
		:icon="icon"
		@click="onClick"
	>
		<slot />
		<transition>
			<AppJolticon v-if="isShowingSuccess" class="form-success-icon" icon="check" middle />
		</transition>
	</AppButton>
</template>

<style lang="stylus" scoped>
.form-success-icon
	margin-right: 0
	width: 20px
	overflow: hidden
	transition: opacity 300ms, width 300ms

	&.v-enter-from
	&.v-leave-to
		opacity: 0
		width: 0
</style>
