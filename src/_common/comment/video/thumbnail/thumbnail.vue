<template>
	<div class="comment-video-thumbnail">
		<a class="-thumb" @click="showModal()" v-app-track-event="`comment-video-thumbnail:click`">
			<div class="play-button-overlay play-button-overlay-small">
				<app-jolticon icon="play" />
			</div>

			<div class="inner">
				<app-jolticon icon="video" />

				<img
					class="img-responsive"
					:class="{
						loaded: isLoaded,
					}"
					:src="video.img_thumbnail"
					:alt="video.title"
					@load="onThumbLoaded"
				/>
			</div>
		</a>

		<div class="-meta">
			<div class="-avatar">
				<app-user-card-hover :user="user">
					<app-user-avatar :user="user" />
				</app-user-card-hover>
			</div>

			<router-link
				class="-user"
				:to="{ name: 'profile.overview', params: { username: user.username } }"
				:title="`${user.display_name} (@${user.username})`"
				v-app-track-event="`comment-video-thumbnail:user`"
			>
				{{ user.display_name }}
			</router-link>

			<a class="-title" @click="showModal()" v-app-track-event="`comment-video-thumbnail:title`">
				{{ video.title }}
			</a>
		</div>
	</div>
</template>

<style lang="stylus" src="./thumbnail.styl" scoped></style>

<script lang="ts" src="./thumbnail"></script>
