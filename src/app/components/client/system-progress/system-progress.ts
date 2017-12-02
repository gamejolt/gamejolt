import Vue, { CreateElement } from 'vue';
import { Component } from 'vue-property-decorator';

import { ClientLibraryState, ClientLibraryStore } from '../../../store/client-library';
import { ClientControl } from '../control/client.service';

@Component({})
export class AppClientSystemProgress extends Vue {
	@ClientLibraryState totalPatchProgress: ClientLibraryStore['totalPatchProgress'];

	render(h: CreateElement) {
		const progress = this.totalPatchProgress;
		if (progress === null) {
			ClientControl.clearProgressBar();
		} else {
			ClientControl.setProgressBar(progress);
		}

		return h('div');
	}
}
