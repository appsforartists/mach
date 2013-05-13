require('./helper');
var when = require('when');
var delay = require('when/delay');
module.exports = describeSessionStore;

function describeSessionStore(store) {
  beforeEach(function () {
    return store.purge();
  });

  after(function () {
    return store.destroy();
  });

  describe('when there is no session with a given value', function () {
    var session;
    beforeEach(function () {
      return when(store.load('fake-value'), function (newSession) {
        session = newSession;
      });
    });

    it('returns an empty object', function () {
      assert.deepEqual(session, {});
    });
  });

  describe('when a session is saved', function () {
    var value;
    beforeEach(function () {
      var session = { count: 1 };
      return when(store.save(session), function (newValue) {
        value = newValue;
      });
    });

    it('can be retrieved using the opaque return value', function () {
      return when(store.load(value), function (session) {
        assert(session);
        assert.equal(session.count, 1);
      });
    });
  });

  describe('when it has a TTL', function () {
    beforeEach(function () {
      store.ttl = 10;
    });

    afterEach(function () {
      delete store.ttl;
    });

    describe('and a session is not expired', function () {
      var value;
      beforeEach(function () {
        var session = { count: 1 };
        return when(store.save(session), function (newValue) {
          value = newValue;
        });
      });

      it('loads the session', function () {
        return when(store.load(value), function (session) {
          assert(session);
          assert.equal(session.count, 1);
        });
      });
    });

    describe('and a session is expired', function () {
      var value;
      beforeEach(function () {
        var session = { count: 1 };
        return when(store.save(session), function (newValue) {
          value = newValue;
          return delay(store.ttl);
        });
      });

      it('loads a new session', function () {
        return when(store.load(value), function (session) {
          assert(session);
          assert.deepEqual(session, {});
        });
      });
    });

    describe('and a session is touched before it expires', function () {
      var value;
      beforeEach(function () {
        var session = { count: 1 };
        return when(store.save(session), function () {
          return delay(store.ttl / 2).then(function () {
            return when(store.touch(session), function () {
              return when(store.save(session), function (newValue) {
                value = newValue;
                return delay(store.ttl / 2);
              });
            });
          });
        });
      });

      it('loads the session', function () {
        return when(store.load(value), function (session) {
          assert(session);
          assert.equal(session.count, 1);
        });
      });
    });
  });
}