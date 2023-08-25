<script lang="ts" setup>
import { computed, PropType, ref, useSlots } from 'vue';
import { uuidv4 } from '../../utils/uuid';
import { getTranslation, interpolateTranslation, TranslationContext } from './translate.service';

const props = defineProps({
	tag: {
		type: String,
		default: 'span',
	},
	translateN: {
		type: Number,
		default: undefined,
	},
	translatePlural: {
		type: String,
		default: undefined,
	},
	translateParams: {
		type: Object as PropType<TranslationContext>,
		default: undefined,
	},
	translateComment: {
		type: String,
		default: undefined,
	},
});

const slots = useSlots();

// We are trying to pull the text from the default slot element.
const slotContent = slots.default?.()?.[0].children?.toString().trim();
const msgid = ref(slotContent ?? '');

const isPlural = computed(
	() => props.translateN !== undefined && props.translatePlural !== undefined
);

if (!isPlural.value && (props.translateN !== undefined || props.translatePlural)) {
	throw new Error(
		`"translate-n" and "translate-plural" attributes must be used together: ${msgid.value}.`
	);
}

const translation = computed(() => {
	const str = getTranslation(
		msgid.value,
		props.translateN,
		isPlural.value ? props.translatePlural : null
	);

	if (!props.translateParams) {
		return str;
	}

	return interpolateTranslation(str, props.translateParams, {});
});

// TODO(vue3): we should see if we can get rid of this now with vue3
const key = uuidv4();
</script>

<template>
	<component :is="tag" :key="key">{{ translation }}</component>
</template>
