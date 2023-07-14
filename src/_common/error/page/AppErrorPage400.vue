<script lang="ts" setup>
import { $gettext } from '../../translate/translate.service';
</script>

<template>
	<div>
		<h1>{{ $gettext(`Bad Request`) }}</h1>
		<p>{{ $gettext(`There's been an error, and it's of the dubious sort.`) }}</p>
	</div>
</template>
