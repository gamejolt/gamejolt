<script lang="ts" setup>
import { computed } from 'vue';
import { RouteLocationRaw } from 'vue-router';

import { useOnHover } from '~common/on/useOnHover';
import {
	kThemeBgOffset,
	kThemeFg,
	kThemeFgMuted,
	kThemePrimary,
	kThemePrimaryTrans,
} from '~common/theme/variables';
import { kElevateTransition, styleTyped } from '~styles/mixins';
import { kBorderRadiusLg, kBorderWidthLg, kStrongEaseOut } from '~styles/variables';

const BorderRadius = kBorderRadiusLg;
const BorderWidth = kBorderWidthLg;

type Props = {
	to?: RouteLocationRaw;
	onClick?: (e: MouseEvent) => void;
	borderColor?: string;
	borderStyle?: 'solid' | 'dashed';
	backgroundColor?: string;
	padding?: number;
	paddingH?: number;
	paddingV?: number;
	hoverScale?: number;
	disableScale?: boolean;
	center?: boolean;
};
const {
	to,
	onClick: onClickProp,
	borderColor = kThemePrimaryTrans,
	borderStyle = `solid`,
	backgroundColor = kThemeBgOffset,
	padding = 8,
	paddingH,
	paddingV,
	hoverScale = 1.1,
	disableScale,
	center,
} = defineProps<Props>();

const { hoverBinding, hovered } = useOnHover();

const isClickable = computed(() => !!onClickProp || !!to);

function _scalePadding(value: number | null | undefined) {
	return Math.max(0, (value ?? padding) - BorderWidth.value);
}

const horizontalPadding = computed(() => _scalePadding(paddingH));
const verticalPadding = computed(() => _scalePadding(paddingV));
</script>

<template>
	<component
		v-bind="{
			...hoverBinding,
			...(to ? { to } : onClickProp ? { onclick: onClickProp } : {}),
		}"
		:is="to ? `RouterLink` : onClickProp ? `a` : `div`"
		:class="[
			'elevate-transition',
			isClickable && hovered ? 'shadow-elevate-raw-2' : 'shadow-none',
			{
				'opacity-50 cursor-not-allowed': !isClickable,
			},
		]"
		:style="
			styleTyped({
				display: `flex`,
				flexDirection: `column`,
				justifyContent: center ? `center` : `flex-start`,
				position: `relative`,
				width: `100%`,
				height: `100%`,
				backgroundColor,
				borderRadius: BorderRadius.px,
				borderWidth: BorderWidth.px,
				borderColor: isClickable && hovered ? kThemePrimary : borderColor,
				borderStyle,
				padding: `${verticalPadding}px ${horizontalPadding}px`,
				color: !isClickable ? kThemeFgMuted : kThemeFg,
				transform:
					isClickable && hovered && !disableScale && hoverScale !== 1
						? `scale(${hoverScale})`
						: undefined,
				transition: isClickable
					? `${kElevateTransition}, border-color 300ms ${kStrongEaseOut}, transform 300ms ${kStrongEaseOut}`
					: undefined,
			})
		"
	>
		<slot
			name="default"
			v-bind="{ hovered, borderRadius: BorderRadius, borderWidth: BorderWidth }"
		/>
	</component>
</template>
