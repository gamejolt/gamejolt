<script lang="ts" setup>
import AppButtonPlaceholder from '../../../../../_common/button/AppButtonPlaceholder.vue';
</script>

<template>
	<div class="-container">
		<div class="-item">
			<div class="-header">
				<div class="-header-content">
					<div class="-header-avatar" />

					<div class="-header-byline">
						<div class="-header-byline-name">
							<span class="-placeholder-text" style="width: 100px" />
						</div>
					</div>
				</div>
				<div class="-header-meta">
					<span class="-placeholder-small" style="width: 75px" />
				</div>
			</div>

			<div class="fireside-post-lead">
				<span class="-placeholder-text" />
				<span class="-placeholder-text" />
				<span class="-placeholder-text" style="width: 40%" />
			</div>

			<div class="-controls">
				<AppButtonPlaceholder sparse circle />
				{{ ' ' }}
				<AppButtonPlaceholder sparse circle />
			</div>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@import '../post/post'

// Gotta override the border hover styling of event items.
.-item
	&
	&:hover
		border-color: transparent
		cursor: default

.-placeholder-text
	lazy-placeholder-inline()

.-placeholder-small
	lazy-placeholder-inline()
	height: $font-size-small
</style>
