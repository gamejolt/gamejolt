<template>
	<app-loading :label="$gettext('Just one moment...')" centered big v-if="isRouteLoading" />
	<div class="anim-fade-in-up" v-else>
		<template v-if="isSuccess">
			<h2 class="section-header">
				<translate>auth.authorize.success_growl_title</translate>
			</h2>
			<div>
				<translate>auth.authorize.success_growl</translate>
			</div>
		</template>
		<template v-else>
			<h2 class="section-header">
				<translate>auth.authorize.invalid.heading</translate>
			</h2>
			<div>
				<p><translate>Your authorization code is invalid.</translate></p>
				<p>
					<translate>
						Please make sure to copy and paste the full URL that we emailed you.
					</translate>
				</p>
			</div>
		</template>
	</div>
</template>

<script lang="ts" src="./authorize"></script>
