<script lang="ts" setup>
import { ref, useTemplateRef, watch } from 'vue';

import { getScreen } from '~common/screen/screen-service';

type StickerChargeTooltipTrigger = 'hover' | 'focus';

type Props = {
	trigger: StickerChargeTooltipTrigger;
	disabled?: boolean;
	inline?: boolean;
};
const { trigger, disabled, inline } = defineProps<Props>();

const emit = defineEmits<{
	show: [];
	hide: [];
}>();

const root = useTemplateRef('root');

let canClearFocus = false;
const isFocused = ref(false);

watch(
	() => disabled,
	isDisabled => {
		if (isDisabled) {
			onBlur();
		}
	}
);

// Reset our state when this changes. Otherwise there may be issues syncing
// state between hover/focus states.
watch(() => trigger, onBlur);

function onMouseHoverHelp(isHovering: boolean) {
	if (disabled) {
		return;
	}

	if (!isHovering) {
		emit('hide');
	} else if (getScreen().isPointerMouse.value) {
		emit('show');
	}
}

async function onFocus() {
	if (disabled) {
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
		(root.value as HTMLElement | null)?.blur();
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
