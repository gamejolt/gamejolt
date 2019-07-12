<template>
	<div class="row">
		<div class="col-md-9">
			<h2 class="section-header">
				<translate>Tags</translate>
			</h2>

			<div class="page-help">
				<p>
					<translate>
						Tags are used to group up posts by topic. They show on the left of the community page,
						and users can click them to filter which posts they see.
					</translate>
				</p>
				<p>
					<translate>
						Choosing good tags can help direct the conversation to the topics the community is
						about.
					</translate>
				</p>
			</div>

			<form-community-tag :community="community" @submit="onTagAdded" :tags="tags" />

			<ul class="-tag-list">
				<draggable v-model="tags" @change="saveSort">
					<li v-for="tag in tags" :key="tag.id">
						<a class="tag">
							<app-jolticon icon="tag" class="text-muted" />
							{{ tag.tag }}

							<a @click.stop="onTagRemove(tag)">
								<app-jolticon icon="remove" v-app-tooltip="$gettext(`Remove Tag`)" />
							</a>
						</a>
					</li>
				</draggable>
			</ul>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'

.-tag-list
	list-style: none
	padding-left: 0

	li
		margin-bottom: 10px

	.tag
		border-radius: 10px
		font-weight: normal
		cursor: move !important
		font-size: $font-size-base
		padding: 6px
</style>

<script lang="ts" src="./tags"></script>
