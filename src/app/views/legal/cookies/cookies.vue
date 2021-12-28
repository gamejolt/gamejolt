<script lang="ts" src="./cookies"></script>

<template>
	<div>
		<!-- eslint-disable-next-line vue/no-v-html -->
		<div v-html="template" />

		<h3>Common ID Cookie</h3>
		<p>
			This site uses cookies and similar tracking technologies such as the Common ID cookie to
			provide its services. Cookies are important devices for measuring advertising
			effectiveness and ensuring a robust online advertising industry. The Common ID cookie
			stores a unique user id in the first party domain and is accessible to our ad partners.
			This simple ID that can be utilized to improve user matching, especially for delivering
			ads to iOS and MacOS browsers. Users can opt out of the Common ID tracking cookie by
			clicking
			<a href="#opt-out" @click="playwireOptOut">here</a>
			.
		</p>
	</div>
</template>
