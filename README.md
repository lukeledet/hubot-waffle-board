[![Build Status](https://travis-ci.org/betterup/hubot-waffle-board.svg?branch=master)](https://travis-ci.org/betterup/hubot-waffle-board)

# hubot-waffle-board

> What's my project status? (Done, Doing, New Issues)

## Example usage:
> Hubot waffle board myproject?
> Hubot waffle board myorganization/myproject?

## Installation via NPM

Run the following command to install this module as a Hubot dependency

```
npm install hubot-waffle-board --save
```

Confirm that hubot-waffle-board appears as a dependency in your Hubot package.json file.

```
"dependencies": {
  "hubot":              "2.x",
  "hubot-scripts":      "2.x",
  "hubot-waffle-board": "*"
}
```

Add hubot-waffle-board to your external-scripts.json:

```
["hubot-waffle-board"]
```

## Contributing

Running Unit Tests:
```bash
$ npm test
```

Feel free! Send a pull request :)

