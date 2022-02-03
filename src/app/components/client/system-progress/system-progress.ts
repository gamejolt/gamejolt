import { h } from 'vue';
import { Options, Vue } from 'vue-property-decorator';
import { shallowSetup } from '../../../../utils/vue';
import { Client } from '../../../../_common/client/client.service';
import { useClientLibraryStore } from '../../../store/client-library/index';

@Options({})
export class AppClientSystemProgress extends Vue {
	readonly clientLibrary = shallowSetup(() => useClientLibraryStore());

	render() {
		const progress = this.clientLibrary.totalPatchProgress.value;
		if (progress === null) {
			Client.clearProgressBar();
		} else {
			Client.setProgressBar(progress);
		}

		return h('div');
	}
}
