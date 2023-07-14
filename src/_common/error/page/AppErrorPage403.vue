<script lang="ts" setup>
import { $gettext } from '../../translate/translate.service';
</script>

<template>
	<div>
		<h1>{{ $gettext(`Forbidden`) }}`</h1>
		<p>{{ $gettext(`You do not have access to this page.`) }}`</p>
	</div>
</template>
