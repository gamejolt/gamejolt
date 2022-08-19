<script lang="ts" setup>
import { PropType, ref, toRefs, watch } from 'vue';
import { Screen } from '../../screen/screen-service';

type StickerChargeTooltipTrigger = 'hover' | 'focus';

const props = defineProps({
	trigger: {
		type: String as PropType<StickerChargeTooltipTrigger>,
		required: true,
	},
	disabled: {
		type: Boolean,
	},
	inline: {
		type: Boolean,
	},
});

const { trigger, disabled, inline } = toRefs(props);

const emit = defineEmits({
	show: () => true,
	hide: () => true,
});

const root = ref<HTMLDivElement>();

let canClearFocus = false;
const isFocused = ref(false);

watch(disabled, isDisabled => {
	if (isDisabled) {
		onBlur();
	}
});

// Reset our state when this changes. Otherwise there may be issues syncing
// state between hover/focus states.
watch(trigger, onBlur);

function onMouseHoverHelp(isHovering: boolean) {
	if (disabled.value) {
		return;
	}

	if (!isHovering) {
		emit('hide');
	} else if (Screen.isPointerMouse) {
		emit('show');
	}
}

async function onFocus() {
	if (disabled.value) {
		return;
	}

	emit('show');
	isFocused.value = true;
	setTimeout(() => (canClearFocus = isFocused.value), 200);
}

function onBlur() {
	isFocused.value = false;
	canClearFocus = false;
	emit('hide');
}

function onClick() {
	if (isFocused.value && canClearFocus) {
		root.value?.blur();
	}
}
</script>

<template>
	<component
		:is="inline ? 'span' : 'div'"
		ref="root"
		:tabindex="trigger === 'focus' ? '-1' : undefined"
		@mouseenter="onMouseHoverHelp(true)"
		@mouseleave="onMouseHoverHelp(false)"
		@focus="onFocus()"
		@blur="onBlur()"
		@click.capture="onClick()"
	>
		<slot />
	</component>
</template>
