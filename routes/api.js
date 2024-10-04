'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = function (app) {
  let issues = {}; // Use an object to store issues per project

  app.route('/api/issues/:project')

    // Create an issue
    .post(function (req, res) {
      let project = req.params.project;
      if (!issues[project]) issues[project] = [];

      const { issue_title, issue_text, created_by, assigned_to = '', status_text = '' } = req.body;

      if (!issue_title || !issue_text || !created_by) {
        return res.json({ error: 'required field(s) missing' });
      }

      let newIssue = {
        _id: uuidv4(),
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text,
        created_on: new Date(),
        updated_on: new Date(),
        open: true
      };

      issues[project].push(newIssue);
      res.json(newIssue);
    })

    // View issues on a project
    .get(function (req, res) {
      let project = req.params.project;
      if (!issues[project]) return res.json([]);

      let result = issues[project];
      for (let key in req.query) {
        result = result.filter(issue => issue[key] == req.query[key]);
      }
      res.json(result);
    })

    // Update an issue
    .put(function (req, res) {
      let project = req.params.project;
      let { _id, ...fieldsToUpdate } = req.body;

      if (!_id) return res.json({ error: 'missing _id' });

      if (!Object.keys(fieldsToUpdate).length) {
        return res.json({ error: 'no update field(s) sent', '_id': _id  });
      }

      let issue = issues[project].find(issue => issue._id === _id);
      if (!issue) return res.json({ error: 'could not update','_id': _id  });

      for (let key in fieldsToUpdate) {
        if (fieldsToUpdate[key]) issue[key] = fieldsToUpdate[key];
      }
      issue.updated_on = new Date();

      res.json({ result: 'successfully updated','_id': _id  });
    })

    // Delete an issue
    .delete(function (req, res) {
      let project = req.params.project;
      let { _id } = req.body;
    
      if (!_id) return res.json({ error: 'missing _id' });
    
      let issueIndex = issues[project].findIndex(issue => issue._id === _id);
      if (issueIndex === -1) return res.json({ error: 'could not delete', '_id': _id  });
    
      issues[project].splice(issueIndex, 1);
      res.json({ result: 'successfully deleted', '_id': _id  });
    })
    
};
