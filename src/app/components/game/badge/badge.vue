<script lang="ts" src="./badge"></script>

<template>
	<app-theme :theme="game.theme">
		<div class="-game-container fill-darkest">
			<app-media-item-backdrop
				v-if="game.header_media_item"
				class="-backdrop"
				:media-item="game.header_media_item"
				radius="lg"
			>
				<div
					class="-header"
					:style="{
						'background-image': 'url(' + game.header_media_item.mediaserver_url + ')',
					}"
				>
					<div class="-header-gradient" />
				</div>
			</app-media-item-backdrop>

			<div class="-content">
				<router-link class="-link" :to="game.getUrl()" />

				<div class="-details">
					<div class="tag">
						<translate>Game</translate>
					</div>
					<div class="-name">
						{{ game.title }}
					</div>
				</div>

				<div class="-follow-button">
					<app-game-follow-widget :game="game" overlay hide-count />
				</div>
			</div>
		</div>
	</app-theme>
</template>

<style lang="stylus" scoped src="./badge.styl"></style>
