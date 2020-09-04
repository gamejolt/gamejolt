<script lang="ts" src="./user-online-status"></script>

<template>
	<div class="-status-container">
		<slot />
		<div
			class="user-online-status"
			:class="{ '-online': isOnline, '-offline': !isOnline }"
			:style="{ width: outerSize, height: outerSize }"
		>
			<div
				v-if="!isOnline"
				class="user-online-status-inner"
				:style="{ width: innerSize, height: innerSize }"
			/>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'

.-status-container
	position: relative

.user-online-status
	position: absolute
	right: -2px
	bottom: @right
	border: $border-width-large solid
	border-color: var(--theme-bg-actual)
	display: flex
	justify-content: center
	align-items: center

	&
	&-inner
		border-radius: 100%

	.active &
	.chat-user:hover &
		border-color: var(--theme-bg-subtle)

		// &-inner
		// background-color: var(--theme-bg-actual)
		&.-offline
			background-color: var(--theme-fg-muted)

	&-inner
		background-color: var(--theme-bg-actual)

	&.-online
		background-color: var(--theme-link)

	&.-offline
		background-color: var(--theme-bg-subtle)
</style>
