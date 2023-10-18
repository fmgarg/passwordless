const fetch = require("node-fetch");
const express = require("express");
const { Server: IOServer } = require("socket.io");
const { Server: HttpServer } = require("http");
const app = express();
const httpServer = new HttpServer(app);
const io = new IOServer(httpServer);
const handlebars = require("express-handlebars");
const { INSPECT_MAX_BYTES } = require("buffer");
const { timeStamp } = require("console");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const connectMongo = require("connect-mongo");
const advanceOptions = { useNewUrlParser: true, useUnifiedTopology: true };
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt-nodejs");
const flash = require("connect-flash");
const parseArgs = require("minimist");
const args = parseArgs(process.argv);
require("dotenv").config();
const cluster = require("cluster");
const numCPUs = require("os").cpus().length;
const cors = require("cors");
const jwt = require("jsonwebtoken");

const options = { default: { puerto: 8080, modo: "FORK" } };

//console.log(parseArgs(['-p', '5000'], options))
//console.log(parseArgs(process.argv.slice(2), options))

const parametros = parseArgs(process.argv.slice(2), options);

//const port = parametros['puerto'] // es para minimist not work in heruko
const port = process.env.PORT || 8080;
const MODO = parametros["modo"];
const ENV = "PROD";

//uso minimist el comando es: node server --puerto NUMERO --modo NOMBRE

const compression = require("compression");

const log4js = require("log4js");
log4js.configure({
  appenders: {
    miLoggerConsole: { type: "console" },
    miLoggerFile: { type: "file", filename: "info.log" },
    miLoggerFile2: { type: "file", filename: "info2.log" },
  },
  categories: {
    default: { appenders: ["miLoggerConsole"], level: "trace" },
    consola: { appenders: ["miLoggerConsole"], level: "debug" },
    archivo: { appenders: ["miLoggerFile"], level: "warn" },
    archivo2: { appenders: ["miLoggerFile2"], level: "info" },
    todos: {
      appenders: ["miLoggerConsole", "miLoggerFile"],
      level: "error",
    },
  },
});

//---------------NODEMAILER-----------------------------//

("use strict");
const nodemailer = require("nodemailer");

// async..await is not allowed in global scope, must use a wrapper

//async function main() {
// Generate test SMTP service account from ethereal.email
// Only needed if you don't have a real mail account for testing
//let testAccount = await nodemailer.createTestAccount();

// create reusable transporter object using the default SMTP transport
const transport = nodemailer.createTransport({
  service: process.env.EMAIL_HOST, //"gmail", //host: "smtp.ethereal.email",
  port: 587,
  //secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER, //"nodemailer.fmg@gmail.com", //'barbara.swift@ethereal.email',
    pass: process.env.EMAIL_PASSWORD, //"iiglafagdiytahyg", //'E2eGX1CXyMXMuVZEY6'
  },
});

// Make email template for magic link
const emailTemplate = ({ username, link }) => `
                                                <h2>Hola,</h2>
                                                <p>Este es el link que solicitaste, solo debes hacer click o copiarlo y pegarlo en tu navegador para ingresar:</p>
                                                <p>${link}</p>
                                                `;

// send mail with defined transport object
let mailOptions = {
  from: '"node.js-server 👻" <nodemailer.fmg@gmail.com>', // sender address
  to: "fmgarg@gmail.com", //, carlos@gmail.com", // list of receivers
  subject: "Hello ✔", // Subject line
  text: "Hello pancho", // plain text body
  html: "<b>Hello pancho</b>", // html body //
};

//let info = await transport.sendMail(mailOptions);

//console.log("Message sent: %s", info.messageId);
// Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

// Preview only available when sending through an Ethereal account
// console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
// Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...

// Generate token
const makeToken = (username) => {
  const expirationDate = new Date();
  expirationDate.setHours(new Date().getHours() + 1);
  return jwt.sign(
    { email: username, expirationDate },
    process.env.JWT_SECRET_KEY
  );
};
//}

//main().catch(console.error);

const isAuthenticated = (req, res) => {
  const { token } = req.query;
  if (!token) {
    res.status(403);
    res.send("Can't verify user.");
    return;
  }
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  } catch {
    res.status(403);
    res.send("Invalid auth credentials.");
    return;
  }
  if (
    !decoded.hasOwnProperty("email") ||
    !decoded.hasOwnProperty("expirationDate")
  ) {
    res.status(403);
    res.send("Invalid auth credentials.");
    return;
  }
  const { expirationDate } = decoded;
  if (expirationDate < new Date()) {
    res.status(403);
    res.send("Token has expired.");
    return;
  }
  res.status(200);
  res.render('exito.hbs')
  //res.send("User has been validated.");
};

//-------BDD-ECOMMERCE--MONGO--ATLAS------------------//

const mongoose = require("mongoose");
const User = require("./models/modelUsers");

async function CRUD() {
  try {
    const URL = process.env.MGATLAS;
    let respueta = await mongoose.connect(URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  } catch (e) {
    console.log(e);
  }
}

CRUD();
//-----------FIN BDD MONGOOSE-----------------//

//---------------------------------SQLite3----------------------------------------//

const { optionsMSG } = require("./optionsMSG/sqLite3");
const { MemoryStore } = require("express-session");
const { isNullOrUndefined } = require("util");
const { CONNREFUSED } = require("dns");
//const { createHash } = require('crypto')
const knexMSG = require("knex")(optionsMSG);

//----------------esta funcion crea la tabla de mensajes sqLite3------------------

const crearTabla = () => {
  const { createTableMSG } = require("./optionsMSG/createTableMSG");
};

//crearTabla ()

//--------esta funcion devuelve todos los mensajes de la tabla mensajes-----------

getAll()
  .catch((err) => {
    console.log(err);
  })
  .finally(() => {
    knexMSG.destroy();
  });

async function getAll() {
  await knexMSG
    .from("MSG")
    .select("*")
    .then((rows) => {
      messages = rows.map((mensaje) => {
        return mensaje;
      });
      return messages;
    });
}

//------------------PROMESAS CON NODE-FETCH----------------------------//
let productos = [];

asyncCall().catch((err) => {
  console.log(err);
});

async function asyncCall() {
  let items = await fetch(`http://localhost:8080/productos/landing`, {
    method: "GET",
    //body:null,
  }).then((res) => res.json());
  for (var i = 0; i < items.length; i++) {
    productos.push(items[i]);
  }
}
//--------------FIN---PROMESAS-----------------------------//

//-------importando modulos Router------------------//
const productosMg = require("./DAOs/productosMg");
const carritoMg = require("./DAOs/carritoMg");
const ordenesMg = require("./DAOs/ordenesMg");

//---------------------------------SOCKETS-----------------------//

const userAdmin = [];
let messages = [];

io.on("connection", (socket) => {
  //console.log('socket connection')
  //console.log(`socketId: ${socket.id}`)
  //console.log(User)

  socket.emit("socketUser", userAdmin);
  socket.emit("messages", messages);
  socket.emit("socketProductos", productos);

  //---aca recibo los datos del new userAdmin
  socket.on("notificacion", (data) => {
    console.log(`server socketio: ${data}`);
  });

  //---aca recibo el mensaje nuevo de addMessage/socket.emit y lo inserto en la BDD
  socket.on("new-message", async (mensaje) => {
    const { optionsMSG } = require("./optionsMSG/sqLite3");
    const knexMSG = require("knex")(optionsMSG);
    let insertNewMSGonBDD = await knexMSG("MSG")
      .insert(mensaje)
      .then(() => {
        console.log("newMessage insert");
      })
      .catch((err) => {
        console.log(err);
        throw err;
      })
      .finally(() => {
        knexMSG.destroy();
      });

    await messages.push(mensaje);
    io.sockets.emit("messages", messages);
  });

  //---aca recibo el product nuevo de addProduct/socket.emit y lo inserto en la BDD
  socket.on("nuevo-producto", (newProduct) => {
    productos.push(newProduct);
    io.sockets.emit("socketProductos", productos);
  });
});

//----------------------APP---------------------------------//

if (MODO === "CLUSTER" && cluster.isPrimary) {
  console.log(`num CPUs es: ${numCPUs}`);
  console.log(`PID MASTER ${process.pid}`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  cluster.on("exit", (worker, code, signal) => {
    console.log(
      `Worker${worker.process.pid}died${new Date().toLocaleString()}`
    );
    cluster.fork();
  });
} else {
  httpServer.listen(port, () => {
    console.log(`servidor levantado puerto:${port}`);
  });

  /*
  //metodo para enviar y recibir peticiones json
  const router = express.Router()
  */

  //usar app delante de use hace que sea general y que toda la app pueda procesar JSON y siempre debe ir antes del router con la peticion**
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  app.use(cors());

  //se define la ruta de los archivos estaticos que seran servidos desde la ruta/public, IF nginx proxy desactivar!!
  app.use(express.static("./public"));

  //------------------------------HANDLEBARS-----------------------//

  app.engine(
    ".hbs",
    handlebars.engine({
      extname: ".hbs",
      defaultLayout: "main.hbs",
      layoutsDir: "./views/layouts",
    })
  );

  app.set("view engine", ".hbs");
  app.set("views", "./views");
  //------------------------COMPRESSION-----------------------//
  app.use(compression());

  //--------------------------LOGIN--CON---SESSION y PASSPORT---------------------------//
  app.use(cookieParser());

  //----METODO DE SAVE SESSION a nivel de la aplicacion y TIEMPO (ttl)/ cookie maxAge
  app.use(
    session({
      store: connectMongo.create({
        mongoUrl: process.env.MGATLAS, //'mongodb+srv://ex888gof:2013facu@cluster0.mnmsh.mongodb.net/ecommerce?retryWrites=true&w=majority'
        ttl: 600,
        autoRemove: "disabled",
        mongoOptions: advanceOptions,
      }),
      secret: "secreto",
      resave: true,
      saveUninitialized: true,
      cookie: { maxAge: 600000 },
    })
  );

  //----PASSPORT---------------------------------

  app.use(flash());

  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    "login",
    new LocalStrategy(
      {
        usernameField: "username",
        passwordField: "password",
        passReqToCallback: true,
      },
      async (req, username, password, done) => {
        const userExist = await User.findOne({ username: username });
        if (!userExist) {
          return done(
            null,
            false,
            req.flash("signinMessage", "No se ubica el Usuario")
          );
        }
        if (!userExist.comparePassword(password)) {
          return done(
            null,
            false,
            req.flash("signinMessage", "Password incorrecta")
          );
        }
        done(null, userExist);
      }
    )
  );

  passport.use(
    "register",
    new LocalStrategy(
      {
        //---FALTA EL MANEJO DE ERRORES Y DUPLICADOS!!!----//
        usernameField: "username",
        passwordField: "password",
        passReqToCallback: true,
      },
      async (req, username, password, done) => {
        const userExist = await User.findOne({ username: username });

        if (userExist) {
          return done(
            null,
            false,
            req.flash("signupMessage", "El usuario ya existe")
          ); //01:31 agregar ruta que captura msgs con var global y luego if al login.hbs
        } else {
          const newUser = new User();
          (newUser.username = username),
            (newUser.password = encryptPassword(password)),
            (newUser.nombre = req.body.nombre),
            (newUser.apellido = req.body.apellido),
            (newUser.dni = req.body.dni),
            (newUser.calle = req.body.calle),
            (newUser.altura = req.body.altura),
            (newUser.pisoDpto = req.body.pisoDpto),
            (newUser.localidad = req.body.localidad),
            (newUser.cp = req.body.cp),
            (newUser.provincia = req.body.provincia),
            (newUser.telefono = req.body.telefono);

          await newUser.save();
          done(null, newUser);
        }
      }
    )
  );

  function encryptPassword(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
  }

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    const user = await User.findById(id);
    done(null, user);
  });

  //---------------RUTAS -------------------------

  app.get("/login", (req, res, next) => {
    req.logOut(function (err) {
      if (err) {
        return next(err);
      }
      res.render("login");
    });
  });

  /*
  //PASSPORT LOGIN
  app.post(
    "/login",
    passport.authenticate("login", {
      successRedirect: "/home",
      failureRedirect: "/login-error",
    })
  );*/

  //PASSWORDLESS LOGIN
  app.post("/login", (req, res) => {
    const { username } = req.body;
    console.log(username);
    console.log(req.body);
    if (!username) {
      res.status(404);
      res.send({
        message: "You didn't enter a valid email address.",
      });
    }
    const token = makeToken(username);
    const mailOptions = {
      from: '"passwordless.app 👻" <nodemailer.fmg@gmail.com>', 
      html: emailTemplate({
        email: username,
        link: `http://localhost:8080/account?token=${token}`,
      }),
      subject: "Tu link para ingresar",
      to: username,
    };
    return transport.sendMail(mailOptions, (error) => {
      if (error) {
        res.status(404);
        res.send("Can't send email.");
      } else {
        res.status(200);
        res.send(
          `Utiliza el siguiente link para ingresar: http://localhost:8080/account?token=${token}`
        );
      }
    });
  });

  // Get account information
  app.get("/account", (req, res) => {
    isAuthenticated(req, res);
  });

  app.get("/login-error", (req, res) => {
    res.render("login-error");
  });

  app.get("/register", (req, res) => {
    res.render("register");
  });

  app.post(
    "/register",
    passport.authenticate("register", {
      successRedirect: "/login",
      failureRedirect: "/login-error",
      passReqToCallback: true,
    })
  );

  //----METODO LOGOUT que destruye la sesion--------//
  app.get("/logout", (req, res, next) => {
    req.logOut(function (err) {
      if (err) {
        return next(err);
      }
      res.redirect("/login");
    });
  });

  app.use(
    "/home",
    async function (req, res, next) {
      if (req.session.passport == undefined) {
        res.redirect("/login");
      } else {
        const id = req.session.passport["user"];
        //console.log(req.session.passport)

        userAdmin.push(req.session.passport);
        //console.log(userAdmin)

        //const user = await User.findById (id)
        //console.log(user);

        //const userLogin = {user:{}}
        //userLogin['user']= user.nombre
        //userAdmin.push(userLogin)
        next();
      }
    },
    productosMg
  );

  app.use("/productos", productosMg);

  /*app.use('/app/user'
                    ,async function (req, res, next) {           
                          if(req.session.passport==undefined){
                                res.redirect('/login')
                          }else{
                                console.log(req.session.passport)
                                next ()
                          }}
                    ,productosMg);*/

  app.use(
    "/carrito",
    async function (req, res, next) {
      if (req.session.passport == undefined) {
        res.redirect("/login");
      } else {
        next();
      }
    },
    carritoMg
  );

  app.use(
    "/orden",
    async function (req, res, next) {
      if (req.session.passport == undefined) {
        res.redirect("/login");
      } else {
        next();
      }
    },
    ordenesMg
  );

  //------------OTRAS RUTAS-----------------//
  app.get("/cookies", (req, res) => {
    res.send(req.cookies);
  });

  app.get("/info", async function (req, res) {
    const objeto = {
      datos: {
        Argumentos: process.argv,
        SO: process.platform,
        NodeJSversion: process.version,
        TotalUsagedRAM: process.memoryUsage(),
        PathDeEjecucion: process.cwd(),
        IDprocess: process.pid,
        nCPUs: numCPUs,
      },
    };
    res.send({ objeto });
  });

  app.get("*", function (req, res) {
    res.send("ruta no implementada");
  });

  // ----------OJO aca termina el IF/ELSE DE APP----------//
}
