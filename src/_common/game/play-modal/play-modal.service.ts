import { defineAsyncComponent } from 'vue';
import { Environment } from '../../environment/environment.service';
import { showErrorGrowl } from '../../growls/growls.service';
import { HistoryTick } from '../../history-tick/history-tick-service';
import { showModal } from '../../modal/modal.service';
import { Navigate } from '../../navigate/navigate.service';
import { Popper } from '../../popper/popper.service';
import { $gettext } from '../../translate/translate.service';
import { GameBuildModel, GameBuildType } from '../build/build.model';
import { GameModel } from '../game.model';

let canMinimize = false;
let hasModal = false;

export function initGamePlayModal(options: { canMinimize?: boolean }) {
	canMinimize = options.canMinimize || false;
}

export async function showGamePlayModal(
	game: GameModel,
	build: GameBuildModel,
	options: { key?: string } = {}
) {
	if (hasModal) {
		showErrorGrowl(
			$gettext(
				`You already have a browser game open. You can only have one running at a time.`
			)
		);
		return;
	}

	HistoryTick.sendBeacon('game-build', build.id, {
		sourceResource: 'Game',
		sourceResourceId: game.id,
		key: options.key,
	});

	// If they clicked into this through a popover.
	Popper.hideAll();

	// Will open the gameserver in their browser.
	if (
		GJ_IS_DESKTOP_APP &&
		build.type !== GameBuildType.Html &&
		build.type !== GameBuildType.Rom
	) {
		const downloadUrl = await _getDownloadUrl(build, { key: options.key });
		Navigate.gotoExternal(downloadUrl);
		return;
	}

	// Modern browsers don't allow you to set cookies on a domain that isn't the
	// same as the current domain. That means our cookie signing breaks in
	// the iframe. To fix we have to open a new tab to the gameserver.
	// We also open the game in a new tab if it's not https enabled so the
	// site doesn't complain about mixed security elements.
	// In the client however we can continue to embed because we don't have cookie issues.
	if (!build.https_enabled || !GJ_IS_DESKTOP_APP) {
		// We have to open the window first before getting the URL. The
		// browser will block the popup unless it's done directly in the
		// onclick handler. Once we have the download URL we can direct the
		// window that we now have the reference to.
		const win = window.open('');
		if (win) {
			const downloadUrl = await _getDownloadUrl(build, { key: options.key });
			win.location.href = downloadUrl;
		}
		return;
	}

	hasModal = true;
	const url = await _getDownloadUrl(build, { key: options.key });

	await showModal({
		modalId: 'GamePlay',
		component: defineAsyncComponent(() => import('./AppGamePlayModal.vue')),
		props: { game, build, url, canMinimize },
		noBackdrop: true,
		noBackdropClose: true,
		noEscClose: true,
		size: 'full',
	});

	hasModal = false;
}

async function _getDownloadUrl(build: GameBuildModel, options: { key?: string }) {
	const payload = await build.getDownloadUrl({ key: options.key });
	let url = payload.url;

	// TODO: Get rid of the Environment.isSecure check once we switch to https-only.
	if (!build.https_enabled || !Environment.isSecure) {
		url = url.replace('https://', 'http://');
	}

	return url;
}
