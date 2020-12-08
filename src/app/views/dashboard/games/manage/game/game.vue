<script lang="ts" src="./game"></script>

<template>
	<div>
		<app-expand :when="$route.name === 'dash.games.manage.game.design'">
			<app-editable-overlay @click="showEditHeader()">
				<template #overlay>
					<span>
						<translate v-if="!game.header_media_item">Upload Game Header</translate>
						<translate v-else>Change Header</translate>
					</span>
				</template>

				<!-- If no header yet, show their highlight color with a min-height. -->
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

		<div v-if="Screen.isMobile" class="container">
			<br />
			<app-nav-tab-list>
				<app-manage-game-nav />
			</app-nav-tab-list>
		</div>

		<section class="section">
			<div class="container">
				<div class="row">
					<div v-if="Screen.isDesktop" class="col-md-2">
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
