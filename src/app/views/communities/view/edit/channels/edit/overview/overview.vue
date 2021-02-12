<script lang="ts" src="./overview"></script>

<template>
	<app-communities-view-page-container full>
		<div class="row">
			<div class="col-md-8 col-lg-7">
				<h2 class="section-header">
					<translate>Details</translate>
				</h2>

				<form-community-channel-edit
					:community="community"
					:model="channel"
					@submit="onSubmit"
				/>
			</div>
			<template v-if="canEditDescription">
				<div class="col-md-4 col-lg-push-1">
					<h2 :class="{ 'section-header': Screen.isDesktop }">
						<translate>Edit Description</translate>
					</h2>
					<form-community-channel-description :model="channel" />
				</div>
			</template>
		</div>
		<template v-if="shouldShowArchiveOptions">
			<section class="section">
				<div class="row">
					<div class="col-md-8 col-lg-7">
						<div class="well fill-offset">
							<template v-if="!channel.is_archived">
								<h4 class="section-header">
									<translate>Archive Channel</translate>
								</h4>

								<div class="page-help">
									<p>
										<translate>
											Archiving a channel will hide it from the community's
											channel list and sets it to read-only for all users. Any
											existing posts in the channel will remain there, and the
											channel can still be viewed.
										</translate>
									</p>
								</div>

								<app-button :disabled="!canArchive" @click="onClickArchive">
									<translate>Archive Channel</translate>
								</app-button>

								<p v-if="!canArchive" class="help-block sans-margin-bottom">
									<translate>
										The last public channel cannot be archived.
									</translate>
								</p>
							</template>

							<template v-else>
								<h4 class="sans-margin-top">
									<translate>Restore Channel</translate>
								</h4>

								<div class="page-help">
									<p>
										<translate>
											Restoring a channel will remove it from the archive and
											make it publicly visible again.
										</translate>
									</p>
								</div>

								<app-button @click="onClickUnarchive">
									<translate>Restore Channel</translate>
								</app-button>
							</template>
						</div>
					</div>
				</div>
			</section>
		</template>
	</app-communities-view-page-container>
</template>
