<script lang="ts" setup>
import { computed } from 'vue';
import AppProgressBar from '../../../../_common/progress/AppProgressBar.vue';
import { useClientLibraryStore } from '../../../store/client-library/index';

const props = defineProps({
	packageId: {
		type: Number,
		required: true,
	},
});

const { packagesById, numPatching } = useClientLibraryStore();

const pkg = computed(() => packagesById.value[props.packageId]);
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
