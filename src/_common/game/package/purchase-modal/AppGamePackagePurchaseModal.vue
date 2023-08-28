<script lang="ts">
import { computed, PropType, toRefs } from 'vue';
import { useRouter } from 'vue-router';
import { Analytics } from '../../../analytics/analytics.service';
import AppButton from '../../../button/AppButton.vue';
import { showSuccessGrowl } from '../../../growls/growls.service';
import AppModal from '../../../modal/AppModal.vue';
import { useModal } from '../../../modal/modal.service';
import AppTranslate from '../../../translate/AppTranslate.vue';
import { $gettext } from '../../../translate/translate.service';
import { GameBuildModel, GameBuildType } from '../../build/build.model';
import { GameDownloader } from '../../downloader/downloader.service';
import type { GameModel } from '../../game.model';
import { GamePlayModal } from '../../play-modal/play-modal.service';
import type { GamePackageModel } from '../package.model';
import FormGamePackagePayment from '../payment-form/FormGamePackagePayment.vue';

type DownloadPackageHook = (game: GameModel, build: GameBuildModel) => void;
let downloadPackageHook: DownloadPackageHook | undefined;

export function setDownloadPackageHook(newHook: DownloadPackageHook) {
	downloadPackageHook = newHook;
}
</script>

<script lang="ts" setup>
const props = defineProps({
	game: {
		type: Object as PropType<GameModel>,
		required: true,
	},
	package: {
		type: Object as PropType<GamePackageModel>,
		required: true,
	},
	build: {
		type: Object as PropType<GameBuildModel | null>,
		required: true,
	},
	fromExtraSection: {
		type: Boolean,
		required: true,
	},
});

const { game, package: gamePackage, build, fromExtraSection } = toRefs(props);

const sellable = gamePackage.value._sellable!;

const modal = useModal()!;
const router = useRouter();

const packageOperation = computed(() => {
	if (!build.value) {
		return 'download';
	}

	let operation: 'download' | 'play' =
		build.value.type === GameBuildType.Downloadable ? 'download' : 'play';
	if (build.value.type === GameBuildType.Rom && fromExtraSection) {
		operation = 'download';
	}
	return operation;
});

function bought() {
	// Hack to show the sellable as bought without pulling from API.
	sellable.is_owned = true;
	if (game.value.sellable && game.value.sellable.id === sellable.id) {
		game.value.sellable.is_owned = true;
	}

	showSuccessGrowl({
		title: $gettext('Order Complete'),
		message: $gettext('Warm thanks from both %{ developer } and the Game Jolt team.', {
			developer: game.value.developer.display_name,
		}),
		sticky: true,
	});

	modal.dismiss();
}

function skipPayment() {
	if (!build.value) {
		throw new Error(`Build isn't set`);
	}

	const thisOperation = packageOperation.value;
	console.log(`${thisOperation}ing build`);

	if (thisOperation === 'play') {
		_showBrowserModal(build.value);
	} else if (thisOperation === 'download') {
		if (downloadPackageHook) {
			downloadPackageHook(game.value, build.value);
		} else {
			_download(build.value);
		}
	}
	modal.dismiss();
}

function _download(gameBuild: GameBuildModel) {
	Analytics.trackEvent('game-purchase-modal', 'download', 'download');
	GameDownloader.download(router, game.value, gameBuild);
}

function _showBrowserModal(gameBuild: GameBuildModel) {
	Analytics.trackEvent('game-purchase-modal', 'download', 'play');
	GamePlayModal.show(game.value, gameBuild);
}
</script>

<template>
	<AppModal>
		<div class="modal-controls">
			<AppButton @click="modal.dismiss()">
				<AppTranslate>Close</AppTranslate>
			</AppButton>
		</div>

		<div class="modal-header">
			<h2 class="modal-title">
				{{ gamePackage.title || game.title }}
			</h2>
		</div>

		<div class="modal-body">
			<FormGamePackagePayment
				:game="game"
				:game-package="gamePackage"
				:build="build"
				:sellable="sellable"
				:operation="packageOperation"
				@bought="bought"
				@skip="skipPayment"
			/>
		</div>
	</AppModal>
</template>
