
var express = require('express');
const  mongoose = require('mongoose');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var flash = require('connect-flash'); 
var session = require('express-session'); 
var app = express();

// DB setting

mongoose.connect('mongodb://localhost/mydb', {});


// Other settings
app.set('view engine', 'ejs');
app.set(express.static(__dirname+'/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride('_method'));
app.use(flash()); // 2
app.use(session({secret:'MySecret', resave:true, saveUninitialized:true})); //3


// Routes
app.use('/', require('./routes/home'));
app.use('/posts', require('./routes/posts')); //포스트 라우트 추가! 
app.use('/users', require('./routes/users')); 

// Port setting
var port = 3000;
app.listen(port, () => {
  console.log(port, '포트로 서버가 열렸어요!');
});


