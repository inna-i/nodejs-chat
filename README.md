# NWSD-Chat &middot; [![Travis CI Status](https://travis-ci.com/inna-i/nodejs-chat.svg?branch=master)](https://travis-ci.com/github/inna-i/nodejs-chat) 

To build both parts:
`npm run build`

To start local development:
`npm run dev`

To build Docker image:
`npm run buildDocker`

To start Docker container:
`npm run runDocker`

Please find Kubernetes project here: https://github.com/vyshkov/scaling-nwsd-chat

To build and push Docker image to your own Docker Hub from your local machine: 

- add credentials in .env file:
    ```
    DOCKER_USERNAME=userName
    DOCKER_PASSWORD=userPassword
    ```
- login into Docker Hub
    `npm run dockerLoginLocal`
 
- tag your image (first should be built)
    `npm run dockerTagLocal`

- push the image
    `npm run dockerPushLocal`

**Note:** instead of `npm run` you can use `yarn`

