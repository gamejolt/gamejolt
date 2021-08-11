import { h } from 'vue';
import { Options, Vue } from 'vue-property-decorator';
import { Client } from '../../../../_common/client/client.service';
import { ClientLibraryState, ClientLibraryStore } from '../../../store/client-library';

@Options({})
export class AppClientSystemProgress extends Vue {
	@ClientLibraryState totalPatchProgress!: ClientLibraryStore['totalPatchProgress'];

	render() {
		const progress = this.totalPatchProgress;
		if (progress === null) {
			Client.clearProgressBar();
		} else {
			Client.setProgressBar(progress);
		}

		return h('div');
	}
}
