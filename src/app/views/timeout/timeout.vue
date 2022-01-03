<script lang="ts" src="./timeout"></script>

<template>
	<div class="-main fill-darker theme-dark">
		<div class="container">
			<div class="-content">
				<div class="-centered">
					<app-theme-svg
						:src="imageGameJoltLogo"
						alt="Game Jolt"
						:width="164 * logoScale"
						:height="18 * logoScale"
						strict-colors
					/>
				</div>
				<br />

				<template v-if="timeout && timeout.getIsActive()">
					<div class="-centered">
						<app-illustration :src="illTimeOut">
							<p>
								<translate>You've been put in time-out.</translate>
							</p>
						</app-illustration>

						<template v-if="!isExpired">
							<p class="text-center">
								<translate>
									You will be allowed back on Game Jolt again in:
								</translate>
								<strong>
									<app-time-ago
										:date="timeout.expires_on"
										strict
										is-future
										without-suffix
									/>
								</strong>
							</p>
						</template>
					</div>
					<br />

					<template v-if="reasonText">
						<h3 class="sans-margin-top">
							<translate>Reason</translate>
						</h3>

						<pre>{{ reasonText }}</pre>
					</template>

					<p>
						Please read the
						<app-link-help page="guidelines">Site Guidelines</app-link-help> for more
						information on what sort of content is allowed on Game Jolt as well as how
						to behave as a good Game Jolt Citizen.
					</p>
					<br />

					<template v-if="timeout.resource_content !== null">
						<div class="sheet sheet-elevate">
							<p>
								<translate>
									Being put in time-out was caused in part by the content below.
								</translate>
							</p>

							<pre>{{ timeout.resource_content }}</pre>

							<p>
								<translate>
									In order to be allowed back on Game Jolt, you have to delete the
									content in question.
								</translate>
							</p>

							<app-button solid @click="onClickClearResource">
								<translate>Delete Content</translate>
							</app-button>
						</div>
					</template>

					<p>
						If you would like to get in contact with us, please send an email to
						<app-contact-link email="contact@gamejolt.com">
							contact@gamejolt.com
						</app-contact-link>
					</p>
				</template>
				<template v-else>
					<p>You're no longer in time-out, yay!</p>
					<app-button @click="onClickLeave">Go To Game Jolt</app-button>
				</template>
			</div>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.-main
	display: flex
	align-items: center
	min-height: 100vh
	padding: 30px 0

.container
	position: relative
	display: flex
	justify-content: center
	max-width: 100%

.-content
	width: 100%
	max-width: 600px

.-centered
	display: flex
	align-items: center
	flex-direction: column
</style>
