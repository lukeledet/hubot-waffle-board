[![Build Status](https://travis-ci.org/betterup/hubot-wip.svg?branch=master)](https://travis-ci.org/betterup/hubot-wip)

# hubot-wip

> What's in progress?

## Example usage:
> Hubot what is in progress for myproject?
> Hubot what is in progress for myorganization/myproject?
> Hubot wip myproject

## Installation via NPM

Run the following command to install this module as a Hubot dependency

```
npm install hubot-wip --save
```

Confirm that hubot-wip appears as a dependency in your Hubot package.json file.

```
"dependencies": {
  "hubot":              "2.x",
  "hubot-scripts":      "2.x",
  "hubot-wip": "*"
}
```

Add hubot-wip to your external-scripts.json:

```
["hubot-wip"]
```

## Contributing

Running Unit Tests:
```bash
$ npm test
```

Feel free! Send a pull request :)

