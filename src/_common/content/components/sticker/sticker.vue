<script lang="ts" src="./sticker"></script>

<template>
	<div class="-sticker">
		<template v-if="sticker">
			<app-img-responsive class="content-image" :src="sticker.img_url" />
		</template>
		<template v-else-if="hasError">
			<translate>Error loading media item.</translate>
		</template>
		<template v-else>
			<app-loading />
		</template>
	</div>
</template>

<style lang="stylus" scoped>
.-sticker
	width: 64px
	height: 64px
</style>
