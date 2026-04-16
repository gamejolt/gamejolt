<script lang="ts" setup>
import { computed, ref, useSlots } from 'vue';

import { uuidv4 } from '../../utils/uuid';
import { getTranslation, interpolateTranslation, TranslationContext } from './translate.service';

type Props = {
	tag?: string;
	translateN?: number;
	translatePlural?: string;
	translateParams?: TranslationContext;
	translateComment?: string;
};
const {
	tag = 'span',
	translateN,
	translatePlural,
	translateParams,
} = defineProps<Props>();

const slots = useSlots();

// We are trying to pull the text from the default slot element.
const slotContent = slots.default?.()?.[0].children?.toString().trim();
const msgid = ref(slotContent ?? '');

const isPlural = computed(
	() => translateN !== undefined && translatePlural !== undefined
);

if (!isPlural.value && (translateN !== undefined || translatePlural)) {
	throw new Error(
		`"translate-n" and "translate-plural" attributes must be used together: ${msgid.value}.`
	);
}

const translation = computed(() => {
	const str = getTranslation(
		msgid.value,
		translateN,
		isPlural.value ? translatePlural : null
	);

	if (!translateParams) {
		return str;
	}

	return interpolateTranslation(str, translateParams, {});
});

// TODO(vue3): we should see if we can get rid of this now with vue3
const key = uuidv4();
</script>

<template>
	<component :is="tag" :key="key">{{ translation }}</component>
</template>
