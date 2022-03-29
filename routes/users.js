// routes/users.js

var express = require('express');
var router = express.Router();
var User = require('../models/Users'); //스키마 가지고오기 

// Index // 
router.get('/', function(req, res){
  User.find({})
    .sort({username:1}) //유저네임 기준으로 오름차순, -1을 넣으면 내림차순이 된다. 
    .exec(function(err, users){
      if(err) return res.json(err);
      res.render('users/index', {users:users});
    });
});

// New
router.get('/new', function(req, res){
  res.render('users/new');
});

// create
router.post('/', function(req, res){
  User.create(req.body, function(err, user){
    if(err) return res.json(err);
    res.redirect('/users');
  });
});

// show
router.get('/:username', function(req, res){
  User.findOne({username:req.params.username}, function(err, user){
    if(err) return res.json(err);
    res.render('users/show', {user:user});
  });
});

// edit
router.get('/:username/edit', function(req, res){
  User.findOne({username:req.params.username}, function(err, user){
    if(err) return res.json(err);
    res.render('users/edit', {user:user});
  });
});

// update // 2
router.put('/:username', function(req, res, next){
  User.findOne({username:req.params.username}) // findone으로 값을 찾은 후에 값을 수정하고, user.save함수로 값을 저장함. 
    .select('password') // select함수를 이용하여 password 가져옴 select함수로 여러 항목을 동시에 정할 수도 있는데 앞에 -를 붙이면됨. 
    .exec(function(err, user){
      if(err) return res.json(err);

      // update user object
      user.originalPassword = user.password;
      user.password = req.body.newPassword? req.body.newPassword : user.password; // pw업데이트 하는 경우와 하지 않는 경우
      for(var p in req.body){ // user는 디비에서 읽어온 데이터이고, req.body가 실제 form으로 입력된 값이므로, 각 항목을 덮어 쓰는부분.
        user[p] = req.body[p];
      }

      // save updated user
      user.save(function(err, user){
        if(err) return res.json(err);
        res.redirect('/users/'+user.username);
      });
  });
});

// destroy
router.delete('/:username', function(req, res){
  User.deleteOne({username:req.params.username}, function(err){
    if(err) return res.json(err);
    res.redirect('/users');
  });
});

module.exports = router;