<script lang="ts" src="./content-viewer"></script>

<template>
	<div class="content-viewer" :class="viewerStyleClass">
		<app-scroll-inview @inview="onScrollInview" @outview="onScrollOutview">
			<app-content-viewer-base-component
				v-if="shouldShowContent"
				:content="data.content"
				:owner="owner"
			/>
		</app-scroll-inview>
	</div>
</template>

<style lang="stylus" scoped>
>>> p > code
	white-space: normal
</style>
