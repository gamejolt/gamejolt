<script lang="ts">
import { ProfileTileAction } from '~app/views/profile/overview/RouteProfileOverview.vue';

export type ProfileStat = {
	label: string;
	value: number;
	fuzzyThreshold?: number;
} & ProfileTileAction;
</script>

<script lang="ts" setup>
type Props = {
	items: ProfileStat[];
};
defineProps<Props>();
</script>

<template>
	<div
		v-if="$slots.default"
		:style="{
			display: `flex`,
			flexDirection: `row`,
			justifyContent: `space-around`,
			flexWrap: `wrap`,
		}"
	>
		<slot v-for="item in items" v-bind="item" :key="item.label" />
		<slot name="extras" />
	</div>
</template>
