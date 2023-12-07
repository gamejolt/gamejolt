<script lang="ts" setup>
import { PropType, computed, toRefs } from 'vue';
import { RouteLocationRaw } from 'vue-router';
import { useOnHover } from '../../../../../_common/on/useOnHover';
import {
	kThemeBgOffset,
	kThemeFg,
	kThemeFgMuted,
	kThemePrimary,
	kThemePrimaryTrans,
} from '../../../../../_common/theme/variables';
import {
	kElevateTransition,
	styleElevate,
	styleTyped,
	styleWhen,
} from '../../../../../_styles/mixins';
import { kBorderRadiusLg, kBorderWidthLg, kStrongEaseOut } from '../../../../../_styles/variables';

const props = defineProps({
	to: {
		type: [Object, String] as PropType<RouteLocationRaw>,
		default: undefined,
	},
	onClick: {
		type: Function,
		default: undefined,
	},
	borderColor: {
		type: String,
		default: kThemePrimaryTrans,
	},
	borderStyle: {
		type: String as PropType<'solid' | 'dashed'>,
		default: `solid`,
	},
	padding: {
		type: Number,
		default: 8,
		validator: val => typeof val === 'number' && val >= 0,
	},
	paddingH: {
		type: Number,
		default: undefined,
	},
	paddingV: {
		type: Number,
		default: undefined,
	},
	backgroundColor: {
		type: String,
		default: kThemeBgOffset,
	},
	hoverScale: {
		type: Number,
		default: 1.1,
	},
	noScale: {
		type: Boolean,
	},
	center: {
		type: Boolean,
	},
});

const { onClick: onClickProp, to, padding, paddingH, paddingV } = toRefs(props);

const BorderRadius = kBorderRadiusLg;
const BorderWidth = kBorderWidthLg;

const { hoverBinding, hovered } = useOnHover();
const isClickable = computed(() => !!onClickProp?.value || !!to?.value);

function _scalePadding(value: number | null | undefined) {
	return Math.max(0, (value ?? padding.value) - BorderWidth.value);
}

const horizontalPadding = computed(() => _scalePadding(paddingH?.value));
const verticalPadding = computed(() => _scalePadding(paddingV?.value));
</script>

<template>
	<component
		v-bind="{
			...hoverBinding,
			...(to ? { to } : onClickProp ? { onclick: onClickProp } : {}),
		}"
		:is="to ? `RouterLink` : onClickProp ? `a` : `div`"
		:style="
			styleTyped([
				styleElevate(0),
				{
					display: `flex`,
					flexDirection: `column`,
					justifyContent: center ? `center` : `flex-start`,
					position: `relative`,
					width: `100%`,
					height: `100%`,
					backgroundColor,
					borderRadius: BorderRadius.px,
					borderWidth: BorderWidth.px,
					borderColor,
					borderStyle,
					padding: `${verticalPadding}px ${horizontalPadding}px`,
					color: kThemeFg,
				},
				styleWhen(!isClickable, {
					opacity: `0.5`,
					cursor: `not-allowed`,
					color: kThemeFgMuted,
				}),
				styleWhen(isClickable, {
					...styleWhen(hovered, {
						...styleElevate(2),
						...styleWhen(!noScale && hoverScale !== 1, {
							transform: `scale(${hoverScale})`,
						}),
						borderColor: kThemePrimary,
					}),
					// Transition needs to come after the styleEvelate calls so it isn't overwritten.
					transition: `${kElevateTransition}, border-color 300ms ${kStrongEaseOut}, transform 300ms ${kStrongEaseOut}`,
				}),
			])
		"
	>
		<slot
			name="default"
			v-bind="{ hovered, borderRadius: BorderRadius, borderWidth: BorderWidth }"
		/>
	</component>
</template>
