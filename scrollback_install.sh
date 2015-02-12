#! /bin/bash
#
# \\\ wami            ///
# ///     02-Feb-2015 \\\
#
#
# It is recommended to run these commands one by one in order to identify
# possible errors
#

# Dependencies from package manager
sudo apt-get install git
sudo apt-get install nodejs-legacy npm
sudo apt-get install redis-server

# Additional dependencies (-g is install globally)
sudo npm install -g through2
sudo npm install -g lodash.find
sudo npm install -g gulp
sudo npm install -g bower
sudo npm install -g mocha

# Cloning and build
git clone https://github.com/scrollback/scrollback.git
cd scrollback
export PYTHON="python2.7"
# this will install the required modules into scrollback folder
npm install
bower install

# this will create configuration files
[[ -f "ircClient/myConfig.js" ]] || cp "ircClient/myConfig.sample.js" "ircClient/myConfig.js"
[[ -f "./client-config.js" ]] || cp "./client-config-defaults.js" "./client-config.js"
[[ -f "./server-config.js" ]] || cp "./server-config-defaults.js" "./server-config.js"

# this will generate client scripts
gulp

# Add local.scrollback.io to /etc/hosts
grep "local.scrollback.io" "/etc/hosts" > /dev/null 2>&1
if [[ ! $? -eq 0 ]]; then
    echo "Add 'local.scrollback.io' to /etc/hosts [y/n]?"
    read -t 5 -n 1 ans
    [[ -z "$ans" || "$ans" = [Yy] ]] && echo "127.0.0.1	local.scrollback.io" | sudo tee -a "/etc/hosts"
fi

# Start the scrollback server
sudo service redis-server restart
sudo npm start
