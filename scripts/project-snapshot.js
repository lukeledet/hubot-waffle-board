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
//   HUBOT_GITHUB_WORKFLOW_LABELS=comma separated list of labels used for workflow (ex: Backlog, In Progress)
//
// Commands:
//   Hubot snapshot <user_or_organization>/<project> - query for recent project activity
//
// Author:
//   Ryan Sonnek

var githubAuthToken = process.env.HUBOT_GITHUB_TOKEN;
var defaultGithubOrganization = process.env.HUBOT_GITHUB_USER;
var wipLabel = process.env.HUBOT_GITHUB_WIP_LABEL;
var workflowLabels = process.env.HUBOT_GITHUB_WORKFLOW_LABELS;

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
    var labels = _.reject(issue.labels, function(label) { return label.name == wipLabel });
    var hashtags = _.map(labels, function(label) { return '#' + label.name; }).sort().join(' ');
    var owner = issue.assignee || issue.user;
    return "#" + issue.number + ' - @' + owner + ' ' + issue.title + ' ' + hashtags;
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

  // see https://developer.github.com/v3/search/#search-issues
  // example query: -label:"2 - Working" -label:"1 - Ready" -label:"0 - Backlog" repo:betterup/myproject is:open type:issue
  function inboxIssues(orgProject, msg) {
    var queryParts = [
      'type:issue',
      'is:open'
    ];
    queryParts.push('repo:' + orgProject);
    (workflowLabels || '').split(',').forEach(function(label) {
      queryParts.push('-label:"' + label + '"');
    });
    github.get('/search/issues?sort=created&order=asc&q=' + queryParts.join(' '), function(results) {
      var issues = results.items;
      if (issues.length === 0) {
        msg.send('No new issues in the inbox for ' + orgProject);
      } else {
        var message = 'These are new issues in the inbox for ' + orgProject + ':';
        issues.forEach(function(issue) {
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
    inboxIssues(orgProject, msg);
  };

  robot.respond(/snapshot (\S+)/i, snapshotHandler);
};
