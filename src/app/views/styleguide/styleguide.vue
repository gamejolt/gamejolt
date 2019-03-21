<template>
	<div class="container">
		<div class="row">
			<div class="col-sm-3 col-sm-push-9 col-lg-2 col-lg-push-10">
				<br />
				<br />
				<app-scroll-affix>
					<nav class="platform-list">
						<ul>
							<li>
								<a href="#styleguide-button" v-app-scroll-to>
									Buttons
								</a>
							</li>
							<li>
								<a href="#styleguide-list-group" v-app-scroll-to>
									List Groups
								</a>
							</li>
							<li>
								<a href="#styleguide-progress-bar" v-app-scroll-to>
									Progress Bars
								</a>
							</li>
							<li>
								<a href="#styleguide-jolticons" v-app-scroll-to>
									Jolticons
								</a>
							</li>
						</ul>
					</nav>
				</app-scroll-affix>
			</div>
			<div class="col-sm-9 col-sm-pull-3 col-lg-10 col-lg-pull-2">
				<app-button-styleguide />
				<app-list-group-styleguide />
				<app-progress-bar-styleguide />
				<app-jolticons-styleguide />
			</div>
		</div>
	</div>
</template>

<script lang="ts" src="./styleguide" />
