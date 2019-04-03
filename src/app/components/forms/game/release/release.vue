<template>
	<app-form class="game-release-form" name="releaseForm" ref="form">
		<app-form-group
			name="version_number"
			:title="$gettext('dash.games.releases.form.version_number_label')"
		>
			<div class="help-block">
				<p v-translate>
					Version numbers are how you label releases.
					<br />
					Numbering should follow the format
					<code>MAJOR.MINOR.PATCH</code>
					.
				</p>
				<a
					class="link-help"
					href="https://help.gamejolt.com/dev-packages#release-version-numbers"
					target="_blank"
				>
					<translate>dash.games.releases.form.version_number_help_link</translate>
				</a>
			</div>

			<app-form-control
				data-vv-delay="500"
				:rules="{
					pattern: 'semver',
					max: 50,
					availability: {
						url: `/web/dash/developer/games/releases/check-field-availability/${game.id}/${
							package.id
						}/version_number`,
						initVal: model.version_number,
					},
				}"
			/>
			<app-form-control-errors />
		</app-form-group>

		<fieldset v-if="model.status !== GameRelease.STATUS_PUBLISHED">
			<app-form-legend compact>
				<translate>Schedule publishing of release</translate>
			</app-form-legend>

			<template v-if="!isScheduling">
				<p class="help-block">
					<translate>You can set a future date/time that this release will publish.</translate>
				</p>

				<p>
					<app-button @click.prevent="addSchedule()">
						<translate>Add Schedule</translate>
					</app-button>
				</p>
			</template>
			<template v-else-if="isScheduling && timezones">
				<app-form-group name="scheduled_for_timezone" :label="$gettext(`Timezone`)">
					<p class="help-block">
						<translate>All time selection below will use this timezone.</translate>
					</p>

					<p class="help-block">
						<strong>
							<translate>
								Should auto-detect, but if it doesn't, choose your closest city.
							</translate>
						</strong>
					</p>

					<app-form-control-select>
						<optgroup v-for="(timezones, region) of timezones" :key="region" :label="region">
							<option v-for="timezone of timezones" :key="timezone.label" :value="timezone.i">
								{{ timezone.label }}
							</option>
						</optgroup>
					</app-form-control-select>

					<app-form-control-errors />
				</app-form-group>

				<app-form-group name="scheduled_for" :label="$gettext(`Date and time`)">
					<app-form-control-date
						:timezone-offset="scheduledTimezoneOffset"
						:rules="{
							min_date: now,
						}"
					/>
					<app-form-control-errors :label="$gettext(`scheduled for`)" />
				</app-form-group>

				<p class="text-right">
					<app-button trans @click.prevent="removeSchedule()">
						<translate>Remove Scheduling</translate>
					</app-button>
				</p>
			</template>

			<br />
		</fieldset>

		<fieldset>
			<app-form-legend compact>
				<translate>Builds</translate>
			</app-form-legend>

			<div class="alert alert-notice" v-if="!builds.length">
				<translate>
					You don't have any builds in this release yet. You won't be able to publish until you put
					some in.
				</translate>
			</div>

			<app-card-list :items="builds">
				<form-game-build
					v-for="build of builds"
					:key="build.id"
					:model="build"
					:game="game"
					:package="package"
					:release="model"
					:release-launch-options="launchOptions"
					:builds="builds"
					:build-download-counts="buildDownloadCounts"
					@update-launch-options="updateBuildLaunchOptions"
					@remove-build="removeBuild"
					@submit="onBuildEdited(build, $event)"
				/>
			</app-card-list>

			<br />

			<div class="alert alert-notice sans-margin" v-if="areBuildsLockedByJam">
				<app-jolticon icon="notice" />
				<strong>
					<translate>Your game is part of a jam that locks builds during voting.</translate>
				</strong>
				<translate>You will not be able to add new builds until the voting period ends.</translate>
			</div>
			<div class="row" v-else>
				<div class="col-sm-6">
					<h5 class="sans-margin-top">
						<strong><translate>Upload Downloadable Build</translate></strong>
					</h5>
					<form-game-new-build
						type="downloadable"
						:game="game"
						:package="package"
						:release="model"
						@submit="onBuildAdded"
					/>
				</div>
				<div class="col-sm-6">
					<br class="visible-xs" />
					<h5 class="sans-margin-top">
						<strong><translate>Upload Browser Build</translate></strong>
					</h5>
					<form-game-new-build
						v-if="!areWebBuildsLockedBySellable"
						type="browser"
						:game="game"
						:package="package"
						:release="model"
						:builds="builds"
						@submit="onBuildAdded"
					/>
					<div v-else class="alert">
						<translate>
							Browser builds can not currently be uploaded to games that are for sale.
						</translate>
					</div>
				</div>
			</div>
		</fieldset>

		<hr />

		<template v-if="model.status !== GameRelease.STATUS_PUBLISHED">
			<app-button
				primary
				solid
				v-if="isScheduling"
				:disabled="!valid || !builds.length"
				@click.prevent="saveDraft()"
			>
				<translate>Schedule release</translate>
			</app-button>
			<app-button
				primary
				solid
				v-else
				:disabled="!valid || !builds.length"
				@click.prevent="savePublished()"
			>
				<translate>Publish Release</translate>
			</app-button>

			<app-button
				v-if="!isScheduling"
				:disabled="!valid || !builds.length"
				@click.prevent="saveDraft()"
			>
				<translate>Save Draft</translate>
			</app-button>
		</template>
		<template v-else>
			<app-button primary solid :disabled="!valid || !builds.length" @click.prevent="save()">
				<translate>Save Release</translate>
			</app-button>
		</template>

		<div :class="{ 'pull-right': !Screen.isXs }">
			<br class="visible-xs" />

			<app-button
				trans
				v-if="model.status === GameRelease.STATUS_PUBLISHED"
				@click.prevent="unpublish()"
			>
				<translate>Unpublish Release</translate>
			</app-button>

			<app-button trans @click.prevent="remove()">
				<translate>Remove Release</translate>
			</app-button>
		</div>
	</app-form>
</template>

<style lang="stylus" scoped>
>>> .game-new-build-form .form-group
	margin-bottom: 0
</style>

<script lang="ts" src="./release" />
