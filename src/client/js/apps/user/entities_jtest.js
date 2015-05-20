'use strict';

describe('user/entities', function() {
  beforeEach(function(done) {
    var that = this;
    require(['backbone', 'q', 'js/apps/user/entities'], function(Backbone, q, Entities) {
      that.Entities = Entities;
      that.data = {
        valid_email: 'valid@valid.com',
        invalid_email: 'invalid @valid.com',
        valid_password: '12341234a',
        invalid_short_password: '123abc'
      };
      done();
    });
  });

  it('requires valid email addresses', function() {
    var user = new this.Entities.UserLocalAccess({ local_email: this.data.invalid_email });
    var validationErrors = user.validate(user.attributes); // manual validate call
    expect(validationErrors['local-email']).toBeDefined();
  });

  it('does not require password to be defined if has_pw_flag is false', function() {
    var user = new this.Entities.UserLocalAccess({ local_email: this.data.valid_email, has_pw_flag: 'false' });
    var validationErrors = user.validate(user.attributes);
    expect(validationErrors['local-password']).toBeUndefined();

    user = new this.Entities.UserLocalAccess({ local_email: this.data.valid_email, has_pw_flag: 'true' });
    validationErrors = user.validate(user.attributes);
    expect(validationErrors['local-password']).toBeDefined();
  });

  it('requires password to be at least 8 characters long', function() {
    var user = new this.Entities.UserLocalAccess({
      local_email: this.data.valid_email,
      has_pw_flag: 'true',
      local_password: this.data.invalid_short_password
    });
    var validationErrors = user.validate(user.attributes);
    expect(validationErrors['local-password']).toBeDefined();
  });

  it('validates with valid password and valid email', function() {
    var user = new this.Entities.UserLocalAccess({
      local_email: this.data.valid_email,
      has_pw_flag: 'true',
      local_password: this.data.valid_password
    });
    var validationErrors = user.validate(user.attributes);
    expect(validationErrors).toEqual({});
  });
});
