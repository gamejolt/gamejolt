import { AppTrackEvent } from '../../../../_common/analytics/track-event.directive';
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
import { Component } from 'vue-property-decorator';

@Component({
	name: 'RouteLandingClient',
	components: {
		AppThemeSvg,
	},
	directives: {
		AppTrackEvent,
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
	// When this is set, it triggers the iframe that begins the download
	downloadSrc = '';

	private packageData: GamePackagePayloadModel | null = null;
	private fallbackUrl = 'https://gamejolt.com';

	readonly platform = Device.os();
	readonly Screen = Screen;

	routeResolved(payload: any) {
		this.packageData = new GamePackagePayloadModel(payload.packageData);
		this.fallbackUrl = payload.clientGameUrl;
	}

	get routeTitle() {
		return `Game Jolt Client`;
	}

	async download(platform: string) {
		// This will reset the iframe since it removes it when there is no download src.
		this.downloadSrc = '';

		HistoryTick.sendBeacon('client-download');

		const downloadUrl = await this.getDownloadUrl(platform);
		if (downloadUrl === null) {
			Navigate.gotoExternal(this.fallbackUrl);
			return;
		}

		this.downloadSrc = downloadUrl;
	}

	private async getDownloadUrl(platform: string) {
		if (!this.packageData) {
			return null;
		}

		const installableBuilds = Game.pluckInstallableBuilds(this.packageData.packages, platform);
		const bestBuild = Game.chooseBestBuild(installableBuilds, platform);
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
