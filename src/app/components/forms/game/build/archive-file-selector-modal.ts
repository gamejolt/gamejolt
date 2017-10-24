import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./archive-file-selector.html';
import { BaseModal } from '../../../../../lib/gj-lib-client/components/modal/base';
import { Api } from '../../../../../lib/gj-lib-client/components/api/api.service';
import { AppJolticon } from '../../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppLoading } from '../../../../../lib/gj-lib-client/vue/components/loading/loading';

@View
@Component({
	components: {
		AppJolticon,
		AppLoading,
	},
})
export default class AppArchiveFileSelectorModal extends BaseModal {
	@Prop(Number) gameId: number;
	@Prop(Number) packageId: number;
	@Prop(Number) releaseId: number;
	@Prop(Number) buildId: number;
	@Prop(Number) primaryFileId: number;
	@Prop(String) platform: string;

	isLoaded = false;
	files: string[] = [];
	filter = '';

	async created() {
		try {
			const params = [
				this.gameId,
				this.packageId,
				this.releaseId,
				this.buildId,
				this.primaryFileId,
				this.platform,
			];

			const response = await Api.sendRequest(
				'/web/dash/developer/games/builds/files/archive-file-list/' + params.join('/')
			);
			this.files = response.fileList || [];
		} catch (err) {
			this.files = [];
		} finally {
			this.isLoaded = true;
		}
	}

	get filteredFiles() {
		if (!this.filter) {
			return this.files;
		}

		return this.files.filter(file => file.indexOf(this.filter) !== -1);
	}

	select(selected: string) {
		this.modal.resolve(selected);
	}

	close() {
		this.modal.dismiss();
	}
}
