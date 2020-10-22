<script lang="ts" src="./template"></script>

<template>
	<div>
		<div v-if="!enabled" class="well fill-offset text-center">
			<div class="row">
				<div class="col-xs-8 col-centered">
					<p class="lead">
						<translate>
							Use one of our pre-built templates and customize it to your style.
						</translate>
					</p>

					<app-button v-app-tooltip="enableTooltip" primary @click="enable()">
						<translate>Turn On</translate>
					</app-button>
				</div>
			</div>
		</div>
		<div v-else>
			<div class="alert alert-notice visible-xs full-bleed-xs">
				<p>
					<translate>
						The site editor doesn't work on mobile devices at this time.
					</translate>
				</p>
			</div>

			<div class="hidden-xs">
				<app-button :href="themeEditorLocation" target="_blank">
					<translate>Customize Theme</translate>
				</app-button>

				<app-button :href="contentEditorLocation" target="_blank">
					<translate>Edit Content</translate>
				</app-button>
			</div>

			<h2>
				<translate>Settings</translate>
			</h2>

			<form-site-settings :model="site" @submit="onSettingsSaved" />
		</div>
	</div>
</template>
