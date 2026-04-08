<script lang="ts" setup>
import { nextTick, onMounted, ref, useTemplateRef, watch } from 'vue';

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
const {
	theme = 'dark',
	type = 'image',
	size = 'normal',
	badgeLocation = 'bottomright',
} = defineProps<Props>();

const emit = defineEmits<{
	response: [response: string];
	expired: [];
}>();

const grecaptchaRef = useTemplateRef<HTMLDivElement>('grecaptcha');

const resetting = ref(false);
const loaded = ref(false);
const valid = ref(false);
const widgetId = ref(0);

const loadedAndValid = ref(false);

onMounted(() => {
	init();
});

watch([() => theme, () => type, () => size, () => badgeLocation], () => {
	init();
});

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
	loadedAndValid.value = loaded.value && valid.value;

	if (!valid.value) {
		return;
	}

	// Wait one tick to give the captcha element a chance to load in.
	await nextTick();

	widgetId.value = grecaptcha.render(grecaptchaRef.value!, {
		sitekey: Environment.recaptchaSiteKey,
		theme,
		type,
		size,
		badge: badgeLocation,
		callback: response => emit('response', response),
		'expired-callback': () => emit('expired'),
	});
	resetting.value = false;
}
</script>

<template>
	<span>
		<AppLoading v-if="!loaded" />
		<div v-else ref="grecaptcha">
			<AppTranslate v-if="!loadedAndValid">
				We could not load in Google's captcha widget.
			</AppTranslate>
		</div>
	</span>
</template>
