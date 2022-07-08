<script lang="ts" setup>
import { computed } from 'vue';
import { useFiresideController } from '../../../components/fireside/controller/controller';
import AppFiresideBottomBarHost from './AppFiresideBottomBarHost.vue';

const c = useFiresideController()!;
const { rtc } = c;

const listableStreamingUsers = computed(() => rtc.value?.listableStreamingUsers ?? []);
</script>

<template>
	<div class="bottom-bar-hosts">
		<div class="-hosts">
			<AppFiresideBottomBarHost
				v-for="host of listableStreamingUsers"
				:key="host.uid"
				class="-host-thumb"
				:host="host"
			/>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.bottom-bar-hosts
	--fireside-host-size: 64px
	--fireside-host-gap: 8px
	width: 100%
	// This extra padding is so that the shadows of the floating avatars don't
	// get cut off
	padding: 4px 4px 0 4px

.-hosts
	display: inline-flex
	justify-content: center
	grid-gap: var(--fireside-host-gap)
	height: var(--fireside-host-size)

.-host-thumb
	flex: none
</style>
