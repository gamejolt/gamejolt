<script lang="ts" src="./auth"></script>

<template>
	<div
		id="auth-container"
		:class="{
			'has-cover-img': shouldShowCoverImage && coverMediaItem,
		}"
	>
		<transition>
			<app-cover-img
				v-if="shouldShowCoverImage && coverMediaItem"
				class="anim-fade-leave"
				:img-url="coverMediaItem.img_url"
			/>
		</transition>

		<div class="auth-scroll-container">
			<div class="auth-logo text-center anim-fade-in-enlarge stagger">
				<a
					:href="
						!GJ_IS_CLIENT
							? Environment.baseUrl + '/'
							: Environment.authBaseUrl + '/login'
					"
				>
					<app-theme-svg
						src="~img/game-jolt-logo.svg"
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
							<app-jolticon icon="offline" />
							<translate>
								We're having trouble connecting to Game Jolt. Please check your
								connection to the Internet.
							</translate>
						</p>
					</div>

					<router-view />
				</div>
			</div>

			<div
				v-if="!GJ_IS_CLIENT && shouldShowCoverImage && Screen.isDesktop"
				class="-game-credits anim-fade-in-up"
			>
				<app-game-cover-credits :game="coverGame" />
			</div>

			<div class="auth-shell-bottom-links">
				<a
					class="link-unstyled anim-fade-in stagger"
					:href="Environment.baseUrl + '/terms'"
					target="_blank"
				>
					<translate>auth.legal.terms</translate>
				</a>
				<a
					class="link-unstyled anim-fade-in stagger"
					:href="Environment.baseUrl + '/privacy'"
					target="_blank"
				>
					<translate>auth.legal.privacy</translate>
				</a>
				<a
					v-if="!GJ_IS_CLIENT"
					class="link-unstyled anim-fade-in stagger"
					:href="Environment.baseUrl + '/cookies'"
					target="_blank"
				>
					<translate>Cookie Policy</translate>
				</a>

				<app-translate-lang-selector />
			</div>
		</div>
	</div>
</template>

<style lang="stylus" src="./auth.styl" scoped></style>
