<script lang="ts" src="./img"></script>

<template>
	<span class="user-avatar-img">
		<img
			v-if="user && !hasError"
			:src="user.img_avatar"
			class="img-responsive"
			alt=""
			@error="hasError = true"
		/>
		<img v-else :src="require('../guest.png')" class="img-responsive" alt="" />
	</span>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.user-avatar-img
	display: block
	position: relative

	img
		img-responsive()
		img-circle()
</style>
