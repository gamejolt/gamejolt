<script lang="ts">
import { setup } from 'vue-class-component';
import { Options, Vue } from 'vue-property-decorator';
import { Analytics } from '../../../_common/analytics/analytics.service';
import { Environment } from '../../../_common/environment/environment.service';
import { formatCurrency } from '../../../_common/filters/currency';
import { formatFilesize } from '../../../_common/filters/filesize';
import { GameBuild } from '../../../_common/game/build/build.model';
import { HistoryTick } from '../../../_common/history-tick/history-tick-service';
import { Sellable } from '../../../_common/sellable/sellable.model';
import { useCommonStore } from '../../../_common/store/common-store';
import { AppTooltip } from '../../../_common/tooltip/tooltip-directive';
import AppFadeCollapse from '../../components/fade-collapse/fade-collapse.vue';
import AppModal from '../../components/modal/modal.vue';
import { useWidgetPackageStore } from '../../store/index';
import AppPayment from '../payment/payment.vue';

@Options({
	components: {
		AppModal,
		AppFadeCollapse,
		AppPayment,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppDownload extends Vue {
	store = setup(() => useWidgetPackageStore());
	commonStore = setup(() => useCommonStore());

	get app() {
		return this.commonStore;
	}
	get packageCard() {
		return this.store.packageCard!;
	}
	get game() {
		return this.store.game!;
	}
	get developer() {
		return this.store.developer!;
	}
	get package() {
		return this.store.gamePackage!;
	}
	get sellable() {
		return this.store.sellable!;
	}
	get pricing() {
		return this.store.pricing!;
	}
	get price() {
		return this.store.price!;
	}

	isShowingMoreOptions = false;
	isDescriptionCollapsed = false;
	isShowingDescription = false;
	isShowingPayment = false;
	clickedBuild?: GameBuild;

	readonly GameBuild = GameBuild;
	readonly formatFilesize = formatFilesize;
	readonly formatCurrency = formatCurrency;

	// "Convenience" I guess
	get hasBrowserBuild() {
		return !!this.packageCard.browserBuild;
	}
	get browserBuild() {
		return this.packageCard.browserBuild!;
	}
	get hasDownloadableBuild() {
		return !!this.packageCard.downloadableBuild;
	}
	get downloadableBuild() {
		return this.packageCard.downloadableBuild!;
	}
	get showcasedBrowserIcon() {
		return this.packageCard.showcasedBrowserIcon;
	}
	get platformSupportInfo() {
		return this.packageCard.platformSupportInfo;
	}
	get showcasedOs() {
		return this.packageCard.showcasedOs;
	}
	get showcasedOsIcon() {
		return this.packageCard.showcasedOsIcon;
	}
	get extraBuilds() {
		return this.packageCard.extraBuilds;
	}
	get otherOnly() {
		return this.packageCard.otherOnly;
	}

	get shouldShowDevDescription() {
		return (
			this.app.user &&
			this.game.developer.id === this.app.user.id &&
			!this.package.description
		);
	}

	async buildClick(build?: GameBuild) {
		// We only allow undefined builds for TS typing reasons within the view.
		// It shouldn't ever actually happen.
		if (!build) {
			throw new Error('Build must always be set.');
		}

		if (this.sellable.type === Sellable.TYPE_PWYW && !this.isShowingPayment) {
			this.clickedBuild = build;
			this.isShowingPayment = true;
			return;
		}

		this.isShowingPayment = false;

		Analytics.trackEvent('game-widget', 'dowload');

		HistoryTick.sendBeacon('game-build', build.id, {
			sourceResource: 'Game',
			sourceResourceId: this.game.id,
		});

		if (build.isBrowserBased || build.type === GameBuild.TYPE_ROM) {
			Analytics.trackEvent('game-play', 'play');

			// We have to open the window first before getting the URL. The browser
			// will block the popup unless it's done directly in the onclick
			// handler. Once we have the download URL we can direct the window that
			// we now have the reference to.
			const win = window.open('');
			if (win) {
				// For some reason "win" in null in dev.
				const payload = await build.getDownloadUrl();
				win.location.href = payload.url;
			}
		} else {
			Analytics.trackEvent('game-play', 'download');
			window.open(Environment.baseUrl + build.getUrl(this.game, 'download'));
		}
	}
}
</script>

<template>
	<div>
		<div>
			<template v-if="shouldShowDevDescription">
				<em>
					Enter a package description if you'd like to fill this area out.
					<strong>
						(You're seeing this because you're the developer and your package doesn't
						have a description.)
					</strong>
				</em>
			</template>
			<template v-else>
				<app-fade-collapse
					style="max-height: 60px"
					@required="isDescriptionCollapsed = true"
				>
					{{ package.description }}
				</app-fade-collapse>

				<span v-if="isDescriptionCollapsed">
					<a class="link-muted" @click="isShowingDescription = true"> (more) </a>
				</span>
			</template>
		</div>

		<div class="-controls">
			<app-button v-if="hasBrowserBuild" primary @click="buildClick(browserBuild)">
				Play
				<app-jolticon class="jolticon-addon" :icon="showcasedBrowserIcon" />
			</app-button>

			<app-button
				v-if="hasDownloadableBuild"
				:primary="!hasBrowserBuild"
				@click="buildClick(downloadableBuild)"
			>
				Download
				<small v-if="platformSupportInfo[showcasedOs].arch === '64'"> 64-bit </small>
				<small>({{ formatFilesize(downloadableBuild.primary_file.filesize) }})</small>
				<app-jolticon class="jolticon-addon" :icon="showcasedOsIcon" />
			</app-button>

			<!--
				If this package only has "Other" builds, then we make it look like a download
				button with a [...] after.
				If the package has normal builds too, then we just show it as a more options sparse button.
			-->
			<app-button
				v-if="extraBuilds.length"
				icon="ellipsis-v"
				:primary="otherOnly"
				:circle="!otherOnly"
				@click="isShowingMoreOptions = true"
			>
				<span v-if="otherOnly">
					Download
					<app-jolticon class="jolticon-addon" icon="other-os" />
				</span>
			</app-button>
		</div>

		<transition>
			<app-modal v-if="isShowingDescription" @close="isShowingDescription = false">
				{{ package.description }}
			</app-modal>
		</transition>

		<transition>
			<app-modal v-if="isShowingMoreOptions" @close="isShowingMoreOptions = false">
				<div class="row">
					<div class="col-xs-6 col-centered">
						<div
							v-for="extraBuild in extraBuilds"
							:key="extraBuild.icon + '-' + extraBuild.build.id"
						>
							<!--
								If a ROM, we want to show a tooltip on what kind.
							-->
							<app-button
								v-app-tooltip.touchable="
									extraBuild.build.type === GameBuild.TYPE_ROM
										? GameBuild.emulatorInfo[extraBuild.build.emulator_type]
										: undefined
								"
								block
								:icon="extraBuild.icon"
								@click="buildClick(extraBuild.build)"
							>
								<!--
									We show the filename if it's an "Other" build.
								-->
								<template v-if="!extraBuild.build.os_other">
									<template v-if="extraBuild.build.type === 'downloadable'">
										Download
									</template>
									<template v-else-if="extraBuild.build.type === 'rom'">
										Download ROM
									</template>
									<template v-else> Play </template>
								</template>
								<template v-else>
									{{ extraBuild.build.primary_file.filename }}
								</template>

								<small v-if="extraBuild.arch === '64'">64-bit</small>

								<small class="text-muted">
									({{ formatFilesize(extraBuild.build.primary_file.filesize) }})
								</small>
							</app-button>
							<br />
						</div>
					</div>
				</div>
			</app-modal>
		</transition>

		<transition>
			<app-modal v-if="isShowingPayment" @close="isShowingPayment = false">
				<p>
					<span v-if="!pricing.amount">
						Show {{ developer.display_name }} some
						<app-jolticon class="-heart" icon="heart-filled" /> by supporting them.
					</span>
					<span v-else>
						This developer suggests paying
						<strong>{{ formatCurrency(price) }} </strong>, but you're able to pay what
						you want.
					</span>
				</p>

				<app-payment />

				<a class="link-muted" @click="buildClick(clickedBuild)">
					No thanks, take me to the game.
				</a>
			</app-modal>
		</transition>
	</div>
</template>

<style lang="stylus" scoped>
.-controls
	margin-top: $shell-padding * 2

.-heart
	theme-prop('color', 'link')
</style>
