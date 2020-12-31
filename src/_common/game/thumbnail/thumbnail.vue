<script lang="ts" src="./thumbnail"></script>

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
					<app-game-follow-widget :game="game" overlay circle event-label="game-thumb" />

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

						<app-game-mod-links slot="popover" :game="game" />
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
