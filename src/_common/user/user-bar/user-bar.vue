<script lang="ts">
import { Options, Prop, Vue } from 'vue-property-decorator';
import { Environment } from '../../environment/environment.service';
import AppUserAvatarImg from '../user-avatar/AppUserAvatarImg.vue';
import { User } from '../user.model';

@Options({
	components: {
		AppUserAvatarImg,
	},
})
export default class AppUserBar extends Vue {
	@Prop(Object) user!: User;
	@Prop(String) site!: string;
	@Prop(Boolean) hideSiteSelector?: boolean;

	get userLink() {
		// User link on fireside goes to their fireside profile if they are an
		// approved author.
		if (this.site === 'fireside' && this.user && this.user.can_manage) {
			return '/@' + this.user.username;
		}

		return Environment.baseUrl + '/dashboard';
	}
}
</script>

<template>
	<div class="container">
		<nav class="user-bar navbar">
			<div class="navbar-center">
				<div class="links">
					<slot />
				</div>
			</div>

			<div class="navbar-right" v-if="user">
				<ul class="navbar-items">
					<li>
						<a class="user-bar-user" :href="userLink">
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

	&-user
		padding-top: 10px !important
		padding-bottom: 10px !important

	&-avatar
		display: inline-block !important
		width: $avatar-size
		height: $avatar-size
		vertical-align: middle

	&-username
		display: inline-block
		margin-left: 10px

		@media $media-mobile
			display: none

	.button
		margin-top: 7px // Blah, stupid hardcoded
</style>
