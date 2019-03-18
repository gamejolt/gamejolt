import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import AppProgressBar from 'game-jolt-frontend-lib/components/progress/bar/bar.vue'
import { ClientLibraryStore, ClientLibraryState } from '../../../../store/client-library';

@Component({
	components: {
		AppProgressBar,
	},
})
export default class AppClientStatusBarPatchItem extends Vue {
	@Prop(Number) packageId!: number;

	@ClientLibraryState packages!: ClientLibraryStore['packages'];
	@ClientLibraryState numPatching!: ClientLibraryStore['numPatching'];

	get pkg() {
		return this.packages.find(i => i.id === this.packageId);
	}

	get width() {
		return (1 / this.numPatching) * 100.0 + '%';
	}
}
