# snap-ql

https://github.com/user-attachments/assets/0103119a-e6cc-446b-840d-d5e744e0993e

An AI-powered Postgres Client
* fully local. no data is sent to the cloud
* use your own OpenAI key

### Build it locally
I will eventually ship some precompiled binaries, but that takes some setup. In the meantime, follow these steps to build a local copy:

* clone the repo
* run `npm install`
* if you're on MacOS, you will need to have XCode installed
* run `npm build:mac` or `npm build:win` depending on your platform
* install the binary located in `./dist`
