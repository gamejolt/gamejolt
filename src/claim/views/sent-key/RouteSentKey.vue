<script lang="ts" setup>
import { computed } from 'vue';
import { createAppRoute } from '../../../_common/route/route-component';
import { $gettext } from '../../../_common/translate/translate.service';

createAppRoute({
	routeTitle: computed(() => $gettext(`Keys Sent`)),
});
</script>

<template>
	<section class="container">
		<p class="lead text-center">
			{{ $gettext(`Awesome. We're sending you an email with your keys.`) }}
		</p>
		<p class="lead text-center">
			{{
				$gettext(`Note that it might take a few minutes. If you don't see it soon, check your spam
				folder or something, okay?`)
			}}
		</p>
	</section>
</template>
