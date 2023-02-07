<script lang="ts" setup>
import { onMounted, toRefs } from 'vue';
import { defineAdAdapterComponentProps } from '../adapter-base';
import { AdPlaywireAdapter } from './playwire-adapter';

const props = defineProps({
	...defineAdAdapterComponentProps<AdPlaywireAdapter>(),
});

const { adapter } = toRefs(props);

onMounted(() => {
	adapter.value.run(async ramp => {
		await ramp.addUnits({
			selectorId: 'ad-playwire-video',
			type: 'trendi_video',
		});
		ramp.displayUnits();
	});
});
</script>

<template>
	<div id="ad-playwire-video-container">
		<div id="ad-playwire-video" />
	</div>
</template>
