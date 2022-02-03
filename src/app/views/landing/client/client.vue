<script lang="ts">
import { Options } from 'vue-property-decorator';
import { trackAppDownload } from '../../../../_common/analytics/analytics.service';
import { Api } from '../../../../_common/api/api.service';
import {
	DeviceArch,
	DeviceOs,
	getDeviceArch,
	getDeviceOS,
} from '../../../../_common/device/device.service';
import { Game } from '../../../../_common/game/game.model';
import { GamePackagePayloadModel } from '../../../../_common/game/package/package-payload.model';
import { HistoryTick } from '../../../../_common/history-tick/history-tick-service';
import { Navigate } from '../../../../_common/navigate/navigate.service';
import { BaseRouteComponent, OptionsForRoute } from '../../../../_common/route/route-component';
import { Screen } from '../../../../_common/screen/screen-service';
import { vAppScrollTo } from '../../../../_common/scroll/to/to.directive';
import AppThemeSvg from '../../../../_common/theme/svg/AppThemeSvg.vue';
import { imageJolt } from '../../../img/images';

@Options({
	name: 'RouteLandingClient',
	components: {
		AppThemeSvg,
	},
	directives: {
		AppScrollTo: vAppScrollTo,
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

	readonly platform = getDeviceOS();
	readonly arch = getDeviceArch();
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

	get detectedPlatformDisplay() {
		switch (this.platform) {
			case 'windows':
				return 'Windows';
			case 'mac':
				return 'macOS';
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

		// On Linux and macOS only 64 bit is supported.
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

	async download(platform: DeviceOs, arch: DeviceArch) {
		HistoryTick.sendBeacon('client-download');
		trackAppDownload({ platform, arch });

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
					<div class="col-lg-6 col-centered">
						<div>
							<template v-if="isDetectedPlatformIncompatible">
								<p v-if="platform === 'other'">
									We could not detect what platform you are on.
									<br />
									Download the correct version below:
								</p>
								<template v-else>
									<p>
										We detected you are running on
										<strong>{{ detectedPlatformDisplay }} {{ arch }}bit</strong>
										<br />
										Oof! looks like the desktop app is incompatible with it.
									</p>

									<p>Did we get it wrong? Download the correct version below:</p>
								</template>
							</template>
						</div>

						<br />
					</div>
				</div>

				<div class="row">
					<div class="header-download-buttons">
						<AppButton
							v-if="shouldOfferWindows"
							primary
							lg
							@click="download(platform, '32')"
						>
							<AppJolticon icon="download" />
							Download for Windows
						</AppButton>

						<AppButton
							v-if="shouldOfferMac"
							primary
							lg
							@click="download(platform, '64')"
						>
							<AppJolticon icon="download" />
							Download for OS X
						</AppButton>

						<AppButton
							v-if="shouldOfferLinux"
							primary
							lg
							@click="download(platform, arch)"
						>
							<AppJolticon icon="download" />
							Download for Linux 64bit
						</AppButton>
					</div>
				</div>

				<!--
					If we did detect a valid platform, we offer only the matching version
					in the header. In case we got it wrong, we want to offer alternatives.
				-->
				<div v-if="!isDetectedPlatformIncompatible">
					<br />
					or download for
					<a v-app-scroll-to href="#all-downloads">other platforms</a>
				</div>
			</div>
		</section>

		<div class="fill-darker">
			<section class="client-presentation">
				<div v-if="showMascot" class="container">
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

			<section id="all-downloads" class="download-footer">
				<div class="container text-center">
					<div class="row">
						<div class="col-lg-9 col-centered">
							<div class="row">
								<div class="download-footer-col col-sm-4">
									<p><AppJolticon icon="linux" class="jolticon-4x" /></p>
									<p>
										<AppButton
											v-app-track-event="`client-landing:download:linux`"
											primary
											block
											@click="download('linux', '64')"
										>
											<AppJolticon icon="download" />
											Download Linux 64bit
										</AppButton>
									</p>
								</div>
								<div class="download-footer-col col-sm-4">
									<p><AppJolticon icon="mac" class="jolticon-4x" /></p>
									<p>
										<AppButton
											v-app-track-event="`client-landing:download:mac`"
											primary
											block
											@click="download('mac', '64')"
										>
											<AppJolticon icon="download" />
											Download Mac
										</AppButton>
									</p>
								</div>
								<div class="download-footer-col col-sm-4">
									<p><AppJolticon icon="windows" class="jolticon-4x" /></p>
									<p>
										<AppButton
											v-app-track-event="`client-landing:download:win`"
											primary
											block
											@click="download('windows', '32')"
										>
											<AppJolticon icon="download" />
											Download Windows
										</AppButton>
									</p>
								</div>
							</div>
						</div>
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

	section.download-footer
		margin-top: 150px
		margin-bottom: 90px
		position: relative
		z-index: 1

		&
		h5
			color: $white

		&::before
			change-bg('darkest')
			content: ''
			display: block
			position: absolute
			top: -80px
			bottom: -80px
			left: -30%
			width: 160%
			z-index: 0
			transform: rotate(8deg)

		.container
			position: relative
			z-index: 1

	@media $media-xs
		.download-footer-col
			margin-bottom: $grid-gutter-width

			&:last-child
				margin-bottom: 0
</style>
