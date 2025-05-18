import express from "express";
import "dotenv/config";
import mongoose from "mongoose";
import User from "./users/model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const { URL } = process.env;
const { SECRET_KEY } = process.env;
const salt = bcrypt.genSaltSync(10);
const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ msg: "Olá" });
});

app.post("/user/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400).json("Preencha todos os campos!");
    return;
  }

  const userExisting = await User.findOne({ email: email });

  if (userExisting) {
    res.status(400).json("Este email já tem uma conta criada!");
    return;
  }

  const encryptPass = bcrypt.hashSync(password, salt);

  if (encryptPass) {
    try {
      await User.create({
        name,
        email,
        password: encryptPass,
      });
      res.status(200).json("Usúario criado com sucesso!");
      console.log(encryptPass);
    } catch (error) {
      console.error(error);
      res.status(400).json("Erro ao criar novo usuário!", error);
    }
  } else {
    res.status(400).json("Erro ao criar senha!");
  }
});

app.post("/user/login", async (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    res.json("Preencha todos os campos!");
    return;
  }

  const user = await User.findOne({ email });

  if (!user) {
    res.json("Não existe esse usuário. Favor, registre-se");
    return;
  }

  const { _id } = user;
  const userObj = { _id, name, email };
  jwt.sign(userObj, SECRET_KEY, function (erro, token) {
    if (erro) {
      console.log("Erro ao criar token:", erro);
      res.json("Erro ao criar token");
    } else {
      res.json(token);
    }
  });
});

mongoose
  .connect(URL)
  .then(() => {
    app.listen(3000, () => {
      console.log("Servidor rodando na porta 3000");
    });
    console.log("Conectou ao banco!");
  })
  .catch((error) => {
    console.error("Erro ao conectar ao banco:", error);
  });
