<script lang="ts">
import { ProfileTileAction } from '~app/views/profile/overview/RouteProfileOverview.vue';
import AppProfileShortcut from '~app/views/profile/overview/shortcut/AppProfileShortcut.vue';
import { Jolticon } from '~common/jolticon/AppJolticon.vue';

export type ProfileQuickLink = {
	label: string;
	icon: Jolticon;
} & ProfileTileAction;

const itemWidth = 58;
</script>

<script lang="ts" setup>
type Props = {
	items: ProfileQuickLink[];
	centered?: boolean;
};
const { items, centered = false } = defineProps<Props>();
</script>

<template>
	<div
		v-if="$slots.default || items.length"
		:style="{
			columnGap: `8px`,
			rowGap: `12px`,
			...(centered
				? {
						display: `flex`,
						flexWrap: `wrap`,
						justifyContent: `center`,
					}
				: {
						display: `grid`,
						gridTemplateColumns: `repeat(auto-fit, ${itemWidth}px)`,
						justifyContent: `space-around`,
					}),
		}"
	>
		<AppProfileShortcut
			v-for="item in items"
			:key="item.label"
			:item="item"
			:width="itemWidth"
		/>

		<slot name="default" v-bind="{ itemWidth }" />
	</div>
</template>
