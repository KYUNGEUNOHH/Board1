
var mongoose = require('mongoose');

// schema // 1
var userSchema = mongoose.Schema({
  username:{type:String, required:[true,'Username을 입력해주세요'], unique:true},
  password:{type:String, required:[true,'Password를 입력해주세요'], select:false}, //select false 하여 해당 항목값을 갖고오지 않음. 
  name:{type:String, required:[true,'Name을 입력해주세요']},
  email:{type:String}
},{
  toObject:{virtuals:true}
});

// virtuals // 2 // db에 저장은 하지 않지만 모델에서 사용하고 싶은 항목들을 virtual로 만들었음

userSchema.virtual('passwordConfirmation')
  .get(function(){ return this._passwordConfirmation; })
  .set(function(value){ this._passwordConfirmation=value; });

userSchema.virtual('originalPassword')
  .get(function(){ return this._originalPassword; })
  .set(function(value){ this._originalPassword=value; });

userSchema.virtual('currentPassword')
  .get(function(){ return this._currentPassword; })
  .set(function(value){ this._currentPassword=value; });

userSchema.virtual('newPassword')
  .get(function(){ return this._newPassword; })
  .set(function(value){ this._newPassword=value; });

// password validation // 3 디비 생성, 수정 전에 값이 유효한지 확인하는 코드
userSchema.path('password').validate(function(v) {
  var user = this; // 3-1

  // create user // 3-3
  if(user.isNew){ // 3-2
    if(!user.passwordConfirmation){
      user.invalidate('passwordConfirmation', 'Password Confirmation is required.');
    }

    if(user.password !== user.passwordConfirmation) {
      user.invalidate('passwordConfirmation', 'Password Confirmation does not matched!');
    }
  }

  // update user // 3-4
  if(!user.isNew){
    if(!user.currentPassword){
      user.invalidate('currentPassword', 'Current Password is required!');
    }
    else if(user.currentPassword != user.originalPassword){
      user.invalidate('currentPassword', 'Current Password is invalid!');
    }

    if(user.newPassword !== user.passwordConfirmation) {
      user.invalidate('passwordConfirmation', 'Password Confirmation does not matched!');
    }
  }
});

// model & export
var User = mongoose.model('user',userSchema);
module.exports = User;