<template>
	<app-form name="addKeys">
		<app-form-group
			name="amount"
			:label="$gettext(`# of Keys to Generate`)"
			v-if="
				keyGroup.type === KeyGroup.TYPE_ANONYMOUS || keyGroup.type === KeyGroup.TYPE_ANONYMOUS_CLAIM
			"
		>
			<app-form-control
				type="number"
				step="1"
				min="1"
				:max="20000 - keyGroup.key_count"
				:rules="{
					min_value: 1,
					max_value: 20000 - keyGroup.key_count,
				}"
			/>
			<app-form-control-errors />
		</app-form-group>

		<app-form-group
			name="emails"
			:label="$gettext(`Email Addresses`)"
			v-if="keyGroup.type === KeyGroup.TYPE_EMAIL"
		>
			<p class="help-block">
				<translate>Paste one email address per line, or separate them by commas.</translate>
			</p>
			<app-form-control-textarea
				rows="10"
				:rules="{
					max: 750,
				}"
			/>
			<app-form-control-errors />
		</app-form-group>

		<app-form-group
			name="users"
			:label="$gettext(`Usernames`)"
			v-if="keyGroup.type === KeyGroup.TYPE_USER"
		>
			<p class="help-block">
				<translate>Paste one username per line, or separate them by commas.</translate>
			</p>
			<app-form-control-textarea
				rows="10"
				:rules="{
					max: 750,
				}"
			/>
			<app-form-control-errors />
		</app-form-group>

		<app-expand :when="serverErrors['num-keys']">
			<div class="alert alert-notice">
				<translate
					:translate-params="{
						max: number(20000),
					}"
				>
					You can only have a max of %{ max } keys in a single key group.
				</translate>
			</div>
		</app-expand>

		<app-form-button>
			<translate>Add</translate>
		</app-form-button>
	</app-form>
</template>

<script lang="ts" src="./add-keys"></script>
