const express = require("express"); // 1. express 모듈 불러오기
const { Server } = require('http')  // 1. http 모듈 불러오기  
const socketIo = require('socket.io') // 1. Socket 모듈 불러오기

const cookieParser = require("cookie-parser");
const goodsRouter = require("./routes/goods.js");
const usersRouter = require("./routes/users.js");
const authRouter = require("./routes/auth.js");
const connect = require("./schemas");
const goods = require("./schemas/goods.js");

const app = express();
const http = Server(app) // exprress 를 통해 app 개체 만들고 http모듈에서 가져온 서버로 app(express)를 Http로 감싸도록 구성
const io = socketIo(http) // socket을 사용할수 있도록 socketIo에 http를 할당 
const port = 3000;

connect(); // mongoose를 연결합니다.

// Socket 이 접속했을 때, 해당하는 콜백함수가 실행 됨
io.on("connection", (sock)=>{
  console.log("새로운 소켓이 연결되었습니다.") // 1. 소켓 사용자가 접속

  
  // 1. 클라이언트가 상품을 구매했을 때, 발생하는 이벤트
  sock.on("BUY",(data)=>{
    const {nickname, goodsId, goodsName} = data

    const emitData = {   // 2. emit 데이터 만들기
      nickname: nickname,
      goodsId: goodsId,
      goodsName: goodsName,
      date :new Date().toISOString()
    }

  // 3. 클라이언트가 구매한 정보를 바탕으로 BUY_GOODS 메세지 전달해줘야 함. (소켓에 접속한 모든 사용자)
  io.emit("BUY_GOODS",(emitData))
  
  })

  // 소켓 사용자가 접속하였을때 바로 BUY_GOODS라는소켓 이벤트를 보냄
  // sock.emit("BUY_GOODS", {
  //   nickname: '서버가 보내준 구매자 닉네임',
  //   goodsId: 10, // 서버가 보내준 상품 데이터 고유 ID
  //   goodsName: '서버가 보내준 구매자가 구매한 상품 이름',
  //   date: '서버가 보내준 구매 일시'
  // })

  // socket 이 나간걸 확인할수 있게/ 현재 접속한 Socket 클라이언트가 종료하였을때, 실행됨
  sock.on("disconnect", ()=>{
    console.log(`${sock.id} 에 해당하는 사용자가 연결을 종료하였습니다. `)
  } )

})



app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static("assets"));
app.use("/api", [goodsRouter, usersRouter, authRouter]);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

http.listen(port, () => {
  console.log(port, "포트로 서버가 열렸어요!");
});
