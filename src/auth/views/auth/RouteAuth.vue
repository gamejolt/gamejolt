<script lang="ts">
import '~auth/views/auth/auth-content.styl';

import { RouterView } from 'vue-router';

import AppCoverImg from '~auth/components/AppCoverImg.vue';
import AppGameCoverCredits from '~auth/components/AppGameCoverCredits.vue';
import { useAuthStore } from '~auth/store/index';
import { Api } from '~common/api/api.service';
import { redirectToDashboard } from '~common/auth/auth.service';
import { Connection } from '~common/connection/connection-service';
import { AuthBaseUrl, BaseUrl } from '~common/environment/environment.service';
import AppJolticon from '~common/jolticon/AppJolticon.vue';
import { createAppRoute, defineAppRouteOptions } from '~common/route/route-component';
import { getScreen } from '~common/screen/screen-service';
import { getCommonStore } from '~common/store/common-store';
import AppThemeSvg from '~common/theme/svg/AppThemeSvg.vue';
import AppTranslate from '~common/translate/AppTranslate.vue';
import AppTranslateLangSelector from '~common/translate/lang-selector/AppTranslateLangSelector.vue';
import { imageGameJoltLogo } from '~img/images';

export function loggedUserBlock() {
	// Redirect right away if they are logged in.
	if (getCommonStore().user.value) {
		redirectToDashboard();

		// Never resolve.
		return new Promise(() => {});
	}
}

export default {
	...defineAppRouteOptions({
		reloadOn: 'never',
		resolver: () => Api.sendRequest('/web/auth/get-customized-page'),
	}),
};
</script>

<script lang="ts" setup>
const { bootstrap, shouldShowCoverImage, coverMediaItem } = useAuthStore();

createAppRoute({
	onResolved({ payload }) {
		bootstrap(payload);
	},
});
</script>

<template>
	<div
		id="auth-container"
		:class="{
			'has-cover-img': shouldShowCoverImage && coverMediaItem,
		}"
	>
		<transition>
			<AppCoverImg
				v-if="shouldShowCoverImage && coverMediaItem"
				class="anim-fade-leave"
				:img-url="coverMediaItem.img_url"
			/>
		</transition>

		<div class="auth-scroll-container">
			<div class="auth-logo text-center anim-fade-in-enlarge stagger">
				<a :href="!GJ_IS_DESKTOP_APP ? BaseUrl + '/' : AuthBaseUrl + '/login'">
					<AppThemeSvg
						:src="imageGameJoltLogo"
						width="328"
						height="36"
						alt=""
						strict-colors
					/>
				</a>
			</div>

			<div class="container-fluid">
				<div class="auth-island">
					<div v-if="Connection.isClientOffline" class="alert alert-notice">
						<p>
							<AppJolticon icon="offline" />
							<AppTranslate>
								We're having trouble connecting to Game Jolt. Please check your
								connection to the Internet.
							</AppTranslate>
						</p>
					</div>

					<RouterView />
				</div>
			</div>

			<div
				v-if="!GJ_IS_DESKTOP_APP && shouldShowCoverImage && getScreen().isDesktop.value"
				class="-game-credits anim-fade-in-up"
			>
				<AppGameCoverCredits />
			</div>

			<div class="auth-shell-bottom-links">
				<a
					class="link-unstyled anim-fade-in stagger"
					:href="BaseUrl + '/terms'"
					target="_blank"
				>
					<AppTranslate>Terms</AppTranslate>
				</a>
				<a
					class="link-unstyled anim-fade-in stagger"
					:href="BaseUrl + '/privacy'"
					target="_blank"
				>
					<AppTranslate>Privacy</AppTranslate>
				</a>
				<a
					v-if="!GJ_IS_DESKTOP_APP"
					class="link-unstyled anim-fade-in stagger"
					:href="BaseUrl + '/cookies'"
					target="_blank"
				>
					<AppTranslate>Cookie Policy</AppTranslate>
				</a>

				<AppTranslateLangSelector />
			</div>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
#auth-container
	position: absolute
	top: 0
	right: 0
	bottom: 0
	left: 0

	&.has-cover-img
		text-shadow: 1px 1px 1px rgba($black, 0.3)

.auth-scroll-container
	scrollable()
	position: relative
	height: 100%
	z-index: $zindex-scroll-container

.auth-island
	position: relative
	z-index: $zindex-content
	margin: 0 auto
	max-width: 350px

	@media $media-sm-up
		margin-bottom: 20px

.auth-logo
	margin-top: 30px
	margin-bottom: 30px
	position: relative
	z-index: $zindex-content

	@media $media-sm-up
		margin-top: 100px

	a
		&
		&:hover
			border-bottom: 0 !important

	img
		margin: 0 auto

.auth-shell-bottom-links
	position: relative
	margin-top: $grid-gutter-width-xs
	margin-bottom: $grid-gutter-width-xs
	text-align: center
	z-index: $zindex-content

	@media $media-sm-up
		position: fixed
		bottom: 0
		left: 0
		margin-left: 20px
		margin-bottom: 20px
		text-align: left

	> a
		margin-right: 20px

.-game-credits
	position: fixed
	right: 20px
	bottom: 20px
</style>
