<template>
	<div class="game-cover-credits" v-if="coverGame">
		<div class="-flow-col">
			<router-link class="-title link-unstyled" :to="coverGame.getUrl()">
				{{ coverGame.title }}
			</router-link>
			<router-link class="-dev link-muted" :to="coverGame.developer.url">
				by
				<strong>
					{{ coverGame.developer.display_name }}
				</strong>
			</router-link>
			<span class="-followers text-muted">{{ coverGame.follower_count }} followers</span>
		</div>
		<router-link class="-img" :to="coverGame.getUrl()">
			<app-game-thumbnail-img :game="coverGame" />
		</router-link>
	</div>
</template>

<style lang="stylus" scoped>
.game-cover-credits
	display: flex
	width: fit-content
	padding: 5px
	margin: 20px
	background: #262b2b
	border-radius: 8px
	text-align: right

.-title:hover
	text-decoration: underline !important

.-img
	width: 145px
	margin-left: 10px
	border-radius: 8px
	transition: 0.25s

.-img:hover
		box-shadow: 0px 0px 3px var(--theme-bi-bg) !important

.-flow-col
	display: flex
	flex-flow: column
	align-content: start

.-title
	font-weight: 700
	margin: 3px

.-dev
	font-size: 13px
	margin-left: 3px

.-followers
	font-size: 13px
	margin: 3px

a:hover
	border-bottom: none !important

</style>

<script lang="ts" src="./game-cover-credits"></script>
