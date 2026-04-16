<script lang="ts" setup>
import { computed, ref } from 'vue';

import { Api } from '~common/api/api.service';
import AppButton from '~common/button/AppButton.vue';
import AppLoading from '~common/loading/AppLoading.vue';
import AppModal from '~common/modal/AppModal.vue';
import { useModal } from '~common/modal/modal.service';
import { $gettext } from '~common/translate/translate.service';
import { run } from '~utils/utils';

type Props = {
	gameId: number;
	packageId: number;
	releaseId: number;
	buildId: number;
	primaryFileId: number;
	platform: string;
};
const { gameId, packageId, releaseId, buildId, primaryFileId, platform } = defineProps<Props>();

const modal = useModal()!;

const isLoaded = ref(false);
const files = ref<string[]>([]);
const filter = ref('');

const filteredFiles = computed(() => {
	if (!filter.value) {
		return files.value;
	}

	return files.value.filter(file => file.indexOf(filter.value) !== -1);
});

run(async () => {
	try {
		const params = [
			gameId,
			packageId,
			releaseId,
			buildId,
			primaryFileId,
			platform,
		];

		const response = await Api.sendRequest(
			'/web/dash/developer/games/builds/files/archive-file-list/' + params.join('/')
		);
		files.value = response.fileList || [];
	} catch (err) {
		files.value = [];
	} finally {
		isLoaded.value = true;
	}
});

function select(selected: string) {
	modal.resolve(selected);
}

function close() {
	modal.dismiss();
}
</script>

<template>
	<AppModal>
		<div class="modal-controls">
			<AppButton @click="close()">
				{{ $gettext(`Cancel`) }}
			</AppButton>
		</div>

		<div class="modal-header">
			<h2 class="modal-title">
				{{ $gettext(`Select Executable File`) }}
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
					{{
						$gettext(
							`Oh no! We didn't find any executable files for this platform in the archive.`
						)
					}}
				</p>
			</div>
		</div>
	</AppModal>
</template>
