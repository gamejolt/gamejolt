<script lang="ts">
import { Options, Prop, Vue, Watch } from 'vue-property-decorator';
import { Scroll } from '../../../../_common/scroll/scroll.service';
import { UserModel } from '../../../../_common/user/user.model';

@Options({})
export default class AppUserBlockOverlay extends Vue {
	@Prop(Object)
	user!: UserModel;

	private hasBypassed = false;

	get shouldBlock() {
		return this.user && this.user.is_blocked && !this.hasBypassed;
	}

	@Watch('user', { immediate: true })
	onWatch(newUser: UserModel, oldUser?: UserModel) {
		if (!oldUser || newUser.id !== oldUser.id) {
			this.hasBypassed = false;
		}
	}

	proceed() {
		this.hasBypassed = true;
		Scroll.to(0, { animate: false });
	}
}
</script>

<template>
	<div v-if="user">
		<section v-if="shouldBlock" class="section fill-darker">
			<div class="container">
				<div class="row">
					<div class="col-sm-10 col-md-8 col-lg-6 col-centered">
						<div class="user-block">
							<AppJolticon class="jolticon-4x" icon="friend-remove-2" notice />

							<h4><AppTranslate>You blocked this user.</AppTranslate></h4>
							<p>
								<AppTranslate
									>Are you sure you want to view their profile?</AppTranslate
								>
							</p>
							<br />

							<p class="-buttons">
								<AppButton trans @click="proceed">
									<AppTranslate>Proceed to Profile</AppTranslate>
								</AppButton>
							</p>

							<br />
							<hr class="underbar underbar-center" />

							<p>
								<router-link
									class="link-muted"
									:to="{ name: 'dash.account.blocks' }"
								>
									<AppTranslate>Manage blocked users</AppTranslate>
								</router-link>
							</p>
						</div>
					</div>
				</div>
			</div>
		</section>
		<div v-else>
			<slot />
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.user-block
	text-align: center

	h4
		theme-prop('color', 'notice')

		@media $media-xs
			margin-top: 4px

	.-buttons button
		margin-bottom: 20px
</style>
