<script lang="ts" src="./mods"></script>

<template>
	<div class="row">
		<div class="col-md-10 col-lg-8">
			<!-- eslint-disable-next-line vue/no-v-html -->
			<div class="-content" v-html="content" />
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.-content >>>
	h1
		margin-top: 0

	img
		img-responsive()
		rounded-corners-lg()
</style>
