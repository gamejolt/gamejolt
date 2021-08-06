<script lang="ts" src="./communities"></script>

<template>
	<section class="section">
		<div v-if="hasSearch" class="container">
			<div class="row">
				<div
					v-for="community of searchPayload.communities"
					:key="community.id"
					class="col-sm-6 col-md-4 col-lg-3 anim-fade-in"
				>
					<app-community-card :community="community" track-goto elevate />
				</div>
			</div>
		</div>
	</section>
</template>
