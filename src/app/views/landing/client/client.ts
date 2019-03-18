import View from '!view!./client.html?style=./client.styl';
import { Component } from 'vue-property-decorator';
import { AppTrackEvent } from '../../../../lib/gj-lib-client/components/analytics/track-event.directive';
import { Api } from '../../../../lib/gj-lib-client/components/api/api.service';
import { Device } from '../../../../lib/gj-lib-client/components/device/device.service';
import { Game } from '../../../../lib/gj-lib-client/components/game/game.model';
import { GamePackagePayloadModel } from '../../../../lib/gj-lib-client/components/game/package/package-payload.model';
import { HistoryTick } from '../../../../lib/gj-lib-client/components/history-tick/history-tick-service';
import { Navigate } from '../../../../lib/gj-lib-client/components/navigate/navigate.service';
import {
	BaseRouteComponent,
	RouteResolver,
} from '../../../../lib/gj-lib-client/components/route/route-component';
import { Screen } from '../../../../lib/gj-lib-client/components/screen/screen-service';
import { AppScrollTo } from '../../../../lib/gj-lib-client/components/scroll/to/to.directive';
import { AppThemeSvg } from '../../../../lib/gj-lib-client/components/theme/svg/svg';

@View
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
