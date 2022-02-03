<script lang="ts">
import { Options, Prop, Vue } from 'vue-property-decorator';
import { shallowSetup } from '../../../../../utils/vue';
import AppProgressBar from '../../../../../_common/progress/bar/bar.vue';
import { useClientLibraryStore } from '../../../../store/client-library/index';

@Options({
	components: {
		AppProgressBar,
	},
})
export default class AppClientStatusBarPatchItem extends Vue {
	@Prop(Number) packageId!: number;

	readonly clientLibrary = shallowSetup(() => useClientLibraryStore());

	get pkg() {
		return this.clientLibrary.packagesById.value[this.packageId];
	}

	get width() {
		return (1 / this.clientLibrary.numPatching.value) * 100.0 + '%';
	}
}
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
