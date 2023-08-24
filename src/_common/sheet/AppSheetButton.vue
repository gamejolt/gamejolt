<script lang="ts" setup>
import { PropType, computed, toRefs } from 'vue';
import { RouteLocationRaw, RouterLink } from 'vue-router';
import { styleBorderRadiusLg, styleWhen } from '../../_styles/mixins';
import { kFontSizeLarge } from '../../_styles/variables';
import AppJolticon, { Jolticon } from '../jolticon/AppJolticon.vue';
import AppOnHover from '../on/AppOnHover.vue';
import { kThemeBg, kThemeBiBg, kThemeBiFg, kThemeFg } from '../theme/variables';

const props = defineProps({
	icon: {
		type: String as PropType<Jolticon>,
		required: true,
	},
	to: {
		type: null as unknown as PropType<RouteLocationRaw>,
		default: undefined,
	},
});

const { to } = toRefs(props);

const ourTag = computed(() => (to?.value ? RouterLink : 'div'));
</script>

<template>
	<AppOnHover v-slot="{ binding, hovered }">
		<Component
			:is="ourTag"
			v-bind="binding"
			class="elevate-1"
			:style="{
				...styleBorderRadiusLg,
				display: `flex`,
				flexDirection: `column`,
				height: `150px`,
				padding: `16px`,
				backgroundColor: kThemeBg,
				color: kThemeFg,
				transition: 'background-color 0.1s ease, color 0.1s ease',
				...styleWhen(hovered, {
					backgroundColor: kThemeBiBg,
					color: kThemeBiFg,
				}),
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
			<div :style="{ flex: `auto` }" />
			<AppJolticon :style="{ fontSize: `40px` }" :icon="icon" />
		</Component>
	</AppOnHover>
</template>
