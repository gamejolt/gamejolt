<script lang="ts" setup>
import { computed, nextTick, onMounted, ref, useTemplateRef, watch } from 'vue';
import { Environment } from '../../../../_common/environment/environment.service';
import AppLoading from '../../../../_common/loading/AppLoading.vue';
import AppTranslate from '../../../../_common/translate/AppTranslate.vue';
import { GrecaptchaSdk } from '../sdk/sdk.service';

type Props = {
	theme?: 'light' | 'dark';
	type?: 'image' | 'audio';
	size?: 'normal' | 'compact' | 'invisible';
	badgeLocation?: 'bottomright' | 'bottomleft' | 'inline';
};

const props = withDefaults(defineProps<Props>(), {
	theme: 'dark',
	type: 'image',
	size: 'normal',
	badgeLocation: 'bottomright',
});

const emit = defineEmits<{
	response: [response: string];
	expired: [];
}>();

const resetting = ref(false);
const loaded = ref(false);
const valid = ref(false);
const widgetId = ref(0);
const grecaptchaRef = useTemplateRef('grecaptchaRef');

const loadedAndValid = computed(() => loaded.value && valid.value);

async function init() {
	if (resetting.value) {
		return;
	}

	resetting.value = true;
	try {
		await GrecaptchaSdk.load();
		console.log('window.grecaptcha exists: ' + !!window.grecaptcha);
		valid.value = true;
	} catch (err) {
		console.error(err);
	}
	loaded.value = true;

	if (!valid.value) {
		return;
	}

	// Wait one tick to give the captcha element a chance to load in.
	await nextTick();

	if (!grecaptchaRef.value) {
		return;
	}

	widgetId.value = grecaptcha.render(grecaptchaRef.value, {
		sitekey: Environment.recaptchaSiteKey,
		theme: props.theme,
		type: props.type,
		size: props.size,
		badge: props.badgeLocation,
		callback: (response: string) => emit('response', response),
		'expired-callback': () => emit('expired'),
	});
	resetting.value = false;
}

function reset() {
	if (!loadedAndValid.value) {
		return;
	}

	grecaptcha.reset(widgetId.value);
}

// Watch for prop changes
watch(
	() => [props.theme, props.type, props.size, props.badgeLocation],
	() => {
		init();
	}
);

onMounted(() => {
	init();
});

// Expose the reset method
defineExpose({
	reset,
});
</script>

<template>
	<span>
		<AppLoading v-if="!loaded" />
		<div v-else ref="grecaptchaRef">
			<AppTranslate v-if="!loadedAndValid">
				We could not load in Google's captcha widget.
			</AppTranslate>
		</div>
	</span>
</template>
