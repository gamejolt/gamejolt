<script lang="ts" setup>
import { computed, HTMLAttributes, toRef } from 'vue';
import { RouteLocationRaw, RouterLink } from 'vue-router';

import { useDynamicSlots } from '~common/component-helpers';
import AppJolticon, { Jolticon } from '~common/jolticon/AppJolticon.vue';
import AppCircularProgress from '~common/progress/AppCircularProgress.vue';
import { styleFlexCenter, styleWhen } from '~styles/mixins';
import { kJolticonSize } from '~styles/variables';

type Props = {
	tag?: string;
	primary?: boolean;
	trans?: boolean;
	solid?: boolean;
	overlay?: boolean;
	sparse?: boolean;
	circle?: boolean;
	disabled?: boolean;
	lg?: boolean;
	sm?: boolean;
	block?: boolean;
	blockXs?: boolean;
	icon?: Jolticon;
	iconColor?: 'primary' | 'notice';
	fillColor?: 'overlay-notice';
	badge?: string;
	to?: RouteLocationRaw;
	href?: string;
	target?: string;
	forceHover?: boolean;
	/**
	 * Shows an indeterminate {@link AppCircularProgress} in place of all
	 * content.
	 */
	loading?: boolean;
	/**
	 * Allows a custom icon to be built into the button. Does nothing if
	 * {@link icon} is set.
	 */
	dynamicSlots?: 'icon'[] | Record<'icon', boolean> | boolean;
} & /* @vue-ignore */ Pick<HTMLAttributes, 'onMouseenter' | 'onMouseleave'>;

const {
	tag = 'button',
	primary,
	trans,
	solid,
	overlay,
	sparse,
	circle,
	disabled,
	lg,
	sm,
	block,
	blockXs,
	icon,
	iconColor,
	fillColor,
	badge,
	to,
	href,
	target,
	forceHover,
	loading,
	dynamicSlots = false,
} = defineProps<Props>();

const emit = defineEmits<{
	click: [event: MouseEvent];
}>();

const ourTag = computed(() => {
	if (href) {
		return 'a';
	} else if (to) {
		return RouterLink;
	}
	return tag;
});

const componentAttrs = computed(() => {
	if (ourTag.value === RouterLink) {
		return { to };
	}
	if (ourTag.value === 'a') {
		return { href, target };
	}
	return {};
});

const { hasSlot } = useDynamicSlots(toRef(() => dynamicSlots));
</script>

<template>
	<component
		:is="ourTag"
		type="button"
		class="button"
		:class="{
			'-primary': primary,
			'-solid': solid,
			'-trans': !solid && trans,
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
		v-bind="componentAttrs"
		:disabled="disabled === true ? 'disabled' : null"
		@click="emit('click', $event)"
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

<style lang="stylus" src="~common/button/button.styl" scoped></style>
