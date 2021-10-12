<script lang="ts" src="./community"></script>

<template>
	<app-form name="detailsForm">
		<app-form-group name="name" :label="$gettext(`Name`)">
			<div class="help-block">
				<translate>Choose a short and descriptive name for your community.</translate>
			</div>
			<app-form-control
				type="text"
				:rules="{
					max: 100,
				}"
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
			<app-form-control-prefixed-input
				prefix="gamejolt.com/c/"
				:rules="{
					pattern: 'urlPath',
					max: 50,
					availability: {
						url: '/web/dash/communities/check-field-availability/path',
					},
				}"
				data-vv-delay="500"
			/>
			<div class="help-block">
				<p>
					<strong>
						<translate>Once a URL path is chosen it cannot be changed!</translate>
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

			<app-post-add-button-form-control
				:placeholder="$gettext(`Share your creations!`)"
				:rules="{
					max: 100,
				}"
			/>

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

		<!-- Temporarely disabled -->
		<!-- <app-form-group name="allow_firesides" :label="$gettext(`Allow community firesides?`)">
			<app-form-control-toggle class="pull-right" />

			<p class="help-block">
				<translate>
					Will allow any member of the community to start a fireside in this community.
				</translate>
			</p>
			<p class="help-block">
				<translate>
					You are able to eject firesides at any time, and blocked users will not be able
					to create any firesides in your community.
				</translate>
			</p>
		</app-form-group> -->

		<app-form-button show-when-valid>
			<translate v-if="method === 'add'">Create</translate>
			<translate v-else>Save Details</translate>
		</app-form-button>
	</app-form>
</template>
