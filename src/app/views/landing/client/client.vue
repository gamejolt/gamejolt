<script lang="ts">
import { Options } from 'vue-property-decorator';
import { trackAppDownload } from '../../../../_common/analytics/analytics.service';
import { Api } from '../../../../_common/api/api.service';
import { DeviceArch, DeviceOs } from '../../../../_common/device/device.service';
import { Game } from '../../../../_common/game/game.model';
import { GamePackagePayloadModel } from '../../../../_common/game/package/package-payload.model';
import { HistoryTick } from '../../../../_common/history-tick/history-tick-service';
import { Navigate } from '../../../../_common/navigate/navigate.service';
import { BaseRouteComponent, OptionsForRoute } from '../../../../_common/route/route-component';
import { Screen } from '../../../../_common/screen/screen-service';
import AppThemeSvg from '../../../../_common/theme/svg/AppThemeSvg.vue';
import { imageJolt } from '../../../img/images';

@Options({
	name: 'RouteLandingClient',
	components: {
		AppThemeSvg,
	},
})
@OptionsForRoute({
	cache: true,
	lazy: true,
	deps: {},
	resolver: () => Api.sendRequest('/web/client'),
})
export default class RouteLandingClient extends BaseRouteComponent {
	private packageData: GamePackagePayloadModel | null = null;
	private fallbackUrl = 'https://gamejolt.com';

	readonly Screen = Screen;
	readonly imageJolt = imageJolt;
	readonly assetPaths = import.meta.globEager('./*.(jpg|png)');

	routeResolved(payload: any) {
		this.packageData = new GamePackagePayloadModel(payload.packageData);
		this.fallbackUrl = payload.clientGameUrl;
	}

	disableRouteTitleSuffix = true;

	get routeTitle() {
		return `Game Jolt Desktop App`;
	}

	async download(platform: DeviceOs, arch: DeviceArch) {
		HistoryTick.sendBeacon('client-download');
		trackAppDownload({ platform, arch });

		const downloadUrl = await this.getDownloadUrl(platform, arch);
		if (downloadUrl === null) {
			Navigate.gotoExternal(this.fallbackUrl);
			return;
		}

		if (GJ_IS_DESKTOP_APP) {
			Navigate.gotoExternal(downloadUrl);
		} else {
			Navigate.goto(downloadUrl);
		}
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
</script>

<template>
	<div class="route-landing-client">
		<section class="section landing-header text-center">
			<div class="container">
				<div class="row">
					<div class="col-lg-6 col-centered">
						<h1>
							<AppThemeSvg class="bolt" :src="imageJolt" alt="" strict-colors />
							Desktop App
						</h1>
						<p class="lead">
							Stay up to date with your favorite gaming communities and content
							creators
						</p>
					</div>
				</div>
				<br />

				<div class="row">
					<div class="header-download-buttons">
						<AppButton primary lg @click="download('windows', '64')">
							<AppJolticon icon="windows" middle />
							Download for Windows
						</AppButton>

						<AppButton primary lg @click="download('linux', '64')">
							<AppJolticon icon="linux" middle />
							Download for Linux
						</AppButton>
					</div>
				</div>
			</div>
		</section>

		<div class="fill-darker">
			<section class="client-presentation">
				<div v-if="!Screen.isMobile" class="container">
					<img
						class="client-presentation-mascot"
						:src="assetPaths['./clyde-video-overlay.png'].default"
						width="178"
						height="130"
						alt="Clyde Slicker"
					/>
				</div>
				<div class="client-presentation-inner">
					<div class="container text-center">
						<img
							class="img-responsive"
							width="1300"
							height="893"
							:src="assetPaths['./client-presentation.jpg'].default"
							alt="Game Jolt Client"
						/>
					</div>
				</div>
			</section>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.route-landing-client
	overflow-x: hidden
	overflow-y: hidden

	.header-download-buttons
		display: flex
		justify-content: center
		flex-direction: column
		margin: 0 auto
		max-width: 370px

		@media $media-md-up
			max-width: 100%
			flex-direction: row

		> *
			display: block
			margin: 5px 10px

			@media $media-md-up
				margin: 0 10px

	section.client-presentation
		position: relative
		padding-bottom: 48px

		.container
			position: relative

	.client-presentation-mascot
		display: block
		position: absolute
		top: 20px
		right: 40px
		margin-top: -(130px)
		z-index: 2

	.client-presentation-inner
		position: relative
		overflow: hidden

		&::before
			change-bg('dark')
			content: ''
			display: block
			position: absolute
			top: 0
			left: -30%
			width: 160%
			height: 400px
			z-index: 0
			transform: rotate(-8deg)

		.container
			z-index: 1

		img
			theme-prop('border-color', 'gray')
			margin-top: 20px
			border-width: $border-width-large
			border-style: solid
			rounded-corners-lg()
</style>
