<script lang="ts">
import { computed } from 'vue';

import AppButton from '~common/button/AppButton.vue';
import { GameBuildModel } from '~common/game/build/build.model';
import { GameBuildTypeDownloadable, GameBuildTypeRom } from '~common/game/build/build.model';
import { GameDownloader } from '~common/game/downloader/downloader.service';
import type { GameModel } from '~common/game/game.model';
import type { GamePackageModel } from '~common/game/package/package.model';
import FormGamePackagePayment from '~common/game/package/payment-form/FormGamePackagePayment.vue';
import { useShowGamePlayModal } from '~common/game/play-modal/play-modal.service';
import { showSuccessGrowl } from '~common/growls/growls.service';
import AppModal from '~common/modal/AppModal.vue';
import { useModal } from '~common/modal/modal.service';
import AppTranslate from '~common/translate/AppTranslate.vue';
import { $gettext } from '~common/translate/translate.service';

type DownloadPackageHook = (game: GameModel, build: GameBuildModel) => void;
let downloadPackageHook: DownloadPackageHook | undefined;

export function setDownloadPackageHook(newHook: DownloadPackageHook) {
	downloadPackageHook = newHook;
}
</script>

<script lang="ts" setup>
type Props = {
	game: GameModel;
	package: GamePackageModel;
	build: GameBuildModel | null;
	fromExtraSection: boolean;
};
const { game, package: gamePackage, build, fromExtraSection } = defineProps<Props>();

const sellable = gamePackage._sellable!;

const modal = useModal()!;
const showGamePlayModal = useShowGamePlayModal();

const packageOperation = computed(() => {
	if (!build) {
		return 'download';
	}

	let operation: 'download' | 'play' =
		build.type === GameBuildTypeDownloadable ? 'download' : 'play';
	if (build.type === GameBuildTypeRom && fromExtraSection) {
		operation = 'download';
	}
	return operation;
});

function bought() {
	// Hack to show the sellable as bought without pulling from API.
	sellable.is_owned = true;
	if (game.sellable && game.sellable.id === sellable.id) {
		game.sellable.is_owned = true;
	}

	showSuccessGrowl({
		title: $gettext('Order Complete'),
		message: $gettext('Warm thanks from both %{ developer } and the Game Jolt team.', {
			developer: game.developer.display_name,
		}),
		sticky: true,
	});

	modal.dismiss();
}

function skipPayment() {
	if (!build) {
		throw new Error(`Build isn't set`);
	}

	const thisOperation = packageOperation.value;
	console.log(`${thisOperation}ing build`);

	if (thisOperation === 'play') {
		_showBrowserModal(build);
	} else if (thisOperation === 'download') {
		if (downloadPackageHook) {
			downloadPackageHook(game, build);
		} else {
			_download(build);
		}
	}
	modal.dismiss();
}

function _download(gameBuild: GameBuildModel) {
	GameDownloader.download(game, gameBuild);
}

function _showBrowserModal(gameBuild: GameBuildModel) {
	showGamePlayModal(game, gameBuild);
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
