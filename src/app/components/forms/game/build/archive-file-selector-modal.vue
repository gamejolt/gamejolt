<script lang="ts">
import { mixins, Options, Prop } from 'vue-property-decorator';
import { Api } from '../../../../../_common/api/api.service';
import AppLoading from '../../../../../_common/loading/AppLoading.vue';
import { BaseModal } from '../../../../../_common/modal/base';

@Options({
	components: {
		AppLoading,
	},
})
export default class AppArchiveFileSelectorModal extends mixins(BaseModal) {
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
</script>

<template>
	<AppModal>
		<div class="modal-controls">
			<AppButton @click="close()">
				<AppTranslate>Cancel</AppTranslate>
			</AppButton>
		</div>

		<div class="modal-header">
			<h2 class="modal-title">
				<AppTranslate>Select Executable File</AppTranslate>
			</h2>
		</div>

		<div class="modal-body">
			<AppLoading v-if="!isLoaded" :big="true" class="loading-centered" />

			<div v-else-if="files.length">
				<div class="form-group">
					<input
						v-model="filter"
						class="form-control"
						type="search"
						:placeholder="$gettext(`Filter files...`)"
					/>
				</div>

				<div class="list-group">
					<a
						v-for="(file, i) of filteredFiles"
						:key="i"
						class="list-group-item thin"
						@click="select(file)"
					>
						{{ file }}
					</a>
				</div>
			</div>

			<div v-else class="alert alert-notice">
				<p>
					<AppTranslate>
						Oh no! We didn't find any executable files for this platform in the archive.
					</AppTranslate>
				</p>
			</div>
		</div>
	</AppModal>
</template>
