<script lang="ts" setup>
import { PropType, computed, toRefs } from 'vue';
import { RouteLocationRaw } from 'vue-router';
import { useOnHover } from '../../../../_common/on/useOnHover';
import {
	kThemeBgOffset,
	kThemeFg,
	kThemeFgMuted,
	kThemePrimary,
	kThemePrimaryTrans,
} from '../../../../_common/theme/variables';
import {
	kElevateTransition,
	styleElevate,
	styleTyped,
	styleWhen,
} from '../../../../_styles/mixins';
import { kBorderRadiusLg, kBorderWidthBase, kStrongEaseOut } from '../../../../_styles/variables';

const props = defineProps({
	to: {
		type: [Object, String] as PropType<RouteLocationRaw>,
		default: undefined,
	},
	onClick: {
		type: Function,
		default: undefined,
	},
	borderRadius: {
		type: Number,
		default: () => kBorderRadiusLg.value,
	},
	borderWidth: {
		type: Number,
		default: () => kBorderWidthBase.value,
	},
	borderColor: {
		type: String,
		default: kThemePrimaryTrans,
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

const {
	onClick: onClickProp,
	to,
	borderWidth,
	borderColor,
	padding,
	paddingH,
	paddingV,
} = toRefs(props);

const isClickable = computed(() => !!onClickProp?.value || !!to?.value);

const { hoverBinding, hovered } = useOnHover();

function _scalePadding(value: number | null | undefined) {
	return Math.max(0, (value ?? padding.value) - borderWidth.value);
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
					borderRadius: `${borderRadius}px`,
					borderWidth: `${borderWidth}px`,
					borderStyle: `solid`,
					borderColor,
					padding: `${verticalPadding}px ${horizontalPadding}px`,
					color: kThemeFg,
				},
				styleWhen(!isClickable, {
					opacity: `0.5`,
					cursor: `not-allowed`,
					color: kThemeFgMuted,
				}),
				styleWhen(isClickable, [
					styleWhen(hovered, [
						styleElevate(2),
						styleWhen(!noScale && hoverScale !== 1, {
							transform: `scale(${hoverScale})`,
						}),
						{
							borderColor: kThemePrimary,
						},
					]),
					{
						// Transition needs to come after the styleEvelate calls so it isn't overwritten.
						transition: `${kElevateTransition}, border-color 300ms ${kStrongEaseOut}, transform 300ms ${kStrongEaseOut}`,
					},
				]),
			])
		"
	>
		<slot name="default" v-bind="{ hovered, borderRadius, borderWidth }" />
	</component>
</template>
