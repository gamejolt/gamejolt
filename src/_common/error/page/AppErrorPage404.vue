<script lang="ts" setup>
import { $gettext } from '../../translate/translate.service';
</script>

<template>
	<div>
		<h1>{{ $gettext(`Page Not Found`) }}</h1>
		<p>
			{{
				$gettext(
					`You found a secret! But on further inspection, you realize it's just an empty page.`
				)
			}}
		</p>
	</div>
</template>
