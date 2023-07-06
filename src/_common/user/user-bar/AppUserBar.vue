<script lang="ts" setup>
import { PropType } from 'vue';
import { Environment } from '../../environment/environment.service';
import AppUserAvatarImg from '../user-avatar/AppUserAvatarImg.vue';
import { User } from '../user.model';

defineProps({
	user: {
		type: Object as PropType<User | null | undefined>,
		required: true,
	},
});
</script>

<template>
	<div class="container">
		<nav class="user-bar navbar">
			<div class="navbar-center">
				<div class="links">
					<slot />
				</div>
			</div>

			<div v-if="user" class="navbar-right">
				<ul class="navbar-items">
					<li>
						<a class="user-bar-user" :href="Environment.baseUrl + '/dashboard'">
							<AppUserAvatarImg class="user-bar-avatar" :user="user" />

							<span class="user-bar-username">
								{{ user.username }}
							</span>
						</a>
					</li>
				</ul>
			</div>
		</nav>
	</div>
</template>

<style lang="stylus" scoped>
.user-bar
	$avatar-size = 30px

	@media $media-xs
		.container
			padding-left: 0
			padding-right: 0

.user-bar-user
	padding-top: 10px !important
	padding-bottom: 10px !important

.user-bar-avatar
	display: inline-block !important
	width: $avatar-size
	height: $avatar-size
	vertical-align: middle

.user-bar-username
	display: inline-block
	margin-left: 10px

	@media $media-mobile
		display: none

.button
	margin-top: 7px // Blah, stupid hardcoded
</style>
