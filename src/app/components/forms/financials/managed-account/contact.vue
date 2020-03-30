<template>
	<div>
		<div class="row" v-if="!parent.getStripeField(namePrefix + '.email')">
			<div
				class="col-sm-6"
				v-if="parent.requiresField(namePrefix + '.email') || forceRequired"
			>
				<app-form-group :name="`${namePrefix}.email`" :label="$gettext('Email')">
					<app-form-control type="email" />
					<app-form-control-errors />
				</app-form-group>
			</div>
			<div
				class="col-sm-6"
				v-if="parent.requiresField(namePrefix + '.phone') || forceRequired"
			>
				<app-form-group :name="`${namePrefix}.phone`" :label="$gettext('Phone')">
					<app-form-control />
					<app-form-control-errors />
				</app-form-group>
			</div>
		</div>

		<div class="form-horizontal" v-if="parent.getStripeField(namePrefix + '.email')">
			<div class="form-group">
				<label class="control-label col-sm-4">
					<translate>Contact</translate>
				</label>
				<div class="form-static col-sm-8">
					<div>{{ parent.getStripeField(namePrefix + '.email') }}</div>
					<div>{{ parent.getStripeField(namePrefix + '.phone') }}</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts" src="./contact"></script>
