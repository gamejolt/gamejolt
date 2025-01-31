<script lang="ts" setup>
import { computed, PropType, toRefs } from 'vue';
import { RouteLocationRaw, RouterLink } from 'vue-router';
import { styleFlexCenter, styleWhen } from '../../_styles/mixins';
import { kJolticonSize } from '../../_styles/variables';
import { defineDynamicSlotProps, useDynamicSlots } from '../component-helpers';
import AppJolticon, { Jolticon } from '../jolticon/AppJolticon.vue';
import AppCircularProgress from '../progress/AppCircularProgress.vue';

const props = defineProps({
	tag: {
		type: String,
		default: 'button',
	},
	primary: {
		type: Boolean,
	},
	trans: {
		type: Boolean,
	},
	solid: {
		type: Boolean,
	},
	overlay: {
		type: Boolean,
	},
	sparse: {
		type: Boolean,
	},
	circle: {
		type: Boolean,
	},
	disabled: {
		type: Boolean,
	},
	lg: {
		type: Boolean,
	},
	sm: {
		type: Boolean,
	},
	block: {
		type: Boolean,
	},
	blockXs: {
		type: Boolean,
	},
	icon: {
		type: String as PropType<Jolticon>,
		default: undefined,
	},
	iconColor: {
		type: String as PropType<'primary' | 'notice'>,
		default: undefined,
	},
	fillColor: {
		type: String as PropType<'overlay-notice'>,
		default: undefined,
	},
	badge: {
		type: String,
		default: undefined,
	},
	to: {
		type: null as unknown as PropType<RouteLocationRaw>,
		default: undefined,
	},
	href: {
		type: String,
		default: undefined,
	},
	target: {
		type: String,
		default: undefined,
	},
	forceHover: {
		type: Boolean,
	},
	/**
	 * Shows an indeterminate {@link AppCircularProgress} in place of all
	 * content.
	 */
	loading: {
		type: Boolean,
	},
	/**
	 * Allows a custom icon to be built into the button. Does nothing if
	 * {@link icon} is set.
	 */
	...defineDynamicSlotProps(['icon'], false),
});

const { dynamicSlots } = toRefs(props);

const ourTag = computed(() => {
	if (props.href) {
		return 'a';
	} else if (props.to) {
		return RouterLink;
	}
	return props.tag;
});

const { hasSlot } = useDynamicSlots(dynamicSlots);
</script>

<template>
	<component
		:is="ourTag"
		type="button"
		class="button"
		:class="{
			'-primary': primary,
			'-trans': trans,
			'-solid': solid,
			'-outline': !solid && !trans,
			'-overlay': overlay,
			'-circle': circle,
			'-sparse': sparse || circle,
			'-lg': lg,
			'-sm': sm,
			'-block': block,
			'-block-xs': blockXs,
			'-disabled': disabled,
			'-hover': forceHover,
			[`-fill-color-${fillColor}`]: !!fillColor,
		}"
		:style="
			styleWhen((sparse || circle) && loading, {
				padding: 0,
			})
		"
		:to="to"
		:href="href"
		:target="target"
		:disabled="disabled === true ? 'disabled' : null"
	>
		<div v-if="loading" :style="styleFlexCenter()">
			<AppCircularProgress
				:style="{
					height: `33px`,
					width: `33px`,
					paddingTop: `6px`,
					paddingBottom: `6px`,
				}"
			/>
		</div>
		<template v-else>
			<span v-if="badge" class="-badge">{{ badge }}</span>
			<AppJolticon
				v-if="icon"
				class="-icon"
				:class="[iconColor ? `-icon-color-${iconColor}` : undefined]"
				:icon="icon"
				:big="lg"
			/>
			<div v-else-if="hasSlot('icon')" class="-icon" :style="{ display: `inline-block` }">
				<slot name="icon" :size="lg ? kJolticonSize.value * 2 : kJolticonSize.value" />
			</div>

			<slot />
		</template>
	</component>
</template>

<style lang="stylus" src="./button.styl" scoped></style>
