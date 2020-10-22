<script lang="ts" src="./static"></script>

<template>
	<div>
		<div v-if="!enabled" class="well fill-offset text-center">
			<div class="row">
				<div class="col-xs-8 col-centered">
					<p class="lead">
						<translate>
							Have a site already or want to create one from scratch? Upload a .zip
							file of your site's content and we'll host it for you!
						</translate>
					</p>

					<form-dash-site-build v-if="!site.build" :site="site" @submit="onBuildAdded" />

					<app-button
						v-else
						v-app-tooltip="
							enableTooltip
						"
						primary
						@click="activateBuild()"
					>
						<translate>Turn On</translate>
					</app-button>
				</div>
			</div>
		</div>
		<div v-else>
			<h2><translate>Upload a New Build</translate></h2>

			<form-dash-site-build :site="site" @submit="onBuildAdded" />
		</div>
	</div>
</template>
