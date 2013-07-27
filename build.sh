DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $DIR

# Uses RequireJS Optimiser
r.js -o build.js
