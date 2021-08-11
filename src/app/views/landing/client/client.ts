import { Options } from 'vue-property-decorator';
import { Api } from '../../../../_common/api/api.service';
import { Device } from '../../../../_common/device/device.service';
import { Game } from '../../../../_common/game/game.model';
import { GamePackagePayloadModel } from '../../../../_common/game/package/package-payload.model';
import { HistoryTick } from '../../../../_common/history-tick/history-tick-service';
import { Navigate } from '../../../../_common/navigate/navigate.service';
import { BaseRouteComponent, RouteResolver } from '../../../../_common/route/route-component';
import { Screen } from '../../../../_common/screen/screen-service';
import { AppScrollTo } from '../../../../_common/scroll/to/to.directive';
import { AppThemeSvg } from '../../../../_common/theme/svg/svg';

@Options({
	name: 'RouteLandingClient',
	components: {
		AppThemeSvg,
	},
	directives: {
		AppScrollTo,
	},
})
@RouteResolver({
	cache: true,
	lazy: true,
	deps: {},
	resolver: () => Api.sendRequest('/web/client'),
})
export default class RouteLandingClient extends BaseRouteComponent {
	private packageData: GamePackagePayloadModel | null = null;
	private fallbackUrl = 'https://gamejolt.com';

	readonly platform = Device.os();
	readonly arch = Device.arch();
	readonly Screen = Screen;

	routeResolved(payload: any) {
		this.packageData = new GamePackagePayloadModel(payload.packageData);
		this.fallbackUrl = payload.clientGameUrl;
	}

	get routeTitle() {
		return `Game Jolt Client`;
	}

	get detectedPlatformDisplay() {
		switch (this.platform) {
			case 'windows':
				return 'Windows';
			case 'mac':
				return 'Mac OS X';
			case 'linux':
				return 'Linux';
			default:
				return 'Unknown';
		}
	}

	get isDetectedPlatformIncompatible() {
		// Couldn't detect platform.
		if (this.platform === 'other') {
			return true;
		}

		// All Windows platforms are supported.
		if (this.platform === 'windows') {
			return false;
		}

		// On Linux and OS X only 64 bit is supported.
		return this.arch === '32';
	}

	get shouldOfferWindows() {
		return this.isDetectedPlatformIncompatible || this.platform === 'windows';
	}

	get shouldOfferMac() {
		return (
			this.isDetectedPlatformIncompatible || (this.platform === 'mac' && this.arch === '64')
		);
	}

	get shouldOfferLinux() {
		return (
			this.isDetectedPlatformIncompatible || (this.platform === 'linux' && this.arch === '64')
		);
	}

	get showMascot() {
		if (Screen.isXs) {
			return false;
		}

		if (this.isDetectedPlatformIncompatible) {
			return Screen.isSm;
		}

		return true;
	}

	async download(platform: string, arch: string) {
		HistoryTick.sendBeacon('client-download');

		const downloadUrl = await this.getDownloadUrl(platform, arch);
		if (downloadUrl === null) {
			Navigate.gotoExternal(this.fallbackUrl);
			return;
		}

		Navigate.goto(downloadUrl);
	}

	private async getDownloadUrl(platform: string, arch: string) {
		if (!this.packageData) {
			return null;
		}

		const installableBuilds = Game.pluckInstallableBuilds(
			this.packageData.packages,
			platform,
			arch
		);
		const bestBuild = Game.chooseBestBuild(installableBuilds, platform, arch);
		if (!bestBuild) {
			return null;
		}

		try {
			const result = await bestBuild.getDownloadUrl();
			if (!result || !result.url) {
				return null;
			}
			return result.url;
		} catch (err) {
			console.warn(err);
			return null;
		}
	}
}
