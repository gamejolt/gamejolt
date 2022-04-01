<script lang="ts" setup>
import { watch } from 'vue';
import { Client } from '../../../_common/client/client.service';
import { useClientLibraryStore } from '../../store/client-library/index';

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
