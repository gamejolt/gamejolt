<template>
	<div>
		<div class="row" v-if="!parent.getStripeField(namePrefix + '.first_name')">
			<div
				class="col-sm-6"
				v-if="parent.requiresField(namePrefix + '.first_name') || forceRequired"
			>
				<app-form-group :name="`${namePrefix}.first_name`" :label="$gettext('First Name')">
					<app-form-control />
					<app-form-control-errors />
				</app-form-group>
			</div>
			<div class="col-sm-6" v-if="parent.requiresField(namePrefix + '.last_name') || forceRequired">
				<app-form-group :name="`${namePrefix}.last_name`" :label="$gettext('Last Name')">
					<app-form-control />
					<app-form-control-errors />
				</app-form-group>
			</div>
		</div>

		<div class="form-horizontal" v-if="parent.getStripeField(namePrefix + '.first_name')">
			<div class="form-group">
				<label class="control-label col-sm-4">
					<translate>Name</translate>
				</label>
				<div class="form-static col-sm-8">
					{{ parent.getStripeField(namePrefix + '.first_name') }}
					{{ parent.getStripeField(namePrefix + '.last_name') }}
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts" src="./name"></script>
