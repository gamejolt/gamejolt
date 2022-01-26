<script lang="ts">
import { setup } from 'vue-class-component';
import { Options } from 'vue-property-decorator';
import { imageGameJoltLogo } from '../../../app/img/images';
import { redirectToDashboard } from '../../../_common/auth/auth.service';
import { Connection } from '../../../_common/connection/connection-service';
import { Environment } from '../../../_common/environment/environment.service';
import { BaseRouteComponent } from '../../../_common/route/route-component';
import { Screen } from '../../../_common/screen/screen-service';
import { commonStore } from '../../../_common/store/common-store';
import AppThemeSvg from '../../../_common/theme/svg/AppThemeSvg.vue';
import AppTranslateLangSelector from '../../../_common/translate/lang-selector/lang-selector.vue';
import AppCoverImg from '../../components/AppCoverImg.vue';
import AppGameCoverCredits from '../../components/game-cover-credits/game-cover-credits.vue';
import { authStore, useAuthStore } from '../../store/index';
import './auth-content.styl';

export function loggedUserBlock() {
	// Redirect right away if they are logged in.
	if (commonStore.user.value) {
		redirectToDashboard();

		// Never resolve.
		return new Promise(() => {});
	}
}

@Options({
	name: 'RouteAuth',
	components: {
		AppCoverImg,
		AppTranslateLangSelector,
		AppThemeSvg,
		AppGameCoverCredits,
	},
	async beforeRouteEnter(_to, _from) {
		await authStore.bootstrap();
	},
})
export default class RouteAuth extends BaseRouteComponent {
	store = setup(() => useAuthStore());

	get shouldShowCoverImage() {
		return this.store.shouldShowCoverImage;
	}

	get coverMediaItem() {
		return this.store.coverMediaItem;
	}

	get coverGame() {
		return this.store.coverGame;
	}

	readonly Environment = Environment;
	readonly Connection = Connection;
	readonly Screen = Screen;
	readonly imageGameJoltLogo = imageGameJoltLogo;
}
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
				<a
					:href="
						!GJ_IS_DESKTOP_APP
							? Environment.baseUrl + '/'
							: Environment.authBaseUrl + '/login'
					"
				>
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

					<router-view />
				</div>
			</div>

			<div
				v-if="!GJ_IS_DESKTOP_APP && shouldShowCoverImage && Screen.isDesktop"
				class="-game-credits anim-fade-in-up"
			>
				<AppGameCoverCredits :game="coverGame" />
			</div>

			<div class="auth-shell-bottom-links">
				<a
					class="link-unstyled anim-fade-in stagger"
					:href="Environment.baseUrl + '/terms'"
					target="_blank"
				>
					<AppTranslate>auth.legal.terms</AppTranslate>
				</a>
				<a
					class="link-unstyled anim-fade-in stagger"
					:href="Environment.baseUrl + '/privacy'"
					target="_blank"
				>
					<AppTranslate>auth.legal.privacy</AppTranslate>
				</a>
				<a
					v-if="!GJ_IS_DESKTOP_APP"
					class="link-unstyled anim-fade-in stagger"
					:href="Environment.baseUrl + '/cookies'"
					target="_blank"
				>
					<AppTranslate>Cookie Policy</AppTranslate>
				</a>

				<AppTranslateLangSelector />
			</div>
		</div>
	</div>
</template>

<style lang="stylus" src="./auth.styl" scoped></style>
