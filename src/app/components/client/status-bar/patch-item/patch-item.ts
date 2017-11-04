import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./patch-item.html?style=./patch-item.styl';

import { AppProgressBar } from '../../../../../lib/gj-lib-client/components/progress/bar/bar';
import { ClientLibraryStore, ClientLibraryState } from '../../../../store/client-library';

@View
@Component({
	components: {
		AppProgressBar,
	},
})
export class AppClientStatusBarPatchItem extends Vue {
	@Prop(Number) packageId: number;

	@ClientLibraryState packages: ClientLibraryStore['packages'];
	@ClientLibraryState numPatching: ClientLibraryStore['numPatching'];

	get pkg() {
		return this.packages.find(i => i.id === this.packageId);
	}

	get width() {
		return 1 / this.numPatching * 100.0 + '%';
	}
}
