<script lang="ts" src="./document"></script>

<template>
	<div v-if="parent.requiresField(prefix)">
		<!--
			It only has a details_code if it failed to verify.
		-->
		<div
			v-if="
				!parent.getStripeField(prefix + '.front') ||
				parent.getStripeField(prefix + '.details_code')
			"
		>
			<hr />

			<div v-if="parent.getStripeField(prefix + '.details')" class="alert">
				<app-jolticon icon="notice" />
				{{ parent.getStripeField(prefix + '.details') }}
			</div>

			<app-form-group :name="`${prefix}.front`" :label="fieldName">
				<p class="help-block">
					<translate v-if="type === 'id'">
						This should be a scan of an ID card, driver's license, passport, or other
						government supplied identification.
					</translate>
					<translate v-else>
						This should be a scan or photo of a document verifying the address, such as
						a utility bill.
					</translate>
					<em>
						<translate>
							Only .png or .jpg is accepted and it must be smaller than 8MB.
						</translate>
					</em>
				</p>
				<app-form-control-upload
					ref="document-input"
					:validators="[validateFilesize(8 * 1024 * 1024)]"
					accept=".png,.jpg,.jpeg"
				/>
				<app-form-control-errors />
			</app-form-group>
		</div>

		<div
			v-if="
				parent.getStripeField(prefix + '.front') &&
				!parent.getStripeField(prefix + '.details_code')
			"
			class="form-horizontal"
		>
			<div class="form-group">
				<label class="control-label col-sm-4">
					<translate>ID Document</translate>
				</label>
				<div class="form-static col-sm-8">
					<translate>Provided</translate>
				</div>
			</div>
		</div>
	</div>
</template>
