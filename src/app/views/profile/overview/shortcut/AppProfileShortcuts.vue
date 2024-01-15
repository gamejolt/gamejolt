<script lang="ts">
import { PropType } from 'vue';
import { Jolticon } from '../../../../../_common/jolticon/AppJolticon.vue';
import { ProfileTileAction } from '../RouteProfileOverview.vue';
import AppProfileShortcut from './AppProfileShortcut.vue';

export type ProfileQuickLink = {
	label: string;
	icon: Jolticon;
} & ProfileTileAction;

const itemWidth = 58;
</script>

<script lang="ts" setup>
defineProps({
	items: {
		type: Array as PropType<ProfileQuickLink[]>,
		required: true,
	},
	centered: {
		type: Boolean,
	},
});
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
