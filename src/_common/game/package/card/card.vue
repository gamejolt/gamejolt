<script lang="ts">
import { Component } from 'vue';
import { Options, Prop, Vue } from 'vue-property-decorator';
import AppFadeCollapse from '../../../AppFadeCollapse.vue';
import { Analytics } from '../../../analytics/analytics.service';
import AppCard from '../../../card/AppCard.vue';
import { Clipboard } from '../../../clipboard/clipboard-service';
import { AppCountdown } from '../../../countdown/countdown';
import AppExpand from '../../../expand/AppExpand.vue';
import { formatCurrency } from '../../../filters/currency';
import { formatFilesize } from '../../../filters/filesize';
import { LinkedKey } from '../../../linked-key/linked-key.model';
import { SellablePricing } from '../../../sellable/pricing/pricing.model';
import { Sellable } from '../../../sellable/sellable.model';
import AppTimeAgo from '../../../time/AppTimeAgo.vue';
import { vAppTooltip } from '../../../tooltip/tooltip-directive';
import { User } from '../../../user/user.model';
import { GameBuild, GameBuildType } from '../../build/build.model';
import { GameDownloader } from '../../downloader/downloader.service';
import { Game } from '../../game.model';
import { GamePlayModal } from '../../play-modal/play-modal.service';
import { GameRelease } from '../../release/release.model';
import { GamePackage } from '../package.model';
import { GamePackagePurchaseModal } from '../purchase-modal/purchase-modal.service';
import AppGamePackageCardButtons from './AppGamePackageCardButtons.vue';
import { GamePackageCardModel } from './card.model';

let buttonsComponent: Component | undefined;
let metaComponent: Component | undefined;

export function setButtonsComponent(component: Component) {
	buttonsComponent = component;
}

export function setMetaComponent(component: Component) {
	metaComponent = component;
}

@Options({
	components: {
		AppCard,
		AppTimeAgo,
		AppFadeCollapse,
		AppExpand,
		AppCountdown,
	},
	directives: {
		AppTooltip: vAppTooltip,
	},
})
export default class AppGamePackageCard extends Vue {
	@Prop(Object)
	game!: Game;

	@Prop(Object)
	package!: GamePackage;

	@Prop(Object)
	sellable!: Sellable;

	@Prop({ type: Array, default: () => [] })
	releases!: GameRelease[];

	@Prop({ type: Array, default: () => [] })
	builds!: GameBuild[];

	@Prop(String)
	accessKey?: string;

	@Prop(Boolean)
	isPartner?: boolean;

	@Prop(String)
	partnerKey?: string;

	@Prop(Object)
	partner?: User;

	showFullDescription = false;
	canToggleDescription = false;

	isWhatOpen = false;
	pricing: SellablePricing | null = null;
	sale = false;
	salePercentageOff = '';
	saleOldPricing: SellablePricing | null = null;

	providerIcons: { [provider: string]: string } = {
		steam: 'steam',
	};

	readonly AppGamePackageCard = AppGamePackageCard;
	readonly formatCurrency = formatCurrency;
	readonly formatFilesize = formatFilesize;

	get metaComponent() {
		return metaComponent;
	}

	get buttonsComponent() {
		return buttonsComponent ?? AppGamePackageCardButtons;
	}

	get card() {
		return new GamePackageCardModel(this.sellable, this.releases, this.builds, this.linkedKeys);
	}

	get isOwned() {
		// If there is a key on the package, then we should show it as being
		// "owned".
		if (this.accessKey) {
			return true;
		}

		return this.sellable && this.sellable.is_owned ? true : false;
	}

	get linkedKeys() {
		if (!this.sellable) {
			return [];
		}

		return this.sellable.linked_keys || [];
	}

	get canBuy() {
		return (
			this.sellable &&
			!this.isOwned &&
			(this.sellable.type === 'pwyw' || this.sellable.type === 'paid')
		);
	}

	created() {
		if (this.sellable && this.sellable.pricings.length > 0) {
			this.pricing = this.sellable.pricings[0];
			if (this.pricing.promotional) {
				this.saleOldPricing = this.sellable.pricings[1];
				this.sale = true;
				this.salePercentageOff = (
					((this.saleOldPricing.amount - this.pricing.amount) /
						this.saleOldPricing.amount) *
					100
				).toFixed(0);
			}
		}
	}

	buildClick(build: GameBuild, fromExtraSection = false) {
		// For client, if they clicked in the "options" section, then skip
		// showing payment form. Just take them directly to site.
		if (GJ_IS_DESKTOP_APP && fromExtraSection) {
			this.doBuildClick(build, fromExtraSection);
		} else if (this.sellable.type === 'pwyw' && this.canBuy) {
			this.showPayment(build, fromExtraSection);
		} else {
			this.doBuildClick(build, fromExtraSection);
		}
	}

	private doBuildClick(build: GameBuild, fromExtraSection = false) {
		let operation = build.type === GameBuildType.Downloadable ? 'download' : 'play';
		if (build.type === GameBuildType.Rom && fromExtraSection) {
			operation = 'download';
		}

		if (operation === 'download') {
			this.download(build);
		} else if (operation === 'play') {
			this.showBrowserModal(build);
		}
	}

	showPayment(build: GameBuild | null, fromExtraSection: boolean) {
		GamePackagePurchaseModal.show({
			game: this.game,
			package: this.package,
			build: build,
			fromExtraSection,
			partner: this.partner,
			partnerKey: this.partnerKey,
		});
	}

	private download(build: GameBuild) {
		Analytics.trackEvent('game-package-card', 'download', 'download');

		GameDownloader.download(this.$router, this.game, build, {
			isOwned: this.isOwned || this.isPartner,
			key: this.accessKey,
		});
	}

	private showBrowserModal(build: GameBuild) {
		Analytics.trackEvent('game-package-card', 'download', 'play');

		GamePlayModal.show(this.game, build, {
			// isOwned: this.isOwned || this.isPartner,
			key: this.accessKey,
		});
	}

	copyProviderKey(key: LinkedKey) {
		Clipboard.copy(key.key);
	}
}
</script>

<template>
	<AppCard :id="`game-package-card-${package.id}`" class="game-package-card">
		<div class="game-package-card-pricing fill-gray">
			<!-- Fixed Pricing -->
			<div v-if="sellable.type === 'paid'">
				<span v-if="sale" class="game-package-card-pricing-sale-percentage">
					-{{ salePercentageOff }}%
				</span>
				<strong class="game-package-card-pricing-amount">
					{{ formatCurrency(pricing.amount) }}
				</strong>
				<span
					v-if="sale"
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

		<div v-if="sale" class="card-content card-sale-info">
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
			<template v-if="sellable.type !== 'paid' || isOwned || isPartner">
				<component
					:is="buttonsComponent"
					:game="game"
					:package="package"
					:card="card"
					@click="buildClick($event.build, $event.fromExtraSection)"
					@show-build-payment="showPayment($event, false)"
				/>

				<template v-if="isPartner && sellable.type === 'paid' && !isOwned">
					<br />
					<div class="alert">
						<AppTranslate>
							You get access to this package because you're a partner.
						</AppTranslate>
					</div>
					<hr />
				</template>
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
						<template v-if="build['os_' + os] || build['os_' + os + '_64']">
							{{ card.platformSupportInfo[os].tooltip }}
						</template>

						<template v-if="!build['os_' + os] && build['os_' + os + '_64']">
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

<style lang="stylus" src="./card.styl" scoped></style>
