<script lang="ts">
import { Component, PropType, computed, ref, toRefs } from 'vue';
import { useRouter } from 'vue-router';
import AppFadeCollapse from '../../../AppFadeCollapse.vue';
import AppButton from '../../../button/AppButton.vue';
import AppCard from '../../../card/AppCard.vue';
import { Clipboard } from '../../../clipboard/clipboard-service';
import AppCountdown from '../../../countdown/AppCountdown.vue';
import AppExpand from '../../../expand/AppExpand.vue';
import { formatCurrency } from '../../../filters/currency';
import { formatFilesize } from '../../../filters/filesize';
import AppJolticon from '../../../jolticon/AppJolticon.vue';
import { LinkedKey } from '../../../linked-key/linked-key.model';
import { SellablePricing } from '../../../sellable/pricing/pricing.model';
import { Sellable } from '../../../sellable/sellable.model';
import AppTimeAgo from '../../../time/AppTimeAgo.vue';
import { vAppTooltip } from '../../../tooltip/tooltip-directive';
import AppTranslate from '../../../translate/AppTranslate.vue';
import { GameBuild, GameBuildType } from '../../build/build.model';
import { GameDownloader } from '../../downloader/downloader.service';
import { Game } from '../../game.model';
import { GamePlayModal } from '../../play-modal/play-modal.service';
import { GameRelease } from '../../release/release.model';
import { GamePackage } from '../package.model';
import { GamePackagePurchaseModal } from '../purchase-modal/purchase-modal.service';
import AppGamePackageCardButtons from './AppGamePackageCardButtons.vue';
import { GamePackageCardModel } from './card.model';

let _buttonsComponent: Component | undefined;
let _metaComponent: Component | undefined;

export function setButtonsComponent(component: Component) {
	_buttonsComponent = component;
}

export function setMetaComponent(component: Component) {
	_metaComponent = component;
}
</script>

<script lang="ts" setup>
const props = defineProps({
	game: {
		type: Object as PropType<Game>,
		required: true,
	},
	package: {
		type: Object as PropType<GamePackage>,
		required: true,
	},
	sellable: {
		type: Object as PropType<Sellable>,
		required: true,
	},
	releases: {
		type: Array as PropType<GameRelease[]>,
		default: () => [],
	},
	builds: {
		type: Array as PropType<GameBuild[]>,
		default: () => [],
	},
	accessKey: {
		type: String,
		default: undefined,
	},
});

const { game, package: gamePackage, sellable, releases, builds, accessKey } = toRefs(props);
const router = useRouter();

const showFullDescription = ref(false);
const canToggleDescription = ref(false);

const isWhatOpen = ref(false);
const pricing = ref<SellablePricing | null>(null);
const sale = ref(false);
const salePercentageOff = ref('');
const saleOldPricing = ref<SellablePricing | null>(null);

const providerIcons = {
	steam: 'steam',
} as const;

const metaComponent = _metaComponent;
const buttonsComponent = _buttonsComponent ?? AppGamePackageCardButtons;

const card = computed(
	() => new GamePackageCardModel(sellable.value, releases.value, builds.value, linkedKeys.value)
);

const isOwned = computed(() => {
	// If there is a key on the package, then we should show it as being
	// "owned".
	if (accessKey?.value) {
		return true;
	}

	return sellable.value.is_owned ? true : false;
});

const linkedKeys = computed(() => sellable.value.linked_keys || []);

const canBuy = computed(
	() => !isOwned.value && (sellable.value.type === 'pwyw' || sellable.value.type === 'paid')
);

if (sellable.value.pricings.length > 0) {
	pricing.value = sellable.value.pricings[0];
	if (pricing.value.promotional) {
		saleOldPricing.value = sellable.value.pricings[1];
		sale.value = true;
		salePercentageOff.value = (
			((saleOldPricing.value.amount - pricing.value.amount) / saleOldPricing.value.amount) *
			100
		).toFixed(0);
	}
}

function buildClick(build: GameBuild, fromExtraSection = false) {
	// For client, if they clicked in the "options" section, then skip
	// showing payment form. Just take them directly to site.
	if (GJ_IS_DESKTOP_APP && fromExtraSection) {
		doBuildClick(build, fromExtraSection);
	} else if (sellable.value.type === 'pwyw' && canBuy.value) {
		showPayment(build, fromExtraSection);
	} else {
		doBuildClick(build, fromExtraSection);
	}
}

function doBuildClick(build: GameBuild, fromExtraSection = false) {
	let operation = build.type === GameBuildType.Downloadable ? 'download' : 'play';
	if (build.type === GameBuildType.Rom && fromExtraSection) {
		operation = 'download';
	}

	if (operation === 'download') {
		download(build);
	} else if (operation === 'play') {
		showBrowserModal(build);
	}
}

function showPayment(build: GameBuild | null, fromExtraSection: boolean) {
	GamePackagePurchaseModal.show({
		game: game.value,
		package: gamePackage.value,
		build: build,
		fromExtraSection,
	});
}

function download(build: GameBuild) {
	GameDownloader.download(router, game.value, build, {
		isOwned: isOwned.value,
		key: accessKey?.value,
	});
}

function showBrowserModal(build: GameBuild) {
	GamePlayModal.show(game.value, build, {
		key: accessKey?.value,
	});
}

function copyProviderKey(key: LinkedKey) {
	Clipboard.copy(key.key);
}
</script>

<template>
	<AppCard :id="`game-package-card-${package.id}`" class="game-package-card">
		<div class="game-package-card-pricing fill-gray">
			<!-- Fixed Pricing -->
			<div v-if="sellable.type === 'paid' && pricing">
				<span v-if="sale" class="game-package-card-pricing-sale-percentage">
					-{{ salePercentageOff }}%
				</span>
				<strong class="game-package-card-pricing-amount">
					{{ formatCurrency(pricing.amount) }}
				</strong>
				<span
					v-if="sale && saleOldPricing"
					class="game-package-card-pricing-amount game-package-card-pricing-amount-old"
				>
					{{ formatCurrency(saleOldPricing.amount) }}
				</span>
			</div>

			<!-- Pay What You Want -->
			<div v-else-if="sellable.type === 'pwyw'">
				<AppTranslate class="game-package-card-pricing-tag text-lower">
					Name Your Price
				</AppTranslate>
			</div>

			<!-- Free/Default -->
			<div v-else-if="sellable.type === 'free'">
				<strong class="game-package-card-pricing-amount text-upper">
					<AppTranslate>Free</AppTranslate>
				</strong>
			</div>
		</div>

		<!-- If they own the package -->
		<div
			v-if="isOwned"
			class="game-package-card-pricing game-package-card-pricing-owned fill-highlight"
		>
			<strong class="text-upper">
				<AppTranslate>Owned</AppTranslate>
			</strong>
		</div>

		<div class="card-title">
			<h4>
				{{ package.title || game.title }}
			</h4>
		</div>

		<div class="card-meta card-meta-sm">
			<template v-if="metaComponent">
				<component :is="metaComponent" :game="game" :package="package" :card="card" />
			</template>

			<AppJolticon
				v-for="supportKey of card.platformSupport"
				:key="supportKey"
				v-app-tooltip="card.platformSupportInfo[supportKey].tooltip"
				:icon="card.platformSupportInfo[supportKey].icon"
			/>

			<template v-if="card.showcasedRelease">
				{{ ' ' }}
				<AppTranslate>Version:</AppTranslate>
				{{ ' ' }}
				<strong>{{ card.showcasedRelease.version_number }}</strong>

				<span class="dot-separator" />

				<AppTimeAgo :date="card.showcasedRelease.published_on" />
			</template>
		</div>

		<div v-if="sale && pricing?.end" class="card-content card-sale-info">
			<strong><AppTranslate>On sale!</AppTranslate></strong>
			{{ ' ' }}
			<AppTranslate>Offer ends in</AppTranslate>
			{{ ' ' }}
			<AppCountdown :end="pricing.end" />
		</div>

		<div v-if="package.description" class="card-content">
			<AppFadeCollapse
				:collapse-height="100"
				:is-open="showFullDescription"
				@require-change="canToggleDescription = $event"
				@expand="showFullDescription = true"
			>
				<div>{{ package.description }}</div>
			</AppFadeCollapse>

			<a
				v-if="canToggleDescription"
				v-app-track-event="`game-package-card:show-full-description`"
				class="hidden-text-expander"
				@click="showFullDescription = !showFullDescription"
			/>
		</div>

		<div v-if="!isOwned && card.hasSteamKey" class="card-content">
			<p>
				<AppJolticon icon="steam" />
				<AppTranslate>You will also get a Steam key with this purchase.</AppTranslate>
			</p>
		</div>

		<template v-if="!card.showcasedRelease">
			<br />
			<div class="alert alert-notice">
				<AppTranslate>No published releases yet.</AppTranslate>
			</div>
		</template>
		<div v-else class="card-controls">
			<template v-if="sellable.type !== 'paid' || isOwned">
				<component
					:is="buttonsComponent"
					:game="game"
					:package="package"
					:card="card"
					@click="buildClick($event.build, $event.fromExtraSection)"
					@show-build-payment="showPayment($event, false)"
				/>
			</template>

			<template v-if="sellable.type === 'paid' && !isOwned">
				<div class="clearfix">
					<AppButton primary @click="showPayment(null, false)">
						<AppTranslate>Buy Now</AppTranslate>
					</AppButton>

					<span class="game-package-card-payment-what-link">
						<a class="link-help" @click="isWhatOpen = !isWhatOpen">
							<AppTranslate>What do you get?</AppTranslate>
						</a>
					</span>
				</div>
			</template>

			<template v-if="linkedKeys.length">
				<hr />

				<div class="alert">
					<AppTranslate>
						You also get access to keys for these other platforms.
					</AppTranslate>
				</div>

				<div v-for="linkedKey of linkedKeys" :key="linkedKey.key" class="clearfix">
					<div class="pull-right">
						&nbsp;
						<AppButton @click="copyProviderKey(linkedKey)">
							<AppTranslate>Copy</AppTranslate>
						</AppButton>
					</div>

					<div class="input-group">
						<span class="input-group-addon">
							<AppJolticon
								v-if="providerIcons[linkedKey.provider]"
								:icon="providerIcons[linkedKey.provider]"
							/>
							<strong>{{ linkedKey.provider_label }}</strong>
						</span>
						<input class="form-control" :value="linkedKey.key" />
					</div>
				</div>
			</template>
		</div>

		<AppExpand :when="isWhatOpen" class="package-card-well-expander">
			<div class="package-card-well">
				<div v-for="build of builds" :key="build.id">
					{{ build.primary_file.filename }}
					{{ ' ' }}
					<small class="text-muted">
						({{ formatFilesize(build.primary_file.filesize) }})
					</small>

					<span
						v-for="os of ['windows', 'mac', 'linux', 'other']"
						:key="os"
						class="package-card-well-os"
					>
						<template v-if="build.isPlatform(os) || build.isPlatform(os, '64')">
							{{ card.platformSupportInfo[os].tooltip }}
						</template>

						<template v-if="!build.isPlatform(os) && build.isPlatform(os, '64')">
							64-bit
						</template>
					</span>
				</div>

				<div v-if="card.hasSteamKey">
					<AppTranslate>1 Steam key</AppTranslate>
				</div>
			</div>
		</AppExpand>
	</AppCard>
</template>

<style lang="stylus" scoped>
.game-package-card
	&-pricing
		rounded-corners()
		float: right
		margin-top: -(15px + 4px)
		margin-left: 15px
		padding: 10px
		text-align: center

		&-amount
			color: $white

		&-amount-old
			theme-prop('color', 'lighter')
			margin-left: 5px
			text-decoration: line-through
			font-size: $font-size-tiny

		&-tag
			color: $white
			font-size: $font-size-tiny
			font-weight: bold
			text-transform: uppercase

			&.muted
				theme-prop('color', 'lighter')

		&-sale-percentage
			change-bg('highlight')
			theme-prop('color', 'highlight-fg')
			border-top-left-radius: $border-radius-base
			border-top-right-radius: $border-radius-base
			display: block
			margin-left: -10px
			margin-right: -10px
			margin-top: -10px
			margin-bottom: 5px
			padding-top: 3px
			padding-bottom: 3px
			font-weight: bold

	.card
		padding-bottom: 0

	.card-sale-info
		theme-prop('color', 'highlight')

	.card-controls
		margin-bottom: 15px

	.package-card-well-expander
		clear: both
		margin-left: -15px
		margin-right: -15px

	.package-card-well
		change-bg('bg-offset')
		theme-prop('border-top-color', 'light')
		theme-prop('border-bottom-color', 'light')
		padding: 15px
		border-top-width: 2px
		border-top-style: dashed
		border-bottom-width: 2px
		border-bottom-style: dashed

		p:last-child
			margin-bottom: 0

		&-os
			margin: 0 5px
			font-size: $font-size-small

	&-payment-what-link
		float: right
		display: inline-block
		line-height: $button-md-line-height
		font-size: $font-size-small
</style>
