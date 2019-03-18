<template>
	<router-link class="game-thumbnail" :to="url">
		<app-scroll-inview :extra-padding="Screen.height" @inview="inView" @outview="outView">
			<div class="-controls theme-dark" v-if="app.user && Screen.isLg && isHydrated" @click.prevent>
				<slot />

				<template v-if="shouldShowControls">
					<app-game-follow-widget :game="game" overlay circle event-label="game-thumb" />

					<app-game-playlist-add-to-widget :game="game" overlay circle event-label="game-thumb" />
				</template>

				<template v-if="showModTools">
					<app-popper>
						<app-button overlay circle icon="cog" @click.prevent />

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
					class="-pricing fill-offset"
					v-if="game._has_packages && !hidePricing"
					:class="{
						'-pricing-owned': isOwned,
						'-pricing-sale': sale,
					}"
				>
					<template v-if="!isOwned">
						<template v-if="sellableType === 'paid'">
							<div class="-pricing-container">
								<div class="-pricing-amount-old" v-if="sale">
									{{ oldPricingAmount }}
								</div>
								<div class="-pricing-amount">
									{{ pricingAmount }}
								</div>
							</div>
							<div class="-pricing-sale-percentage" v-if="sale">-{{ salePercentageOff }}%</div>
						</template>
						<span class="-pricing-tag" v-else-if="sellableType === 'pwyw'">
							<translate>Name Your Price</translate>
						</span>
						<span class="-pricing-tag" v-else>
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

				<div class="-dev" :title="`${game.developer.display_name} (@${game.developer.username})`">
					{{ game.developer.display_name }}
				</div>

				<div class="-title" :title="game.title">
					{{ game.title }}
				</div>

				<div class="-meta-extra">
					<!-- Don't show if devlog -->
					<div class="-os" v-if="game.development_status !== 4">
						<app-game-compat-icons :game="game" />
					</div>

					<span class="-tags">
						<span class="-tag tag tag-notice" v-if="game.status === Game.STATUS_HIDDEN">
							<translate>Hidden</translate>
						</span>
					</span>
				</div>
			</div>
		</app-scroll-inview>
	</router-link>
</template>

<style src="./thumbnail.styl" scoped />

<script lang="ts" src="./thumbnail" />
