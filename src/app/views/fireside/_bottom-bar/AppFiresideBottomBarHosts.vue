<script lang="ts" setup>
import { computed } from 'vue';
import { useFiresideController } from '../../../components/fireside/controller/controller';
import AppFiresideBottomBarHost from './AppFiresideBottomBarHost.vue';

const c = useFiresideController()!;
const { rtc } = c;

const listableStreamingUsers = computed(() => rtc.value?.listableStreamingUsers ?? []);
</script>

<template>
	<div class="-hosts">
		<div class="-hosts-inner">
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
.-hosts
	--fireside-host-size: 64px
	--fireside-host-gap: 8px
	width: 100%

	&-inner
		display: inline-flex
		justify-content: center
		grid-gap: var(--fireside-host-gap)
		height: var(--fireside-host-size)

.-host-thumb
	flex: none
</style>
