<template>
	<app-card class="game-package-card" :id="`game-package-card-${package.id}`">
		<div class="game-package-card-pricing fill-gray">
			<!-- Fixed Pricing -->
			<div v-if="sellable.type === 'paid'">
				<span class="game-package-card-pricing-sale-percentage" v-if="sale">
					-{{ salePercentageOff }}%
				</span>
				<strong class="game-package-card-pricing-amount">
					{{ pricing.amount | currency }}
				</strong>
				<span
					class="game-package-card-pricing-amount game-package-card-pricing-amount-old"
					v-if="sale"
				>
					{{ saleOldPricing.amount | currency }}
				</span>
			</div>

			<!-- Pay What You Want -->
			<div v-else-if="sellable.type === 'pwyw'">
				<translate class="game-package-card-pricing-tag text-lower">
					Name Your Price
				</translate>
			</div>

			<!-- Free/Default -->
			<div v-else-if="sellable.type === 'free'">
				<strong class="game-package-card-pricing-amount text-upper">
					<translate>Free</translate>
				</strong>
			</div>
		</div>

		<!-- If they own the package -->
		<div
			v-if="isOwned"
			class="game-package-card-pricing game-package-card-pricing-owned fill-highlight"
		>
			<strong class="text-upper">
				<translate>Owned</translate>
			</strong>
		</div>

		<div class="card-title">
			<h4>
				{{ package.title || game.title }}
			</h4>
		</div>

		<div class="card-meta card-meta-sm">
			<component
				v-if="metaComponent"
				:is="metaComponent"
				:game="game"
				:package="package"
				:card="card"
			/>

			<app-jolticon
				v-for="supportKey of card.platformSupport"
				:key="supportKey"
				:icon="card.platformSupportInfo[supportKey].icon"
				v-app-tooltip="card.platformSupportInfo[supportKey].tooltip"
			/>

			<span class="dot-separator" v-if="card.platformSupport.length"></span>

			<template v-if="card.showcasedRelease">
				<translate>Version:</translate>
				<strong>{{ card.showcasedRelease.version_number }}</strong>

				<span class="dot-separator"></span>

				<app-time-ago :date="card.showcasedRelease.published_on" />
			</template>
		</div>

		<div class="card-content card-sale-info" v-if="sale">
			<strong><translate>On sale!</translate></strong>
			<translate>Offer ends in</translate>
			<app-countdown :end="pricing.end" />
		</div>

		<div class="card-content" v-if="package.description">
			<app-fade-collapse
				:collapse-height="100"
				:is-open="showFullDescription"
				@require-change="canToggleDescription = $event"
				@expand="showFullDescription = true"
			>
				<div v-html="package.description" />
			</app-fade-collapse>

			<a
				class="hidden-text-expander"
				v-if="canToggleDescription"
				@click="showFullDescription = !showFullDescription"
				v-app-track-event="`game-package-card:show-full-description`"
			/>
		</div>

		<div class="card-content" v-if="!isOwned && card.hasSteamKey">
			<p>
				<app-jolticon icon="steam" />
				<translate>You will also get a Steam key with this purchase.</translate>
			</p>
		</div>

		<template v-if="!card.showcasedRelease">
			<br />
			<div class="alert alert-notice">
				<translate>No published releases yet.</translate>
			</div>
		</template>
		<div class="card-controls" v-else>
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
						<translate>You get access to this package because you're a partner.</translate>
					</div>
					<hr />
				</template>
			</template>

			<template v-if="sellable.type === 'paid' && !isOwned">
				<div class="clearfix">
					<app-button primary @click="showPayment(null, false)">
						<translate>Buy Now</translate>
					</app-button>

					<span class="game-package-card-payment-what-link">
						(
						<a class="link-help" @click="isWhatOpen = !isWhatOpen">
							<translate>What do you get?</translate>
						</a>
						)
					</span>
				</div>
			</template>

			<template v-if="linkedKeys.length">
				<hr />

				<div class="alert">
					<translate>You also get access to keys for these other platforms.</translate>
				</div>

				<div class="clearfix" v-for="linkedKey of linkedKeys" :key="linkedKey.key">
					<div class="pull-right">
						&nbsp;
						<app-button @click="copyProviderKey(linkedKey)">
							<translate>Copy</translate>
						</app-button>
					</div>

					<div class="input-group">
						<span class="input-group-addon">
							<app-jolticon
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

		<app-expand :when="isWhatOpen" class="package-card-well-expander">
			<div class="package-card-well">
				<div v-for="build of builds" :key="build.id">
					{{ build.primary_file.filename }}
					<small class="text-muted">({{ build.primary_file.filesize | filesize }})</small>

					<span class="package-card-well-os" v-for="os of ['windows', 'mac', 'linux', 'other']">
						<template v-if="build['os_' + os] || build['os_' + os + '_64']">
							{{ card.platformSupportInfo[os].tooltip }}
						</template>

						<template v-if="!build['os_' + os] && build['os_' + os + '_64']">
							64-bit
						</template>
					</span>
				</div>

				<div v-if="card.hasSteamKey">
					<translate>1 Steam key</translate>
				</div>

				<br />

				<small>
					<translate>And really warm feelings for supporting an indie developer!</translate>
				</small>
			</div>
		</app-expand>
	</app-card>
</template>

<style lang="stylus" src="./card.styl" scoped></style>

<script lang="ts" src="./card"></script>
