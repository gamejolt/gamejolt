<template>
	<div v-if="isRouteBootstrapped">
		<app-page-header>
			<h1>
				<translate>Add Topic</translate>
			</h1>

			<app-user-avatar slot="spotlight" :user="app.user" />

			<template slot="nav">
				<app-forum-breadcrumbs :channel="channel" sort="active" page="add-topic" />
			</template>
		</app-page-header>

		<div class="section">
			<div class="container">
				<div class="col-sm-10 col-md-8 col-lg-7 col-centered">
					<app-forum-rules />

					<form-forum-topic :channel="channel" @submit="onCreated" />
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts" src="./add" />
