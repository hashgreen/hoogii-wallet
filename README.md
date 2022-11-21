# Hoogii

Hoogii is an extension for accessing Chia enabled distributed applications, or "Dapps" in your normal Chrome browser!

## Requirements

For development, you will only need Node.js installed on your environnement.
Recommend to use `yarn` as package management (not mandatory).
The following guideline with use yarn.

### Node

[Node](http://nodejs.org/) is really easy to install & now include [NPM](https://npmjs.org/).
You should be able to run the following command after the installation procedure
below.

    $ node --version
    v16.15.1

    $ npm --version
    8.11.0
    ❯ yarn --version
    1.22.18
---

## Quick Start Guide

### Install

    git clone git@github.com:hashgreen/hoogii-wallet.git
    cd hoogii-wallet
    yarn install

### Configure environments

- If you are using nvm (recommended) running nvm use will automatically choose the right node version for you.
- Install Yarn
- Install dependencies: yarn install
- Copy the .env.example file to .env.extension
Build the project to the ./dist/ folder with yarn dist.
Optionally, you may run yarn start to run dev mode.

### Start development server

    yarn dev:extension
    install unpack `/dist` folder from chrome browser in developer mode

### Create production build

    yarn build
