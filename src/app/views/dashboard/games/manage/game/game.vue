<template>
	<div>
		<section class="alert alert-well sans-margin-bottom" v-if="game.status === Game.STATUS_HIDDEN">
			<div class="container">
				<div class="row">
					<div class="col-md-10 col-lg-8 col-centered" :class="{ 'text-center': Screen.isDesktop }">
						<translate>dash.games.hidden_message</translate>
						<template v-if="!game.published_on">
							<translate>dash.games.hidden_message_unpublished</translate>
						</template>
					</div>
				</div>
			</div>
		</section>

		<app-expand :when="$route.name === 'dash.games.manage.game.design'">
			<app-editable-overlay @click="showEditHeader()">
				<span slot="overlay">
					<translate v-if="!game.header_media_item">Upload Game Header</translate>
					<translate v-else>Change Header</translate>
				</span>

				<!--
				If no header yet, show their highlight color with a min-height.
			-->
				<div
					class="fill-highlight"
					:style="{
						'min-height': !game.header_media_item ? '200px' : '',
					}"
				>
					<app-media-item-cover
						v-if="game.header_media_item"
						:media-item="game.header_media_item"
					/>
				</div>
			</app-editable-overlay>
		</app-expand>

		<app-expand :when="$route.name === 'dash.games.manage.game.design'">
			<app-manage-game-media-bar :game="game" :media-items="media" />
		</app-expand>

		<div class="container" v-if="Screen.isMobile">
			<br />
			<app-nav-tab-list>
				<app-manage-game-nav />
			</app-nav-tab-list>
		</div>

		<section class="section">
			<div class="container">
				<div class="row">
					<div class="col-md-2" v-if="Screen.isDesktop">
						<nav class="platform-list">
							<app-manage-game-nav />
						</nav>
					</div>
					<div class="col-xs-12 col-md-10">
						<router-view />
					</div>
				</div>
			</div>
		</section>
	</div>
</template>

<script lang="ts" src="./game"></script>
