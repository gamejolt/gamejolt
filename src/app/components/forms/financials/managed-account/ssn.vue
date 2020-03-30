<template>
	<div>
		<template v-if="parent.requiresField(namePrefix + '.id_number')">
			<app-form-group
				v-if="!parent.getStripeField(namePrefix + '.id_number_provided')"
				:name="`${namePrefix}.id_number`"
				:label="
					countryCode === 'us'
						? 'Social Security Number or ITIN'
						: 'Foreign Tax Identification Number'
				"
			>
				<p class="help-block" v-if="countryCode === 'us'">
					<translate>
						We are required by the IRS to collect your Social Security Number (SSN) or Individual
						Taxpayer Identification Number (ITIN) for tax purposes. For security reasons, we use
						Stripe to store this information, it will not be stored on Game Jolt's servers.
					</translate>
				</p>

				<p class="help-block" v-if="countryCode !== 'us'">
					<translate>
						We are required by the IRS to collect your Tax Identification Number (TIN) for tax
						purposes. For security reasons, we use Stripe to store this information, it will not be
						stored on Game Jolt's servers.
					</translate>
				</p>

				<app-form-control />
				<app-form-control-errors />
			</app-form-group>

			<div v-if="parent.getStripeField(namePrefix + '.id_number_provided')" class="form-horizontal">
				<div class="form-group">
					<label class="control-label col-sm-4">
						<template v-if="countryCode === 'us'">
							<translate>SSN/ITIN</translate>
						</template>
						<template v-if="countryCode !== 'us'">
							<translate>Foreign Tax Identification Number</translate>
						</template>
					</label>
					<div class="form-static col-sm-8">
						<translate>Provided</translate>
					</div>
				</div>
			</div>
		</template>

		<template v-else-if="parent.requiresField(namePrefix + '.ssn_last_4')">
			<app-form-group
				v-if="!parent.getStripeField(namePrefix + '.ssn_last_4_provided')"
				:name="`${namePrefix}.ssn_last_4`"
				:label="
					countryCode === 'us'
						? 'Social Security Number or ITIN - Last 4 Digits'
						: 'Foreign Tax Identification Number - Last 4 Digits'
				"
			>
				<p class="help-block" v-if="countryCode === 'us'">
					<translate>
						We are required by the IRS to collect a Social Security Number (SSN) or Individual
						Taxpayer Identification Number (ITIN) for tax purposes. For security reasons, we use
						Stripe to store this information, it will not be stored on Game Jolt's servers.
					</translate>
				</p>

				<p class="help-block" v-if="countryCode !== 'us'">
					<translate>
						We are required by the IRS to collect a Tax Identification Number (TIN) for tax
						purposes. For security reasons, we use Stripe to store this information, it will not be
						stored on Game Jolt's servers.
					</translate>
				</p>

				<app-form-control
					type="text"
					placeholder="1234"
					:rules="{
						pattern: /^\d{4}/,
					}"
				/>
				<app-form-control-errors
					:label="
						$gettext(countryCode === 'us' ? '4 digits of SSN / ITIN' : '4 digits of Foreign Tax ID')
					"
				/>
			</app-form-group>

			<div
				v-if="parent.getStripeField(namePrefix + '.ssn_last_4_provided')"
				class="form-horizontal"
			>
				<div class="form-group">
					<label class="control-label col-sm-4">
						<template v-if="countryCode === 'us'">
							<translate>SSN/ITIN - Last 4</translate>
						</template>
						<template v-if="countryCode !== 'us'">
							<translate>Foreign Tax Identification Number - Last 4</translate>
						</template>
					</label>
					<div class="form-static col-sm-8">
						<translate>Provided</translate>
					</div>
				</div>
			</div>
		</template>
	</div>
</template>

<script lang="ts" src="./ssn"></script>
