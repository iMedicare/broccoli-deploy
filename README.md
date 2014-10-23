# broccoli-deploy

> [broccoli](https://github.com/broccolijs/broccoli) plugin for hosting assets to S3

## Usage

First, add `broccoli-deploy` as a dependency:

```shell
npm install --save-dev broccoli-deploy
```

Add S3 credentials to your `.env` file:

```shell
AWS_ACCESS_KEY_ID=YourKey
AWS_SECRET_ACCESS_KEY=YourSecret
```

Then, run:

```shell
broc deploy <bucket>
```
## License

[MIT License](http://en.wikipedia.org/wiki/MIT_License)