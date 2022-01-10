<script lang="ts" src="./autocomplete"></script>

<template>
	<div ref="container" :style="styling" class="-container">
		<transition name="fade">
			<div v-if="visible" ref="list" class="-autocomplete">
				<app-loading
					v-if="isLoading && isInverted"
					class="-loading-top"
					centered
					hide-label
				/>

				<template v-if="users.length">
					<button
						v-for="user of displayUsers"
						:key="user.id"
						class="-suggestion"
						:class="{ '-suggestion-selected': isSelected(user.id) }"
						@click.prevent="insertUser(user)"
					>
						<div v-if="user.is_following" class="-follow-indicator">
							<small class="text-muted">
								<app-jolticon icon="user" />
								<translate v-if="user.follows_you">You follow each other</translate>
								<translate v-else>Following</translate>
							</small>
						</div>
						<div class="-user">
							<app-user-avatar-img class="-avatar" :user="user" />
							<div class="-names">
								<div class="-name-row">
									<strong>{{ user.display_name }}</strong>
									<app-user-verified-tick :user="user" />
								</div>
								<div>
									<small>@{{ user.username }}</small>
								</div>
							</div>
						</div>
					</button>
				</template>

				<app-loading
					v-if="isLoading && !isInverted"
					class="-loading-bottom"
					centered
					hide-label
				/>
			</div>
		</transition>
	</div>
</template>

<style lang="stylus" scoped>
.fade-enter-active
.fade-leave-active
	transition: opacity 0.1s

.fade-enter-from
.fade-leave-to
	opacity: 0

.-container
	position: absolute
	z-index: $zindex-content-editor
	rounded-corners-lg()
	overflow: hidden
	elevate-2()

.-autocomplete
	change-bg('bg')
	overflow-y: auto
	width: 300px
	max-height: 500px // We don't want this to get out of control

	// On mobile, take up the full width
	@media $media-xs
		width: 100vw

.-suggestion
	padding-bottom: 10px
	padding-top: 10px
	padding-left: 8px
	padding-right: 8px
	cursor: pointer
	transition: background-color 200ms $strong-ease-out
	// Override button styling
	display: block
	width: 100%
	outline: 0
	border: 0
	change-bg('bg')
	text-align: left

	@media $media-xs
		padding-bottom: 6px
		padding-top: 6px

	&:hover
		change-bg('bg-offset')

	&:not(:last-child)
		border-bottom-width: $border-width-small
		border-bottom-style: solid
		theme-prop('border-bottom-color', 'bg-subtle')

.-suggestion-selected
	change-bg('bg-offset')

.-follow-indicator
	margin-left: 24px
	margin-bottom: 4px

	& *
		vertical-align: middle

.-user
	display: flex
	align-items: center
	overflow-x: hidden

.-avatar
	width: 40px
	margin-right: 16px
	flex-shrink: 0

	@media $media-xs
		margin-right: 8px
		width: 24px

.-names
	@media $media-xs
		& > *
			display: inline-block

		& *
			vertical-align: middle

.-name-row
	text-overflow()

	&*
		vertical-align: middle

.-loading-top
	margin-top: 16px

	@media $media-xs
		margin-top: 8px

.-loading-bottom
	margin-top: 16px

	@media $media-xs
		margin-top: 8px
</style>
