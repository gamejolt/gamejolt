<script lang="ts" setup>
import flip from '@popperjs/core/lib/modifiers/flip';
import hide from '@popperjs/core/lib/modifiers/hide';
import preventOverflow from '@popperjs/core/lib/modifiers/preventOverflow';
import { createPopper, Instance, Options as PopperOptions } from '@popperjs/core/lib/popper-lite';
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue';
import { getActiveTooltip } from './tooltip-controller';

/**
 * This component should be used in any app that wants to use tooltips. It is
 * the component that will actually show the tooltip. The directives decide what
 * this tooltip component does essentially so that we only need one tooltip
 * component in the DOM.
 */

const root = ref<null | HTMLElement>(null);
const popperInstance = ref<null | Instance>(null);
const popperTimeout = ref<null | NodeJS.Timer>(null);

const tooltip = computed(() => getActiveTooltip());

onBeforeUnmount(() => {
	_destroyPopper();
});

// We need to watch for changes of the tooltip instance and its data.
watch(
	tooltip,
	async () => {
		// Wait for the tooltip to be mounted.
		await nextTick();

		if (!tooltip.value || !tooltip.value.text || !tooltip.value.isActive) {
			return _scheduleDestroy();
		}

		await nextTick();
		_show();
	},
	{ deep: true }
);

function _show() {
	if (!tooltip.value || !root.value) {
		return;
	}

	const options: PopperOptions = {
		placement: tooltip.value.placement,
		modifiers: [flip, preventOverflow, hide],
		strategy: 'absolute',
	};

	if (!popperInstance.value) {
		popperInstance.value = createPopper(tooltip.value.el, root.value, options);
	} else {
		_clearPopperTimeout();
		popperInstance.value.setOptions(options);
		// Set the popper reference element to the new tooltip element.
		popperInstance.value.state.elements.reference = tooltip.value.el;
	}
}

function _scheduleDestroy() {
	if (!popperInstance.value) {
		return;
	}

	// Making sure the popper is positioned where it should be if the text
	// content changes. We only want to do this if the tooltip is active though,
	// otherwise we might update positioning to a non-existant reference element.
	if (tooltip.value?.isActive) {
		popperInstance.value.update();
	}

	// Schedule to destroy the popper so that we don't keep checking scroll
	// position if not needed. Needs to be longer than our transition speed.
	if (!popperTimeout.value) {
		popperTimeout.value = setTimeout(() => _destroyPopper(), 300);
	}
}

function _clearPopperTimeout() {
	if (popperTimeout.value) {
		clearTimeout(popperTimeout.value);
		popperTimeout.value = null;
	}
}

function _destroyPopper() {
	// Just in case it might still be scheduled.
	_clearPopperTimeout();

	if (popperInstance.value) {
		popperInstance.value.destroy();
		popperInstance.value = null;
	}
}
</script>

<template>
	<div
		v-if="tooltip"
		ref="root"
		class="tooltip"
		:class="{ '-hide': !tooltip.isActive || !tooltip.text }"
	>
		<div v-if="tooltip.text" class="tooltip-inner">
			{{ tooltip.text }}
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.tooltip
	position: absolute
	top: 0
	display: block !important
	padding: 4px
	font-size: $tooltip-font-size
	line-height: 1.4
	z-index: $zindex-tooltip
	pointer-events: none
	transition: opacity 200ms, visibility 200ms

	&-inner
		rounded-corners()
		max-width: $tooltip-max-width
		padding: 5px 8px
		text-align: center
		color: $tooltip-color
		background-color: $tooltip-bg

	&.-hide
	&[data-popper-reference-hidden]
		opacity: 0
		visibility: hidden
</style>
