<script lang="ts">
import { PropType } from 'vue';
import { Jolticon } from '../../../../../_common/jolticon/AppJolticon.vue';
import { ProfileTileAction } from '../RouteProfileOverview.vue';

export type ProfileQuickLink = {
	label: string;
	icon: Jolticon;
} & ProfileTileAction;
</script>

<script lang="ts" setup>
defineProps({
	items: {
		type: Array as PropType<ProfileQuickLink[]>,
		required: true,
	},
});
</script>

<template>
	<div
		v-if="$slots.default"
		:style="{
			display: `grid`,
			gridTemplateColumns: `repeat(auto-fill, minmax(64px, 1fr))`,
			gap: `12px`,
		}"
	>
		<slot v-for="item in items" v-bind="item" :key="item.label" />
		<slot name="extras" />
	</div>
</template>
