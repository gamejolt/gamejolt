<script lang="ts" src="./users"></script>

<template>
	<section class="section">
		<div v-if="hasSearch" class="container">
			<div class="row">
				<div
					v-for="user of searchPayload.users"
					:key="user.id"
					class="-item col-sm-6 col-md-4 col-lg-3"
				>
					<app-user-card :user="user" elevate />
				</div>
			</div>
		</div>
	</section>
</template>
