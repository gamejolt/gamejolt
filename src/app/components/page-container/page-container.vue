<template>
	<div
		:class="{
			container: !xl,
			'container-xl': xl,
			'-no-left': !hasLeftColumn,
			'-no-right': !hasRightColumn,
		}"
	>
		<div class="-row">
			<div v-if="hasLeftColumn" class="-left">
				<slot name="left" />
				<slot name="left-bottom" />
			</div>

			<div class="-main">
				<slot />
			</div>

			<div v-if="hasRightColumn" class="-right">
				<slot name="left" v-if="shouldCombineColumns" />
				<slot name="right" />
				<slot name="left-bottom" v-if="shouldCombineColumns" />
			</div>
		</div>
	</div>
</template>

<style lang="stylus" src="./page-container.styl" scoped></style>

<script lang="ts" src="./page-container"></script>
