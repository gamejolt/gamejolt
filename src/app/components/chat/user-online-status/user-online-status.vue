<script lang="ts" src="./user-online-status"></script>

<template>
	<div class="-status-container">
		<slot />
		<div
			class="user-online-status"
			:class="{ '-online': isOnline, '-offline': !isOnline, '-absolute': absolute }"
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
.-status-container
	position: relative

.user-online-status
	border: $border-width-large solid
	border-color: var(--theme-bg-actual)
	display: flex
	justify-content: center
	align-items: center

	&
	&-inner
		border-radius: 100%

	&-inner
		background-color: var(--theme-bg-actual)

	&.-online
		background-color: var(--theme-link)

	&.-offline
		background-color: var(--theme-fg-muted)

	&.-absolute
		position: absolute
		right: -2px
		bottom: @right
</style>
