<script lang="ts" setup>
import { watch } from 'vue';

import { useClientLibraryStore } from '~app/store/client-library/index';
import { Client } from '~common/client/client.service';

const { totalPatchProgress } = useClientLibraryStore();

watch(totalPatchProgress, progress => {
	if (progress === null) {
		Client.clearProgressBar();
	} else {
		Client.setProgressBar(progress);
	}
});
</script>

<template>
	<div />
</template>
