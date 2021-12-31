<script lang="ts" src="./community"></script>

<template>
	<app-form :controller="form">
		<app-form-group name="name" :label="$gettext(`Name`)">
			<div class="help-block">
				<translate>Choose a short and descriptive name for your community.</translate>
			</div>
			<app-form-control
				type="text"
				:validators="[validateMaxLength(100)]"
				:disabled="method === 'edit' && formModel.game"
			/>
			<app-form-control-errors />
		</app-form-group>

		<!-- URL Path is only editable during community creation -->
		<app-form-group v-if="method === 'add'" name="path" :label="$gettext(`URL Path`)">
			<div class="help-block">
				<p>
					<translate>
						Community URLs should be memorable, unique, and as short as possible.
					</translate>
				</p>
			</div>
			<app-form-control
				prefix="gamejolt.com/c/"
				:validators="[
					validateUrlPath(),
					validateMaxLength(50),
					validateAvailability({
						url: '/web/dash/communities/check-field-availability/path',
					}),
				]"
				data-vv-delay="500"
			/>
			<div class="help-block">
				<p>
					<strong>
						<translate> Once a URL path is chosen it cannot be changed! </translate>
					</strong>
				</p>
			</div>
			<app-form-control-errors />
		</app-form-group>

		<!-- Post placeholder text only shows whens editing -->
		<app-form-group
			v-if="method !== 'add'"
			name="post_placeholder_text"
			:label="$gettext(`Post Placeholder`)"
			optional
		>
			<div class="help-block">
				<translate>Customize the placeholder message for post creations.</translate>
			</div>

			<AppPostAddButtonFormControl />

			<app-form-control-errors />
		</app-form-group>

		<!-- Color Theme - only show this in the edit part, not creation -->
		<app-form-group v-if="method !== 'add'" name="theme" :label="$gettext(`Color Theme`)">
			<app-form-control-theme class="pull-right" @changed="onThemeChanged()" />
			<p class="help-block">
				<translate>
					Give your page a splash of color! When people view this community, they'll be
					switched to this theme.
				</translate>
			</p>
		</app-form-group>

		<app-form-button show-when-valid>
			<translate v-if="method === 'add'">Create</translate>
			<translate v-else>Save Details</translate>
		</app-form-button>
	</app-form>
</template>
