<script lang="ts" src="./tumblr-blog-selector-modal"></script>

<template>
	<app-modal>
		<div class="modal-header">
			<h2 class="modal-title">
				{{ title }}
			</h2>
		</div>

		<div class="modal-body">
			<div class="full-bleed">
				<app-linked-account provider="tumblr" :account="account" :preview="true">
					<app-loading v-if="isLoading" />
					<div v-else>
						<div v-if="!hasBlogs">
							<small class="text-muted">
								<translate>
									You have no Tumblr blogs associated with your account.
								</translate>
							</small>
						</div>

						<div v-for="blog of blogs" :key="blog.name">
							<input
								:id="blog.name"
								type="radio"
								:value="blog.name"
								name="blogs"
								:checked="blog.name === selectedBlog.name"
								@change="changeSelected($event.target.value)"
							/>
							<label :for="blog.id">{{ blog.title }}</label>
							<small
								v-if="
									account.tumblrSelectedBlog &&
									blog.name === account.tumblrSelectedBlog.name
								"
								class="text-muted"
							>
								<translate>Currently Linked</translate>
							</small>
						</div>
					</div>
				</app-linked-account>
			</div>
		</div>

		<div class="modal-footer">
			<app-button primary solid :disabled="!canConfirm" @click="ok">
				<translate>OK</translate>
			</app-button>
			<app-button trans @click="cancel">
				<translate>Cancel</translate>
			</app-button>
		</div>
	</app-modal>
</template>
