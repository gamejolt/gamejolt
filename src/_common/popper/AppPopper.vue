<script lang="ts">
import { Placement } from '@popperjs/core/lib';
import arrow, { ArrowModifier } from '@popperjs/core/lib/modifiers/arrow';
import flip, { FlipModifier } from '@popperjs/core/lib/modifiers/flip';
import hide from '@popperjs/core/lib/modifiers/hide';
import preventOverflow, {
	PreventOverflowModifier,
} from '@popperjs/core/lib/modifiers/preventOverflow';
import { createPopper, Instance, Options as PopperOptions } from '@popperjs/core/lib/popper-lite';
import {
	computed,
	nextTick,
	onBeforeUnmount,
	onMounted,
	onUnmounted,
	PropType,
	ref,
	toRefs,
	useSlots,
	watch,
} from 'vue';
import { useRouter } from 'vue-router';
import { styleWhen } from '../../_styles/mixins';
import { Backdrop, BackdropController } from '../backdrop/backdrop.service';
import { vAppObserveDimensions } from '../observe-dimensions/observe-dimensions.directive';
import { Screen } from '../screen/screen-service';
import AppScrollScroller from '../scroll/AppScrollScroller.vue';
import { Popper } from './popper.service';
import './popper.styl';

type ActualTrigger = 'click' | 'hover' | 'manual';

export type PopperTriggerType = ActualTrigger | 'right-click';
export type PopperPlacementType = Placement;

// Sync with the styles files.
const TransitionTime = 200;

let PopperIndex = 0;

const TouchablePointerTypes = ['touch', 'pen'];

const baseModifiers = [
	flip,
	preventOverflow,
	arrow,
	hide,
	{
		// padding between popper and viewport
		name: 'preventOverflow',
		options: {
			padding: 5,
		},
	} as PreventOverflowModifier,
	{
		// padding between popper-arrow and corner, to prevent overflow with border-radius
		name: 'arrow',
		options: {
			padding: 8,
		},
	} as ArrowModifier,
];

const defaultFallbackPlacements: PopperPlacementType[] = ['top', 'bottom', 'right', 'left'];

function makeModifiers(fallbackPlacements: PopperPlacementType[]) {
	return [
		...baseModifiers,
		{
			name: 'flip',
			options: {
				fallbackPlacements,
				// This will allow us to slightly overflow the viewport horizontally
				// without leaving our default placement. We seem to need some top/buttom
				// padding to prevent flickering.
				padding: {
					top: 20,
					bottom: 20,
					right: -20,
					left: -20,
				},
			},
		} as FlipModifier,
	];
}
</script>

<script lang="ts" setup>
const props = defineProps({
	/**
	 * Used to force show the popover unconditionally. Useful when developing
	 * functionality inside the popover.
	 *
	 * It is basically equivalent to trigger = manual + manual-show = true
	 */
	debug: {
		type: Boolean,
		default: false,
	},
	placement: {
		type: String as PropType<PopperPlacementType>,
		default: 'bottom',
	},
	/**
	 * Allows us to customize the fallback placements allowed for poppers so we
	 * can force poppers to use a specific placement.
	 *
	 * See {@link defaultFallbackPlacements} for the defaults.
	 */
	fallbackPlacements: {
		type: Array as PropType<PopperPlacementType[]>,
		default: defaultFallbackPlacements,
	},
	trigger: {
		type: String as PropType<PopperTriggerType>,
		default: 'click',
	},
	/**
	 * Normally we allow the cursor to move over the actual popover element that
	 * shows. Setting this to true will disable this functionality and the
	 * popover will hide immediately when you hover away from the trigger
	 * element.
	 */
	noHoverPopover: {
		type: Boolean,
	},
	/**
	 * We want the popper to be 'display: fixed' if we use it on a fixed parent.
	 * This should prevent stuttering on scroll if the popper is attached to the nav.
	 */
	fixed: {
		type: Boolean,
	},
	/**
	 * By default the popper will stay on the page until the user clicks outside
	 * of the popper. This tells the popper to close anytime the state changes.
	 * Useful for poppers in the shell that link to other pages on the site.
	 */
	hideOnStateChange: {
		type: Boolean,
	},
	/**
	 * Whether or not the popper should size itself to the same width as the
	 * trigger. Useful for poppers that work like "select" type controls.
	 */
	trackTriggerWidth: {
		type: Boolean,
	},
	/**
	 * Allows you to force a width. Will still size smaller on mobile to fit the
	 * screen size.
	 */
	width: {
		type: String,
		default: undefined,
	},
	/**
	 * For popovers that need a specific max-height, header and footer included.
	 * Should be set as a string, so include the unit (px, %, etc).
	 */
	maxHeight: {
		type: String,
		default: undefined,
	},
	/**
	 * If the trigger is `manual` you can control whether or not this popper is
	 * showing through this prop.
	 */
	manualShow: {
		type: Boolean,
	},
	/**
	 * Anytime this value changes, we'll hide the popper. Useful if we want to
	 * force a hide when the popper goes out of view.
	 */
	hideTrigger: {
		type: Number,
		default: 0,
	},
	/**
	 * Will force a block-level display type on the trigger element.
	 */
	block: {
		type: Boolean,
	},
	/**
	 * Will hide the arrow pointing to the trigger element.
	 */
	sansArrow: {
		type: Boolean,
	},
	/**
	 * Delay for showing a hover-based popper.
	 */
	showDelay: {
		type: Number,
		default: 0,
	},
	/**
	 * Allows setting a css class on the popper content.
	 */
	popoverClass: {
		type: String,
		default: undefined,
	},
	/**
	 * Query selector that the popper will teleport to. Defaults to `body`.
	 */
	to: {
		type: String,
		default: 'body',
	},
});

const emit = defineEmits({
	triggerClicked: (_event: MouseEvent) => true,
	contextMenu: (_event: MouseEvent) => true,
	mouseEnter: (_event: MouseEvent) => true,
	mouseLeave: (_event: MouseEvent) => true,
	clickAway: (_event: MouseEvent) => true,
	show: () => true,
	hide: () => true,
});

const {
	debug,
	placement,
	fallbackPlacements,
	trigger,
	noHoverPopover,
	fixed,
	hideOnStateChange,
	trackTriggerWidth,
	width,
	maxHeight,
	manualShow,
	hideTrigger,
	block,
	sansArrow,
	showDelay,
	popoverClass,
} = toRefs(props);

const slots = useSlots();
const router = GJ_HAS_ROUTER ? useRouter() : undefined;

const debugActual = computed(() => GJ_BUILD_TYPE !== 'build' && debug.value);

const isHiding = ref(false);
const isVisible = ref(false);
const calculatedWidth = ref('');
const maxWidth = ref('');

const triggerElem = ref<HTMLElement>();
const popperElem = ref<HTMLElement>();

const popperIndex = PopperIndex++;
const popperId = `popper-${popperIndex}`;

let popperInstance: Instance | undefined;
let _hideTimeout: NodeJS.Timer | undefined;
let _showDelayTimer: NodeJS.Timer | undefined;
let _mobileBackdrop: BackdropController | undefined;

const computedMaxHeight = computed(() => {
	if (maxHeight?.value) {
		return maxHeight.value;
	}

	return Screen.height - 100 + 'px';
});

const contentClass = computed(() => {
	const classes = [popoverClass?.value];

	if (trackTriggerWidth.value) {
		classes.push('-track-trigger-width');
	}

	return classes.join(' ');
});

const popperOptions = computed((): PopperOptions => {
	return {
		placement: placement.value,
		modifiers: [...makeModifiers(fallbackPlacements?.value)],
		strategy: fixed.value ? 'fixed' : 'absolute',
	};
});

let _deregisterRouter: () => void | undefined;

onMounted(() => {
	if (!slots.default) {
		throw Error('AppPopper is a wrapper - put popper reference in the default slot.');
	}

	if (router) {
		_deregisterRouter = router.beforeEach((_to, _from, next) => {
			_stateChangeHide();
			next();
		});
	}

	Popper.registerPopper(popperIndex, {
		onHideAll: () => {
			if (trigger.value === 'manual' || debugActual.value) {
				return;
			}

			if (isVisible.value) {
				_hide();
			}
		},
	});

	onManualShow();
});

onBeforeUnmount(() => {
	// Destroy the popper instance and element before we lose our $refs.
	_destroyPopper();

	// Just in case the popover wasn't cleaned up properly.
	document.removeEventListener('click', _onClickAway, true);
	_removeBackdrop();
});

onUnmounted(() => {
	_deregisterRouter?.();
	_removeBackdrop();
	Popper.deregisterPopper(popperIndex);
});

watch([manualShow, debugActual], onManualShow);

watch(hideTrigger, _hide);

function _stateChangeHide() {
	if (isVisible.value && hideOnStateChange.value) {
		_hide();
	}
}

function onDimensionsChanged() {
	if (popperInstance) {
		popperInstance.update();
	}
}

function onTriggerClicked(event: MouseEvent) {
	emit('triggerClicked', event);

	// We want to prevent right-click, hover, and manual triggers from showing poppers on left-click.
	// clickAway() listener will hide poppers when needed, so we only need to show poppers here.
	if (trigger.value !== 'click') {
		return;
	}

	if (isVisible.value) {
		return _hide();
	}

	_show();
}

function onContextMenu(event: MouseEvent) {
	emit('contextMenu', event);

	if (trigger.value !== 'right-click') {
		return;
	}

	event.preventDefault();

	if (isVisible.value) {
		return _hide();
	}

	Popper.hideAll();
	_show();
}

function onPopoverEnter(event: PointerEvent) {
	if (noHoverPopover.value) {
		return;
	}
	onMouseEnter(event);
}

function onPopoverLeave(event: PointerEvent) {
	if (noHoverPopover.value) {
		return;
	}
	onMouseLeave(event);
}

function onMouseEnter(event: PointerEvent) {
	// We never want this to trigger on 'touch' or 'pen' inputs.
	if (TouchablePointerTypes.includes(event.pointerType)) {
		return;
	}

	emit('mouseEnter', event);

	if (trigger.value !== 'hover') {
		return;
	}

	// Cancel the hiding of the popper if re-hovered. We need
	// to do this when moving between a trigger and its popper.
	_clearHideTimeout();

	// Reverse the hiding if the element is re-hovered.
	if (isHiding.value) {
		isHiding.value = false;
		return;
	}

	if (isVisible.value) {
		return;
	}

	_showDelayTimer = setTimeout(() => _show(), showDelay.value);
}

function onMouseLeave(event: PointerEvent) {
	// We never want this to trigger on 'touch' or 'pen' inputs.
	if (TouchablePointerTypes.includes(event.pointerType)) {
		return;
	}

	emit('mouseLeave', event);

	if (trigger.value !== 'hover') {
		return;
	}

	if (_showDelayTimer) {
		clearTimeout(_showDelayTimer);
		_showDelayTimer = undefined;
	}

	if (!isVisible.value) {
		return;
	}

	_hide();
}

function _onClickAway(event: MouseEvent) {
	if (
		event.target instanceof Node &&
		(popperElem.value?.contains(event.target) || triggerElem.value?.contains(event.target))
	) {
		return;
	}

	emit('clickAway', event);

	if (trigger.value === 'click' || trigger.value === 'right-click') {
		_hide();
		document.removeEventListener('click', _onClickAway, true);
	}
}

async function _createPopper() {
	isVisible.value = true;
	await nextTick();

	// Don't create the popper if we managed to remove it during the
	// previous await.
	if (!triggerElem.value || !popperElem.value) {
		isVisible.value = false;
		return;
	}

	popperInstance = createPopper(triggerElem.value, popperElem.value, popperOptions.value);
	document.addEventListener('click', _onClickAway, true);
}

function _destroyPopper() {
	_clearHideTimeout();

	// Clean up any remaining popper elements and instances
	if (popperInstance) {
		popperInstance.destroy();
		popperInstance = undefined;
	}

	isVisible.value = false;
	isHiding.value = false;
}

async function _show() {
	emit('show');
	_clearHideTimeout();
	await _createPopper();

	_calcWidth();
	_addBackdrop();
}

function _calcWidth() {
	// If we are tracking a particular element's width, then we set this popover
	// to be the same width as the element. We don't track width when it's an XS
	// screen since we do a full width popover in those cases.
	if (trackTriggerWidth.value && !Screen.isXs) {
		if (triggerElem.value) {
			calculatedWidth.value = triggerElem.value.offsetWidth + 'px';
			maxWidth.value = 'none';
			return;
		}
	}

	if (width?.value) {
		maxWidth.value = width.value;
		// This makes sure that smaller screen sizes won't actually allow it to
		// be too large.
		calculatedWidth.value = 'calc(100vw - 10px)';
		return;
	}

	// Reset.
	maxWidth.value = '';
	calculatedWidth.value = '';
}

function _hide() {
	if (debugActual.value) {
		return;
	}

	// In case a popper was hidden from something other than a click,
	// like right-clicking a cbar item or Popover.hideAll() being triggered.
	document.removeEventListener('click', _onClickAway, true);

	isHiding.value = true;
	_clearHideTimeout();
	_hideTimeout = setTimeout(() => _hideDone(), TransitionTime);
	_removeBackdrop();
}

function _hideDone() {
	emit('hide');
	_destroyPopper();
}

function _addBackdrop() {
	if (Screen.isXs && isVisible.value && !_mobileBackdrop) {
		_mobileBackdrop = Backdrop.push({ className: 'popper-backdrop' });
	}
}

function _removeBackdrop() {
	if (_mobileBackdrop) {
		_mobileBackdrop.remove();
		_mobileBackdrop = undefined;
	}
}

function _clearHideTimeout() {
	if (_hideTimeout) {
		clearTimeout(_hideTimeout);
		_hideTimeout = undefined;
	}
}

function onManualShow() {
	if (debugActual.value) {
		return _show();
	}

	if (trigger.value !== 'manual') {
		return;
	}
	if (manualShow.value) {
		return _show();
	}
	return _hide();
}
</script>

<template>
	<div
		:id="popperId"
		ref="triggerElem"
		class="popper"
		:class="{ '-block': block }"
		@click="onTriggerClicked"
		@contextmenu="onContextMenu"
		@pointerenter="onMouseEnter"
		@pointerleave="onMouseLeave"
	>
		<slot v-bind="{ isShowingPopper: isVisible }" />

		<teleport v-if="isVisible" :to="to">
			<div
				ref="popperElem"
				v-app-observe-dimensions="onDimensionsChanged"
				class="popper-wrapper"
				:class="{ '-hide': isHiding, '-ssr': GJ_IS_SSR }"
				:style="
					styleWhen(noHoverPopover, {
						pointerEvents: `none`,
					})
				"
				@mouseenter="onPopoverEnter"
				@mouseleave="onPopoverLeave"
			>
				<div v-if="!sansArrow" class="popper-arrow" data-popper-arrow />
				<div
					class="popper-content"
					:class="contentClass"
					:style="{
						maxHeight: computedMaxHeight,
						width: calculatedWidth,
						maxWidth,
					}"
				>
					<div class="-header">
						<slot name="header" />
					</div>
					<AppScrollScroller class="-main" thin>
						<slot name="popover" />
					</AppScrollScroller>
					<div class="-footer">
						<slot name="footer" />
					</div>
				</div>
			</div>
		</teleport>
	</div>
</template>

<style lang="stylus" scoped>
.popper-content
	display: flex
	flex-direction: column
</style>
