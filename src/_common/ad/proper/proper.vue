<template>
	<app-scroll-inview margin="1000px" @inview="inview()" @outview="outview()">
		<div class="proper-ad-unit" v-if="tagId">
			<div :id="`proper-ad-${tagId}`" />
		</div>
	</app-scroll-inview>
</template>

<script lang="ts" src="./proper"></script>
