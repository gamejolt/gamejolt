# Setup target NW.js version
export npm_config_target=0.19.0

# Setup build architecture, ia32 or x64
export npm_config_arch=x64
export npm_config_target_arch=x64

# Setup env for modules built with node-pre-gyp
export npm_config_runtime=node-webkit
export npm_config_build_from_source=true

# Setup nw-gyp as node-gyp
export npm_config_node_gyp=$(realpath ./node_modules/nw-gyp/bin/nw-gyp.js)

# Run npm install
cd build/client/dev/source
rm -rf node_modules
npm install
