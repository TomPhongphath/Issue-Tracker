const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {

  let testId;

  suite('POST /api/issues/{project} => Create Issue', function() {
    test('Create an issue with every field', function(done) {
      chai.request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Test Title',
          issue_text: 'Test text',
          created_by: 'Test Creator',
          assigned_to: 'Test Assignee',
          status_text: 'In Progress'
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.property(res.body, '_id');
          assert.property(res.body, 'issue_title');
          testId = res.body._id;
          done();
        });
    });

    test('Create an issue with only required fields', function(done) {
      chai.request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Required Test',
          issue_text: 'Required test text',
          created_by: 'Test Creator'
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.property(res.body, '_id');
          assert.equal(res.body.issue_title, 'Required Test');
          done();
        });
    });

    test('Create an issue with missing required fields', function(done) {
      chai.request(server)
        .post('/api/issues/test')
        .send({
          issue_title: '',
          issue_text: '',
          created_by: ''
        })
        .end(function(err, res) {
          assert.equal(res.body.error, 'required field(s) missing');
          done();
        });
    });
  });

  suite('GET /api/issues/{project} => View Issues', function() {
    test('View issues on a project', function(done) {
      chai.request(server)
        .get('/api/issues/test')
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          done();
        });
    });

    test('View issues with one filter', function(done) {
      chai.request(server)
        .get('/api/issues/test')
        .query({ open: true })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          done();
        });
    });

    test('View issues with multiple filters', function(done) {
      chai.request(server)
        .get('/api/issues/test')
        .query({ open: true, created_by: 'Test Creator' })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          done();
        });
    });
  });

  suite('PUT /api/issues/{project} => Update Issues', function() {
    test('Update one field on an issue', function(done) {
      chai.request(server)
        .put('/api/issues/test')
        .send({ _id: testId, issue_text: 'Updated text' })
        .end(function(err, res) {
          assert.equal(res.body.result, 'successfully updated');
          done();
        });
    });

    test('Update multiple fields on an issue', function(done) {
      chai.request(server)
        .put('/api/issues/test')
        .send({ _id: testId, issue_title: 'Updated Title', issue_text: 'Updated text' })
        .end(function(err, res) {
          assert.equal(res.body.result, 'successfully updated');
          done();
        });
    });

    test('Update an issue with missing _id', function(done) {
      chai.request(server)
        .put('/api/issues/test')
        .send({ issue_text: 'Missing _id' })
        .end(function(err, res) {
          assert.equal(res.body.error, 'missing _id');
          done();
        });
    });

    test('Update an issue with no fields to update', function(done) {
      chai.request(server)
        .put('/api/issues/test')
        .send({ _id: testId })
        .end(function(err, res) {
          assert.equal(res.body.error, 'no update field(s) sent');
          done();
        });
    });
  });

  suite('DELETE /api/issues/{project} => Delete Issues', function() {
    test('Delete an issue', function(done) {
      chai.request(server)
        .delete('/api/issues/test')
        .send({ _id: testId })
        .end(function(err, res) {
          assert.equal(res.body.result, 'successfully deleted');
          done();
        });
    });

    test('Delete an issue with missing _id', function(done) {
      chai.request(server)
        .delete('/api/issues/test')
        .send({})
        .end(function(err, res) {
          assert.equal(res.body.error, 'missing _id');
          done();
        });
    });
    test('Delete an issue with invalid _id', function(done) {
        chai.request(server)
          .delete('/api/issues/test')
          .send({_id: 'invalid_id'})
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.error, 'could not delete');
            done();
          });
      });
      test('Delete an issue with missing _id', function(done) {
        chai.request(server)
          .delete('/api/issues/test')
          .send({}) // ไม่มี _id
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.error, 'missing _id');
            done();
          });
      });
  });
});
