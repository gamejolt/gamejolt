# More Commands
For common tasks like running the frontend or building the desktop app we have predefined yarn scripts. These are documented below.

> We use [vitejs](https://vitejs.dev) under the hood.
>
> All of our predefined yarn scripts call it through the helper command `yarn vite`.
>
> This command parses all supported command line flags and arguments to customize how vite runs. These are documented in `scripts/build/vite-wrapper.ts`.

## Web
- `yarn dev` - Runs the web frontend targetting the production environment with HMR enabled. While running this the website will be accessible through https://development.gamejolt.com. Changes you make to the source code while using this command will update the website in real time. This may cause refreshes. If this is undesired, see `yarn build:dev`

- `yarn devd` - Same as `yarn dev` only targets the development environment.

## Desktop App - Running
- `yarn client:dev` - Similar to `yarn dev` only for serving the desktop app. This by itself will not launch the client. Use `yarn client` for that while this command is running.

- `yarn client:devd` - Same as `yarn client:dev` only targets the development environment.

- `yarn client` - Runs the client. Use this while running `yarn client:dev` or `yarn client:devd`.

  ### __Common issue with logging in (sorry)__
  To improve load time our code is split into sections. The most common sections are `app` which is most of the website/desktop  and `auth` which is the pages related to logging in / registering.

  When running the desktop app, if you are not logged in you will be redirected to the auth section. This bit will fail. You will either get redirected to a page that does not exist or the login page will open in your browser instead of in the client.

  Due to technical limitations we only support running one section at a time. If you are running the `app` section while not logged in, the client will attempt to redirect you to the `auth` section and fail.

  __The workaround:__

  Edit `package.json` file and change the `main` field to `https://development.gamejolt.com/login` and then run the client using the `auth` section. Then after logging in, close the client, revert the change to `package.json` back to `https://development.gamejolt.com/` and run the `app` section normally.

## Desktop App - Building
Run `yarn client:build` and then `yarn client:package` to produce a fully desktop app build.

- `yarn client:build` - Builds the desktop app in preparation of distribution. Use `--staging` to build a staging version of the desktop app. This enables some debug information and features that are useful to troubleshoot the desktop app release. After running this command the next step is to bundle it as an nwjs application using `yarn client:package`.

- `yarn client:package` - Bundles the desktop app as an nwjs application and restructures it as a joltron project. Use `--staging` to use the sdk variant of nwjs which enables devtools. Use `--push` to push the release to Game Jolt. This requires valid gjpush credentials.

## SSR
Run `yarn ssr:client` and `yarn ssr:server` and after both are done run `yarn ssr` to serve the SSR on http://development.gamejolt.com:3501

- `yarn ssr:client` - Builds the web while generating information needed to run SSR.

- `yarn ssr:server` - Builds the server bundle used as the entrypoint for serving SSR.

- `yarn ssr` - Serves the SSR build on http://development.gamejolt.com:3501. Disable javascript in the browser while hitting this.

## Misc
- `yarn build` - Builds the frontend repo to disk. Builds go to `/build/<platform>`, for example when building web, files will go to `/build/web`, and when building the desktop app they will go to `/build/desktop`.

- `yarn build:dev` - Similar to `yarn build` only for the purpose of serving this build locally instead of being deployed to a server (or further bundled into a complete desktop app build). This command runs the frontend without using a devserver. This means a smaller memory footprint but no HMR (no live reloads when you make changes in the code). Every time you make a change to the code the frontend will be fully rebuilt. See comments on `scripts/build-and-serve.ts` for more info.
  - __For `web` platform (the default):__ It'll run a tiny http server that serves the web frontend on https://development.gamejolt.com.
  - __For `desktop` platform:__ It'll build to disk. Use `yarn client` to run it. __Note:__ this builds ALL sections by default. This is very resource intensive. If this is undesired, you can pass in which section to build explicitly with `--section`.

- `yarn build:devd` - Same as `yarn build:dev` only targetting the development environment.

- `yarn gameserver:build:devd` - Same as `yarn build:devd` only builds and
  serves the gameserver. This only works against the development environment.

  * Note: you probably want to run this and `build:devd` with `--no-empty-outdir` so they don't overwrite each other.

- `yarn tsscript` - Utility script to execute other scripts that are written in typescript. You shouldn't need to use this directly.
