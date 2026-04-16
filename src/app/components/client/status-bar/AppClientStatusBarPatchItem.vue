<script lang="ts" setup>
import { computed } from 'vue';

import { useClientLibraryStore } from '~app/store/client-library/index';
import AppProgressBar from '~common/progress/AppProgressBar.vue';

type Props = {
	packageId: number;
};
const { packageId } = defineProps<Props>();

const { packagesById, numPatching } = useClientLibraryStore();

const pkg = computed(() => packagesById.value[packageId]);
const width = computed(() => (1 / numPatching.value) * 100.0 + '%');
</script>

<template>
	<AppProgressBar
		:percent="(pkg?.patchProgress || 0) * 100"
		thin
		:style="{ width }"
		:active="pkg?.isUnpacking ?? false"
		:indeterminate="pkg?.isUnpacking ?? false"
	/>
</template>

<style lang="stylus" scoped>
.progress
	display: inline-block
	margin: 0 !important

	+ .progress
		margin-left: 1px
</style>
