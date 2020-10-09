<script lang="ts" src="./notifications"></script>

<template>
	<section class="section">
		<div class="container">
			<div class="row">
				<div class="col-sm-9 col-md-8 col-lg-7 col-centered">
					<app-activity-feed-placeholder v-if="!feed || !feed.isBootstrapped" />
					<template v-else>
						<div v-if="!feed.hasItems" class="alert full-bleed-xs">
							<translate>You don't have any notifications yet.</translate>
						</div>
						<template v-else>
							<p class="text-right">
								<a class="link-muted small" @click="markNotificationsAsRead()">
									<translate>Mark All as Read</translate>
								</a>
							</p>

							<app-activity-feed :feed="feed" @load-new="onLoadedNew" />
						</template>
					</template>
				</div>
			</div>
		</div>
	</section>
</template>
