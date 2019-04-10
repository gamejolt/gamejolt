<template>
	<app-tag-suggestion :tags="tags" :text="text" :content="content" @tag="emitTag($event)">
		<app-jolticon icon="tags" class="middle" />
		<strong>
			<translate>Game Tags</translate>
		</strong>

		<p class="help-block">
			<translate>
				Tag your game to increase its visibility. It's recommended to include at least one of the
				listed tags, although you can add your own by putting a #hashtag in your description.
			</translate>
		</p>
	</app-tag-suggestion>
</template>

<script lang="ts" src="./tags"></script>
