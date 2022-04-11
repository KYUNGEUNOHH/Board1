
var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

// schema 
var userSchema = mongoose.Schema({
  username:{
    type:String,
    required:[true,'Username is required!'],
    match:[/^.{4,12}$/,'Should be 4-12 characters!'],
    trim:true,
    unique:true
  },
  password:{
    type:String,
    required:[true,'Password is required!'],
    select:false
  },
  name:{
    type:String,
    required:[true,'Name is required!'],
    match:[/^.{4,12}$/,'Should be 4-12 characters!'],
    trim:true
  },
  email:{
    type:String,
    match:[/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,'Should be a vaild email address!'],
    trim:true
  }
},{
  toObject:{virtuals:true}
});


// virtuals // db에 저장은 하지 않지만 모델에서 사용하고 싶은 항목들을 virtual로 만들었음

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
var passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,16}$/; 
var passwordRegexErrorMessage = 'Should be minimum 8 characters of alphabet and number combination!'; 
userSchema.path('password').validate(function(v) {
  var user = this;

  // create user
  if(user.isNew){
    if(!user.passwordConfirmation){
      user.invalidate('passwordConfirmation', 'Password Confirmation is required.');
    }

    if(!passwordRegex.test(user.password)){ //정규표현식 통과하면 true
      user.invalidate('password', passwordRegexErrorMessage); // false가 반환되는 경우 model.invalidate함수 호출 
    }
    else if(user.password !== user.passwordConfirmation) {
      user.invalidate('passwordConfirmation', 'Password Confirmation does not matched!');
    }
  }

  // update user
  if(!user.isNew){
    if(!user.currentPassword){
      user.invalidate('currentPassword', 'Current Password is required!');
    }
    else if(!bcrypt.compareSync(user.currentPassword, user.originalPassword)){
      user.invalidate('currentPassword', 'Current Password is invalid!');
    }

    if(user.newPassword && !passwordRegex.test(user.newPassword)){ 
      user.invalidate("newPassword", passwordRegexErrorMessage); 
    }
    else if(user.newPassword !== user.passwordConfirmation) {
      user.invalidate('passwordConfirmation', 'Password Confirmation does not matched!');
    }
  }
});


    

// hash password // 첫번째 파라미터로 설정된 이벤트가 일어나기 전에 먼저 콜백함수를 실행 
userSchema.pre('save', function (next){
  var user = this;
  if(!user.isModified('password')){ // isModified 함수는 해당 값이 db에 기록된 값과 비교해서 변경된 경우 True를 아니면 False를 반환
    return next();
  }
  else {
    user.password = bcrypt.hashSync(user.password); //bcrypt.hashSync함수로 password를 hash 값으로 바꾼다. 
    return next();
  }
});

// model methods // 
userSchema.methods.authenticate = function (password) {
  var user = this;
  return bcrypt.compareSync(password,user.password);
};

// model & export
var User = mongoose.model('user',userSchema);
module.exports = User;
