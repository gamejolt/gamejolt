<script lang="ts">
import { Options, Prop, Vue } from 'vue-property-decorator';
import AppProgressBar from '../../../../../_common/progress/bar/bar.vue';
// import { ClientLibraryState, ClientLibraryStore } from '../../../../store/client-library';

@Options({
	components: {
		AppProgressBar,
	},
})
export default class AppClientStatusBarPatchItem extends Vue {
	@Prop(Number) packageId!: number;

	// @ClientLibraryState packages!: ClientLibraryStore['packages'];
	packages!: any;
	// @ClientLibraryState numPatching!: ClientLibraryStore['numPatching'];
	numPatching!: any;

	get pkg() {
		return this.packages.find(i => i.id === this.packageId);
	}

	get width() {
		return (1 / this.numPatching) * 100.0 + '%';
	}
}
</script>

<template>
	<AppProgressBar
		:percent="(pkg.patchProgress || 0) * 100"
		thin
		:style="{ width }"
		:active="pkg.isUnpacking"
		:indeterminate="pkg.isUnpacking"
	/>
</template>

<style lang="stylus" scoped>
.progress
	display: inline-block
	margin: 0 !important

	+ .progress
		margin-left: 1px
</style>
