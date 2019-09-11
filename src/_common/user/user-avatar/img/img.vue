<template>
	<span class="user-avatar-img">
		<img
			key="user"
			v-if="user && !hasError"
			:src="user.img_avatar"
			class="img-responsive"
			alt=""
			@error="hasError = true"
		/>
		<img key="guest" v-else src="../guest.png" class="img-responsive" alt="" />
	</span>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

.user-avatar-img
	display: block
	position: relative

	img
		img-responsive()
		img-circle()
</style>

<script lang="ts" src="./img"></script>
