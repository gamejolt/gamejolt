<template>
	<div class="container">
		<div class="content">
			<div class="title">
				<h1>
					Game Jolt WePlay
					<span>
						<app-jolticon icon="info-circle" highlight />
					</span>
				</h1>
				<div class="help-block">
					Some cool information about Game Jolt WePlay right here.
				</div>
			</div>

			<iframe
				class="twitch-player"
				src="https://player.twitch.tv/?channel=nathanauckett"
				frameborder="0"
				allowfullscreen="true"
				scrolling="no"
			></iframe>

			<div class="controls">
				<table class="control-table">
					<tr>
						<td colspan="3">
							<app-button
								circle
								icon="chevron-up"
								:disabled="isDisabled"
								@click="onClickKey('up')"
							/>
						</td>
					</tr>
					<tr>
						<td>
							<app-button
								circle
								icon="chevron-left"
								:disabled="isDisabled"
								@click="onClickKey('left')"
							/>
						</td>
						<td>
							<app-button
								circle
								icon="chevron-down"
								:disabled="isDisabled"
								@click="onClickKey('down')"
							/>
						</td>
						<td>
							<app-button
								circle
								icon="chevron-right"
								:disabled="isDisabled"
								@click="onClickKey('right')"
							/>
						</td>
					</tr>
				</table>

				<table class="control-table">
					<tr>
						<td />
						<td>
							<app-button
								:disabled="isDisabled"
								@click="onClickKey('a')"
								v-app-tooltip="$gettext('Jump')"
							>
								A
							</app-button>
						</td>
					</tr>
					<tr>
						<td>
							<app-button
								:disabled="isDisabled"
								@click="onClickKey('b')"
								v-app-tooltip="$gettext('Attack')"
							>
								B
							</app-button>
						</td>
					</tr>
				</table>
			</div>

			<span class="help-block">
				<template v-if="!app.user">
					<router-link :to="{ name: 'auth.login' }">
						Log in
					</router-link>
					to play.
				</template>
				<template v-else-if="isDisabled">
					You regain control in {{ timeoutFormatted }}s
				</template>
				<template v-else>
					<translate>You can use your input!</translate>
				</template>
			</span>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'

.content
	display: flex
	align-items: center
	flex-direction: column

.twitch-player
	width: 100%
	min-height: 600px
	max-height: 800px

.controls
	margin-top: 20px
	margin-bottom: 10px
	display: flex
	max-width: 300px
	width: 100%
	justify-content: space-between

.control-table
	& > tr > td
		padding: 4px
		text-align: center
</style>

<script lang="ts" src="./weplay" />
