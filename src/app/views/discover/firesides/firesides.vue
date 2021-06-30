<script lang="ts" src="./firesides"></script>

<template>
	<section class="section fill-backdrop -section">
		<div
			v-if="shouldShowBackgroundImage"
			class="-fireside-background"
			:style="{
				'background-image': `url('` + backgroundImageUrl + ` ')`,
			}"
		/>
		<app-page-container xl no-left no-right class="-container">
			<template #default>
				<h1 class="sans-margin-top">
					<div class="text-center">
						<translate>Discover Firesides</translate>
						<br />
						<small>
							<translate>Hang out with people in temporary pop-up chats</translate>
						</small>
					</div>
					<app-illustration src="~img/ill/end-of-feed.svg" />
				</h1>

				<app-loading-fade :is-loading="isLoading">
					<h2 class="sans-margin-top">
						<translate>Your Fireside</translate>
						<small v-if="user" class="pull-right">
							<a class="link-unstyled" @click="onClickRefresh">
								<translate>Refresh</translate>
							</a>
						</small>
					</h2>
					<app-fireside-badge
						v-if="userFireside"
						:fireside="userFireside"
						@expire="onFiresideExpired()"
					/>
					<app-fireside-badge-add v-else />

					<template v-if="popularFiresides.length">
						<h2 class="sans-margin-top">
							<translate>Popular Firesides</translate>
						</h2>
						<app-fireside-badge
							v-for="fireside of popularFiresides"
							:key="fireside.id"
							:fireside="fireside"
							@expire="onFiresideExpired()"
						/>
					</template>

					<template v-if="followedFiresides.length">
						<h2 class="sans-margin-top">
							<translate>Recommended Firesides</translate>
						</h2>
						<app-fireside-badge
							v-for="fireside of followedFiresides"
							:key="fireside.id"
							:fireside="fireside"
							@expire="onFiresideExpired()"
						/>
					</template>
				</app-loading-fade>
			</template>
		</app-page-container>
	</section>
</template>

<style lang="stylus" scoped>
.-section
	position: relative

.-fireside-background
	position: absolute
	left: 0
	right: 0
	top: 20px
	height: 100%
	max-height: 500px
	z-index: 0
	mask: radial-gradient(rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.2) 20%, transparent 60%)
	background-size: 100% auto
	background-repeat: no-repeat
	background-position: center center
	opacity: 0
	animation-name: fade-in
	animation-duration: 4s
	animation-iteration-count: 1
	animation-fill-mode: forwards

@keyframes fade-in
	0%
		opacity: 0
		filter: grayscale(0.5)

	100%
		opacity: 1
		filter: none

.-container
	position: relative
	z-index: 1
</style>
