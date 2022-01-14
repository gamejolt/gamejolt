<script lang="ts">
import { setup } from 'vue-class-component';
import { Options, Prop, Vue } from 'vue-property-decorator';
import AppGamePlaylistAddToWidget from '../../../app/components/game-playlist/add-to-widget/add-to-widget.vue';
import AppGameCompatIcons from '../../../app/components/game/compat-icons/compat-icons.vue';
import AppGameFollowWidget from '../../../app/components/game/follow-widget/follow-widget.vue';
import AppGameModLinks from '../../../app/components/game/mod-links/mod-links.vue';
import { formatCurrency } from '../../filters/currency';
import AppPopper from '../../popper/popper.vue';
import { Screen } from '../../screen/screen-service';
import AppScrollInview, { ScrollInviewConfig } from '../../scroll/inview/inview.vue';
import { SettingAnimatedThumbnails } from '../../settings/settings.service';
import { useCommonStore } from '../../store/common-store';
import AppUserCardHover from '../../user/card/hover/hover.vue';
import AppUserAvatarImg from '../../user/user-avatar/img/img.vue';
import AppUserVerifiedTick from '../../user/verified-tick/verified-tick.vue';
import { Game } from '../game.model';
import AppGameThumbnailImg from '../thumbnail-img/thumbnail-img.vue';

const InviewConfig = new ScrollInviewConfig({ margin: `${Screen.height}px` });

@Options({
	components: {
		AppGameThumbnailImg,
		AppGameCompatIcons,
		AppPopper,
		AppGameModLinks,
		AppUserCardHover,
		AppUserAvatarImg,
		AppScrollInview,
		AppGameFollowWidget,
		AppGamePlaylistAddToWidget,
		AppUserVerifiedTick,
	},
})
export default class AppGameThumbnail extends Vue {
	@Prop({ type: Object, required: true }) game!: Game;
	@Prop(String) linkTo?: string;
	@Prop({ type: Boolean, default: false }) hidePricing!: boolean;
	@Prop({ type: Boolean, default: false }) hideControls!: boolean;

	commonStore = setup(() => useCommonStore());

	get app() {
		return this.commonStore;
	}

	isBootstrapped = import.meta.env.SSR;
	isHydrated = import.meta.env.SSR;
	readonly InviewConfig = InviewConfig;
	readonly Screen = Screen;
	readonly Game = Game;

	get shouldShowControls() {
		// TODO(vue3): check this to see if the default check still works
		// Only show controls if they didn't override with their own.
		return !this.$slots.default && !this.hideControls;
	}

	get shouldAnimate() {
		return SettingAnimatedThumbnails.get() && this.isHydrated;
	}

	get url() {
		if (this.linkTo === 'dashboard') {
			return this.game.getUrl('dashboard');
		} else if (this.linkTo) {
			return this.linkTo;
		}

		return this.game.getUrl();
	}

	get isOwned() {
		return this.game.sellable && this.game.sellable.is_owned;
	}

	get sellableType() {
		return this.game.sellable && this.game.sellable.type;
	}

	get pricing() {
		if (this.game.sellable && Array.isArray(this.game.sellable.pricings)) {
			return this.game.sellable.pricings[0];
		}
	}

	get saleOldPricing() {
		if (this.game.sellable && Array.isArray(this.game.sellable.pricings)) {
			return this.game.sellable.pricings[1];
		}
	}

	get sale() {
		return this.pricing && this.pricing.promotional;
	}

	get salePercentageOff() {
		if (this.pricing && this.saleOldPricing) {
			return (
				((this.saleOldPricing.amount - this.pricing.amount) / this.saleOldPricing.amount) *
				100
			).toFixed(0);
		}
		return '';
	}

	get pricingAmount() {
		return this.pricing && formatCurrency(this.pricing.amount);
	}

	get oldPricingAmount() {
		return this.saleOldPricing && formatCurrency(this.saleOldPricing.amount);
	}

	get showModTools() {
		return this.app.user && this.app.user.isMod && !this.hideControls;
	}

	inView() {
		this.isBootstrapped = true;
		this.isHydrated = true;
	}

	outView() {
		this.isHydrated = false;
	}
}
</script>

<template>
	<router-link class="game-thumbnail" :to="url">
		<app-scroll-inview :config="InviewConfig" @inview="inView" @outview="outView">
			<div
				v-if="app.user && Screen.isLg && isHydrated"
				class="-controls theme-dark"
				@click.prevent
			>
				<slot />

				<template v-if="shouldShowControls">
					<app-game-follow-widget :game="game" overlay circle location="thumbnail" />

					<app-game-playlist-add-to-widget
						:game="game"
						overlay
						circle
						event-label="game-thumb"
					/>
				</template>

				<template v-if="showModTools">
					<app-popper popover-class="fill-darkest">
						<app-button overlay circle icon="cog" />

						<template #popover>
							<app-game-mod-links :game="game" />
						</template>
					</app-popper>
				</template>
			</div>

			<app-game-thumbnail-img
				class="-thumb"
				:game="game"
				:hide-media="!isBootstrapped"
				:animate="shouldAnimate"
			/>

			<div class="-meta">
				<div
					v-if="game._has_packages && !hidePricing"
					class="-pricing fill-offset"
					:class="{
						'-pricing-owned': isOwned,
						'-pricing-sale': sale,
					}"
				>
					<template v-if="!isOwned">
						<template v-if="sellableType === 'paid'">
							<div class="-pricing-container">
								<div v-if="sale" class="-pricing-amount-old">
									{{ oldPricingAmount }}
								</div>
								<div class="-pricing-amount">
									{{ pricingAmount }}
								</div>
							</div>
							<div v-if="sale" class="-pricing-sale-percentage">
								-{{ salePercentageOff }}%
							</div>
						</template>
						<span v-else-if="sellableType === 'pwyw'" class="-pricing-tag">
							<translate>Name Your Price</translate>
						</span>
						<span v-else class="-pricing-tag">
							<translate>Free</translate>
						</span>
					</template>
					<template v-else>
						<span class="-pricing-tag">
							<translate>Owned</translate>
						</span>
					</template>
				</div>

				<div class="-avatar">
					<app-user-card-hover :user="game.developer">
						<app-user-avatar-img :user="game.developer" />
					</app-user-card-hover>
				</div>

				<div
					class="-dev"
					:title="`${game.developer.display_name} (@${game.developer.username})`"
				>
					{{ game.developer.display_name }}
					<small>
						<app-user-verified-tick :user="game.developer" vertical-align />
					</small>
				</div>

				<div class="-title" :title="game.title">
					{{ game.title }}
				</div>

				<div class="-meta-extra">
					<!-- Don't show if devlog -->
					<div v-if="game.development_status !== 4" class="-os">
						<app-game-compat-icons :game="game" />
					</div>

					<span class="-tags">
						<span v-if="game.isUnlisted" class="-tag tag tag-notice">
							<translate>Unlisted</translate>
						</span>
					</span>
				</div>
			</div>
		</app-scroll-inview>
	</router-link>
</template>

<style lang="stylus" src="./thumbnail.styl" scoped></style>
