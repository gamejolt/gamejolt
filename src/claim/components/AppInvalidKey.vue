<script lang="ts" setup>
import { $gettext } from '../../_common/translate/translate.service';
</script>

<template>
	<section class="container">
		<h1 class="section-header">
			{{ $gettext(`Invalid Key`) }}
		</h1>

		<p>
			<strong>
				{{ $gettext(`I'm sorry but that key isn't recognized.`) }}
			</strong>
		</p>

		<p>
			{{
				$gettext(
					`It could be invalid, incorrectly entered, or already claimed. Please check that you entered it correctly.`
				)
			}}
		</p>
	</section>
</template>
