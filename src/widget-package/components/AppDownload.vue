<script lang="ts" setup>
import { computed, ref } from 'vue';
import { Analytics } from '../../_common/analytics/analytics.service';
import AppButton from '../../_common/button/AppButton.vue';
import { Environment } from '../../_common/environment/environment.service';
import { formatCurrency } from '../../_common/filters/currency';
import { formatFilesize } from '../../_common/filters/filesize';
import { GameBuild } from '../../_common/game/build/build.model';
import { HistoryTick } from '../../_common/history-tick/history-tick-service';
import AppJolticon from '../../_common/jolticon/AppJolticon.vue';
import { Sellable } from '../../_common/sellable/sellable.model';
import { useCommonStore } from '../../_common/store/common-store';
import { vAppTooltip } from '../../_common/tooltip/tooltip-directive';
import AppFadeCollapse from '../components/AppFadeCollapse.vue';
import AppWidgetModal from '../components/AppWidgetModal.vue';
import { useWidgetPackageStore } from '../store/index';
import FormPayment from './forms/FormPayment.vue';
import { Jolticon } from '../../_common/jolticon/AppJolticon.vue';

const store = useWidgetPackageStore();
const { user } = useCommonStore();

const packageCard = computed(() => store.packageCard.value!);
const game = computed(() => store.game.value!);
const developer = computed(() => store.developer.value!);
const gamePackage = computed(() => store.gamePackage.value!);
const sellable = computed(() => store.sellable.value!);
const pricing = computed(() => store.pricing.value!);
const price = computed(() => store.price.value!);

const isShowingMoreOptions = ref(false);
const isDescriptionCollapsed = ref(false);
const isShowingDescription = ref(false);
const isShowingPayment = ref(false);
const clickedBuild = ref<GameBuild>();

// "Convenience" I guess
const hasBrowserBuild = computed(() => !!packageCard.value.browserBuild);
const browserBuild = computed(() => packageCard.value.browserBuild!);
const hasDownloadableBuild = computed(() => !!packageCard.value.downloadableBuild);
const downloadableBuild = computed(() => packageCard.value.downloadableBuild!);
const showcasedBrowserIcon = computed(() => packageCard.value.showcasedBrowserIcon);
const platformSupportInfo = computed(() => packageCard.value.platformSupportInfo);
const showcasedOs = computed(() => packageCard.value.showcasedOs);
const showcasedOsIcon = computed(() => packageCard.value.showcasedOsIcon);
const extraBuilds = computed(() => packageCard.value.extraBuilds);
const otherOnly = computed(() => packageCard.value.otherOnly);

const shouldShowDevDescription = computed(() => {
	return (
		user.value && game.value.developer.id === user.value.id && !gamePackage.value.description
	);
});

async function buildClick(build?: GameBuild) {
	// We only allow undefined builds for TS typing reasons within the view.
	// It shouldn't ever actually happen.
	if (!build) {
		throw new Error('Build must always be set.');
	}

	if (sellable.value.type === Sellable.TYPE_PWYW && !isShowingPayment.value) {
		clickedBuild.value = build;
		isShowingPayment.value = true;
		return;
	}

	isShowingPayment.value = false;

	Analytics.trackEvent('game-widget', 'dowload');

	HistoryTick.sendBeacon('game-build', build.id, {
		sourceResource: 'Game',
		sourceResourceId: game.value.id,
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
		window.open(Environment.baseUrl + build.getUrl(game.value, 'download'));
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
				<AppFadeCollapse style="max-height: 60px" @required="isDescriptionCollapsed = true">
					{{ gamePackage.description }}
				</AppFadeCollapse>

				<span v-if="isDescriptionCollapsed">
					<a class="link-muted" @click="isShowingDescription = true"> (more) </a>
				</span>
			</template>
		</div>

		<div class="-controls">
			<AppButton v-if="hasBrowserBuild" primary @click="buildClick(browserBuild)">
				Play
				<AppJolticon class="jolticon-addon" :icon="(showcasedBrowserIcon as Jolticon)" />
			</AppButton>

			<AppButton
				v-if="hasDownloadableBuild"
				:primary="!hasBrowserBuild"
				@click="buildClick(downloadableBuild)"
			>
				Download
				<small v-if="platformSupportInfo[showcasedOs].arch === '64'"> 64-bit </small>
				<small>({{ formatFilesize(downloadableBuild.primary_file.filesize) }})</small>
				<AppJolticon class="jolticon-addon" :icon="(showcasedOsIcon as Jolticon)" />
			</AppButton>

			<!--
			If this package only has "Other" builds, then we make it look like a download
			button with a [...] after.
			If the package has normal builds too, then we just show it as a more options sparse button.
			-->
			<AppButton
				v-if="extraBuilds.length"
				icon="ellipsis-v"
				:primary="otherOnly"
				:circle="!otherOnly"
				@click="isShowingMoreOptions = true"
			>
				<span v-if="otherOnly">
					Download
					<AppJolticon class="jolticon-addon" icon="other-os" />
				</span>
			</AppButton>
		</div>

		<transition>
			<AppWidgetModal v-if="isShowingDescription" @close="isShowingDescription = false">
				{{ gamePackage.description }}
			</AppWidgetModal>
		</transition>

		<transition>
			<AppWidgetModal v-if="isShowingMoreOptions" @close="isShowingMoreOptions = false">
				<div class="row">
					<div class="col-xs-6 col-centered">
						<div
							v-for="extraBuild in extraBuilds"
							:key="extraBuild.icon + '-' + extraBuild.build.id"
						>
							<!-- If a ROM, we want to show a tooltip on what kind. -->
							<AppButton
								v-app-tooltip.touchable="
									extraBuild.build.type === GameBuild.TYPE_ROM
										? GameBuild.emulatorInfo[extraBuild.build.emulator_type]
										: undefined
								"
								block
								:icon="extraBuild.icon"
								@click="buildClick(extraBuild.build)"
							>
								<!-- We show the filename if it's an "Other" build. -->
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
							</AppButton>
							<br />
						</div>
					</div>
				</div>
			</AppWidgetModal>
		</transition>

		<transition>
			<AppWidgetModal v-if="isShowingPayment" @close="isShowingPayment = false">
				<p>
					<span v-if="!pricing.amount">
						Show {{ developer.display_name }} some
						<AppJolticon class="-heart" icon="heart-filled" /> by supporting them.
					</span>
					<span v-else>
						This developer suggests paying
						<strong>{{ formatCurrency(price) }} </strong>, but you're able to pay what
						you want.
					</span>
				</p>

				<FormPayment />

				<a class="link-muted" @click="buildClick(clickedBuild)">
					No thanks, take me to the game.
				</a>
			</AppWidgetModal>
		</transition>
	</div>
</template>

<style lang="stylus" scoped>
.-controls
	margin-top: $shell-padding * 2

.-heart
	theme-prop('color', 'link')
</style>
