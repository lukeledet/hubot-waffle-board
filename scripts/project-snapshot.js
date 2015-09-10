// Description:
//   Report current work in progress on github projects.
//
// Dependencies:
//   githubot - see https://github.com/iangreenleaf/githubot
//   underscore
//
// Configuration
//   HUBOT_GITHUB_TOKEN=your github auth token
//   HUBOT_GITHUB_USER=default organization for github projects
//   HUBOT_GITHUB_WIP_LABEL=name of label for work in progress tickets
//
// Commands:
//  Hubot snapshot <user_or_organization>/<project> - query for recent project activity
//
// Author:
//   Ryan Sonnek

var githubAuthToken = process.env.HUBOT_GITHUB_TOKEN;
var defaultGithubOrganization = process.env.HUBOT_GITHUB_USER;
var wipLabel = process.env.HUBOT_GITHUB_WIP_LABEL;

module.exports = function(robot) {
  var github = require('githubot')(robot);
  var _ = require('underscore');

  function rejectPullRequests(issues) {
    var issuesWithoutPullRequests = _.filter(issues, function(issue) {
      return !issue.pull_request;
    });
    return issuesWithoutPullRequests;
  }

  function issueToString(issue) {
    return "#" + issue.number + ' - ' + issue.title;
  }

  // see https://developer.github.com/v3/issues/#list-issues
  function inProgressReport(orgProject, msg) {
    github.get('/repos/' + orgProject + '/issues?filter=all&labels=' + wipLabel + '&sort=updated&direction=asc', function(issues) {
      var issuesWithoutPullRequests = rejectPullRequests(issues);
      if (issuesWithoutPullRequests.length === 0) {
        msg.send('No issues currently in progress for ' + orgProject);
      } else {
        var message = 'These issues are currently in progress for ' + orgProject + ':';
        issuesWithoutPullRequests.forEach(function(issue) {
          message += "\n* " + issueToString(issue);
        });
        msg.send(message);
      }
    });
  }

  // see http://stackoverflow.com/questions/1296358/subtract-days-from-a-date-in-javascript
  function lastWeek() {
    var date = new Date();
    date.setDate(date.getDate() - 7);
    return date;
  }

  // list recently closed issues (in the past week)
  // see https://developer.github.com/v3/issues/#list-issues
  function recentClosedIssuesReport(orgProject, msg) {
    github.get('/repos/' + orgProject + '/issues?filter=all&state=closed&sort=updated&direction=desc&per_page=10&since=' + lastWeek().toISOString(), function(issues) {
      var issuesWithoutPullRequests = rejectPullRequests(issues);
      if (issuesWithoutPullRequests.length === 0) {
        msg.send('No recently closed issues for ' + orgProject);
      } else {
        var message = 'These issues were recently closed for ' + orgProject + ':';
        issuesWithoutPullRequests.forEach(function(issue) {
          message += "\n* " + issueToString(issue);
        });
        msg.send(message);
      }
    });
  }

  // see https://developer.github.com/v3/pulls/#list-pull-requests
  function openPullRequests(orgProject, msg) {
    github.get('/repos/' + orgProject + '/pulls?sort=updated&direction=asc', function(pullRequests) {
      if (pullRequests.length === 0) {
        msg.send('No open pull requests for ' + orgProject);
      } else {
        var message = 'Open pull requests for ' + orgProject + ':';
        pullRequests.forEach(function(issue) {
          message += "\n* " + issueToString(issue);
        });
        msg.send(message);
      }
    });
  }

  var snapshotHandler = function(msg) {
    var projectWithOrganization = msg.match[1].split('/');
    var organization = projectWithOrganization[projectWithOrganization.length - 2] || defaultGithubOrganization;
    var project = projectWithOrganization[projectWithOrganization.length - 1]

    var orgProject = organization + '/' + project;
    msg.send('Generating project snapshot for ' + orgProject + '...');
    recentClosedIssuesReport(orgProject, msg);
    inProgressReport(orgProject, msg);
    openPullRequests(orgProject, msg);
  };

  robot.respond(/snapshot (\S+)/i, snapshotHandler);
};