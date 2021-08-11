<script lang="ts" src="./overview"></script>

<template>
	<section class="section">
		<div class="container">
			<app-forum-rules />

			<div v-for="category of categories" :key="category.id">
				<div class="forum-section-header">
					<h2 :id="`category-${category.url}`" class="sans-margin">
						{{ category.title }}
					</h2>
				</div>

				<app-forum-channel-list
					:category="category"
					:channels="groupedChannels[category.id]"
					:latest-posts="latestPosts"
					:post-count-per-page="postCountPerPage"
				/>
			</div>
		</div>
	</section>
</template>
