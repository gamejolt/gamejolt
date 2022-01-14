<script lang="ts" src="./notifications"></script>

<template>
	<section class="section">
		<div class="container">
			<div class="row">
				<div class="col-sm-9 col-md-8 col-lg-7 col-centered">
					<template v-if="!feed || !feed.isBootstrapped">
						<app-shell-notification-popover-sticker-nav-item-placeholder />
						<app-activity-feed-placeholder />
					</template>
					<template v-else>
						<template v-if="!feed.hasItems">
							<template v-if="shouldShowStickerPlaceholder">
								<app-shell-notification-popover-sticker-nav-item-placeholder />
							</template>
							<app-shell-notification-popover-sticker-nav-item
								v-else-if="shouldShowStickers"
								:sticker-count="totalStickersCount"
								:has-new="hasNewUnlockedStickers"
							/>

							<div class="alert full-bleed-xs">
								<translate>You don't have any notifications yet.</translate>
							</div>
						</template>
						<template v-else>
							<p class="text-right">
								<a
									class="link-muted small"
									@click="store.markNotificationsAsRead()"
								>
									<translate>Mark All as Read</translate>
								</a>
							</p>

							<template v-if="shouldShowStickerPlaceholder">
								<app-shell-notification-popover-sticker-nav-item-placeholder />
							</template>
							<app-shell-notification-popover-sticker-nav-item
								v-else-if="shouldShowStickers"
								:sticker-count="totalStickersCount"
								:has-new="hasNewUnlockedStickers"
							/>

							<app-activity-feed :feed="feed" @load-new="onLoadedNew" />
						</template>
					</template>
				</div>
			</div>
		</div>
	</section>
</template>
