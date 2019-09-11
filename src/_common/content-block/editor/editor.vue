<template>
	<div class="content-block-editor">
		<div class="container">
			<div class="row">
				<div class="col-xs-9">
					<p>
						<strong>
							<translate>Insert Widgets</translate>
						</strong>
						<span class="text-muted small">
							<translate>embed dynamic content</translate>
						</span>
					</p>

					<template v-if="!site.game_id">
						<app-button
							v-app-tooltip="$gettext('Will show your profile bio.')"
							@click="insertAtCaret('{% user-bio %}')"
						>
							<translate>User Bio</translate>
						</app-button>
						<app-button
							v-app-tooltip="$gettext('Will show a grid of all your games.')"
							@click="insertAtCaret('{% game-list %}')"
						>
							<translate>Game List</translate>
						</app-button>
						<app-button
							trans
							:href="Environment.helpBaseUrl + '/widgets-user-site'"
							target="_blank"
						>
							<translate>View all</translate>
						</app-button>
					</template>
					<template v-else>
						<app-button
							v-app-tooltip="$gettext('Will show your game\'s media (screenshots, videos, etc).')"
							@click="insertAtCaret('{% game-media num=6 %}')"
						>
							<translate>Game Media</translate>
						</app-button>
						<app-button
							v-app-tooltip="$gettext('Will show your game\'s description.')"
							@click="insertAtCaret('{% game-description %}')"
						>
							<translate>Game Description</translate>
						</app-button>
						<app-button
							v-app-tooltip="$gettext('Will show your game\'s packages.')"
							@click="insertAtCaret('{% game-packages %}')"
						>
							<translate>Game Packages</translate>
						</app-button>
						<app-button
							trans
							:href="Environment.helpBaseUrl + '/widgets-game-site'"
							target="_blank"
						>
							<translate>View all</translate>
						</app-button>
					</template>
				</div>
				<div class="col-xs-3">
					<app-loading
						v-if="isPreviewLoading"
						class="pull-right"
						:hide-label="true"
						:stationary="true"
					/>
				</div>
			</div>

			<!--
			The ng-repeat will refresh the DOM any time the current block changes.
			This will create a new editor instance and refresh the block content.
		-->
			<form-content-block-editor :mode="site.game_id ? 'game' : 'user'" :model="contentBlock" />
		</div>
	</div>
</template>

<script lang="ts" src="./editor"></script>
