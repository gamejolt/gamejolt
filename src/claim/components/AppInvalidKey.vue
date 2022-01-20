<script lang="ts" setup>
import AppTranslate from '../../_common/translate/AppTranslate.vue';
</script>

<template>
	<section class="container">
		<h1 class="section-header">
			<AppTranslate>Invalid Key</AppTranslate>
		</h1>

		<p>
			<strong>
				<AppTranslate>I'm sorry but that key isn't recognized.</AppTranslate>
			</strong>
		</p>

		<p>
			<AppTranslate>
				It could be invalid, incorrectly entered, or already claimed. Please check that you
				entered it correctly.
			</AppTranslate>
		</p>
	</section>
</template>
