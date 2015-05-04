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
        invalid_char_password: '_123asdfas4',
        invalid_short_password: '123abc'
      };
      done();
    });
  });

  it('requires valid email addresses', function() {
    var user = new this.Entities.UserLocalAccess({ email: this.data.invalid_email });
    var validationErrors = user.validate(user.attributes); // manual validate call
    expect(validationErrors['email']).toBeDefined();
  });

  it('does not require password to be defined', function() {
    var user = new this.Entities.UserLocalAccess({ email: this.data.valid_email });
    var validationErrors = user.validate(user.attributes);
    expect(validationErrors['password']).toBeUndefined();
  });

  it('requires password to be alphanumeric if defined', function() {
    var user = new this.Entities.UserLocalAccess({
      email: this.data.valid_email,
      password: this.data.invalid_char_password
    });
    var validationErrors = user.validate(user.attributes);
    expect(validationErrors['password']).toBeDefined();
  });

  it('requires password to be at least 8 characters long', function() {
    var user = new this.Entities.UserLocalAccess({
      email: this.data.valid_email,
      password: this.data.invalid_short_password
    });
    var validationErrors = user.validate(user.attributes);
    expect(validationErrors['password']).toBeDefined();
  });

  it('validates with valid password and valid email', function() {
    var user = new this.Entities.UserLocalAccess({ email: this.data.valid_email, password: this.data.valid_password });
    var validationErrors = user.validate(user.attributes);
    expect(validationErrors).toEqual({});
  });
});
