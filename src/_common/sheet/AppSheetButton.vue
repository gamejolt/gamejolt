<script lang="ts" setup>
import { computed } from 'vue';
import { RouteLocationRaw, RouterLink } from 'vue-router';

import AppJolticon, { Jolticon } from '~common/jolticon/AppJolticon.vue';
import AppOnHover from '~common/on/AppOnHover.vue';
import { kThemeBg, kThemeBiBg, kThemeBiFg, kThemeFg } from '~common/theme/variables';
import { kFontSizeLarge } from '~styles/variables';

type Props = {
	icon: Jolticon;
	to?: RouteLocationRaw;
};
const { icon, to } = defineProps<Props>();

const ourTag = computed(() => (to ? RouterLink : 'div'));
</script>

<template>
	<AppOnHover v-slot="{ hoverBinding, hovered }">
		<component
			:is="ourTag"
			class="elevate-1 rounded-lg"
			v-bind="{
				...hoverBinding,
				style: {
					display: `flex`,
					flexDirection: `column`,
					height: `150px`,
					padding: `16px`,
					backgroundColor: hovered ? kThemeBiBg : kThemeBg,
					color: hovered ? kThemeBiFg : kThemeFg,
					transition: 'background-color 0.1s ease, color 0.1s ease',
				},
			}"
			:to="to"
		>
			<div
				:style="{
					fontWeight: `bold`,
					fontSize: kFontSizeLarge.px,
				}"
			>
				<slot />
			</div>
			<div class="flex-auto" />
			<AppJolticon class="text-[40px]" :icon="icon" />
		</component>
	</AppOnHover>
</template>
