<script lang="ts" src="./card"></script>

<template>
	<app-card :id="`game-package-card-${package.id}`" class="game-package-card">
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
				:is="metaComponent"
				v-if="metaComponent"
				:game="game"
				:package="package"
				:card="card"
			/>

			<app-jolticon
				v-for="supportKey of card.platformSupport"
				:key="supportKey"
				v-app-tooltip="card.platformSupportInfo[supportKey].tooltip"
				:icon="card.platformSupportInfo[supportKey].icon"
			/>

			<span v-if="card.platformSupport.length" class="dot-separator" />

			<template v-if="card.showcasedRelease">
				<translate>Version:</translate>
				<strong>{{ card.showcasedRelease.version_number }}</strong>

				<span class="dot-separator" />

				<app-time-ago :date="card.showcasedRelease.published_on" />
			</template>
		</div>

		<div v-if="sale" class="card-content card-sale-info">
			<strong><translate>On sale!</translate></strong>
			<translate>Offer ends in</translate>
			<app-countdown :end="pricing.end" />
		</div>

		<div v-if="package.description" class="card-content">
			<app-fade-collapse
				:collapse-height="100"
				:is-open="showFullDescription"
				@require-change="canToggleDescription = $event"
				@expand="showFullDescription = true"
			>
				<div>{{ package.description }}</div>
			</app-fade-collapse>

			<a
				v-if="canToggleDescription"
				v-app-track-event="`game-package-card:show-full-description`"
				class="hidden-text-expander"
				@click="showFullDescription = !showFullDescription"
			/>
		</div>

		<div v-if="!isOwned && card.hasSteamKey" class="card-content">
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
						<translate>
							You get access to this package because you're a partner.
						</translate>
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

				<div v-for="linkedKey of linkedKeys" :key="linkedKey.key" class="clearfix">
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
					<small class="text-muted"
						>({{ formatFilesize(build.primary_file.filesize) }})</small
					>

					<span
						v-for="os of ['windows', 'mac', 'linux', 'other']"
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
					<translate>1 Steam key</translate>
				</div>
			</div>
		</app-expand>
	</app-card>
</template>

<style lang="stylus" src="./card.styl" scoped></style>
