<template>
	<app-tag-suggestion :tags="tags" :text="''" :content="content" @tag="emitTag($event)">
		<p class="help-block">
			<small>
				<translate>
					Tag your post to increase its visibility. You can also add your own tags if none of the
					below apply by putting a #hashtag in the text.
				</translate>
			</small>
		</p>
	</app-tag-suggestion>
</template>

<script lang="ts" src="./tags"></script>
