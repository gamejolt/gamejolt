<template>
	<div class="proper-ad-unit" v-if="tagId">
		<div :id="`proper-ad-${tagId}`" />
	</div>
</template>

<script lang="ts" src="./proper"></script>
