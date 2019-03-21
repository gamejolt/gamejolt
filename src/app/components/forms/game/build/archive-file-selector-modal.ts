import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import { BaseModal } from 'game-jolt-frontend-lib/components/modal/base';
import AppJolticon from 'game-jolt-frontend-lib/vue/components/jolticon/jolticon.vue';
import AppLoading from 'game-jolt-frontend-lib/vue/components/loading/loading.vue';
import { Component, Prop } from 'vue-property-decorator';


@Component({
	components: {
		AppJolticon,
		AppLoading,
	},
})
export default class AppArchiveFileSelectorModal extends BaseModal {
	@Prop(Number) gameId!: number;
	@Prop(Number) packageId!: number;
	@Prop(Number) releaseId!: number;
	@Prop(Number) buildId!: number;
	@Prop(Number) primaryFileId!: number;
	@Prop(String) platform!: string;

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
