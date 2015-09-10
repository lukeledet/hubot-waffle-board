// setup env
var defaultGithubOrganization = 'mycompany';
process.env.HUBOT_GITHUB_USER = defaultGithubOrganization;

require('coffee-script/register');
var Helper = require('hubot-test-helper');
var helper = new Helper('../scripts/project-snapshot.js');
var chai = require('chai');
var expect = chai.expect;

describe('project-snapshot', function() {
  var room;

  beforeEach(function() {
    room = helper.createRoom();
  });
  afterEach(function() {
    room.destroy();
  });

  describe('when message omits organization name', function() {
    var message = 'hubot snapshot myproject';
    beforeEach(function() {
      room.user.say('alice',  message);
    });
    it('fires listener', function() {
      expect(room.messages).to.eql([
        ['alice', message],
        ['hubot', 'Generating project snapshot for mycompany/myproject...']
      ]);
    });
  });

  describe('when message includes organization name', function() {
    var message = 'hubot snapshot myothercompany/myproject';
    beforeEach(function() {
      room.user.say('alice',  message);
    });
    it('fires listener', function() {
      expect(room.messages).to.eql([
        ['alice', message],
        ['hubot', 'Generating project snapshot for myothercompany/myproject...']
      ]);
    });
  });
});
