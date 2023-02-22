'use strict';

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const SECRET = process.env.SECRET;

const userSchema = (sequelize, DataTypes) => {
  const model = sequelize.define('User', {
    username: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    token: {
      type: DataTypes.VIRTUAL,
      get() {
        return jwt.sign({ username: this.username }, SECRET, { expiresIn: 1000 * 60 * 60 * 24 * 7 });
      },
    },
  });

  model.beforeCreate(async (user) => {

    try {
      let hashedPass = await bcrypt.hash(user.password, 10);
      user.password = hashedPass;
    } 
    catch (error) {
      console.error(error);
    }
  });

  // Basic AUTH: Validating strings (username, password) 
  model.authenticateBasic = async function (username, password) {

    try {
      const user = await this.findOne({ where: { username } });
      const valid = await bcrypt.compare(password, user.password);
      if (valid) { return user; }
      throw new Error('Invalid User');
    }
    catch (error) {
      console.error(error);
      throw new Error(error.message);
    }

  };

  // Bearer AUTH: Validating a token
  model.authenticateToken = async function (token) {
    try {
      const parsedToken = jwt.verify(token, SECRET);
      const user = await this.findOne({ where: {username: parsedToken.username} });
      if (user) { return user; }
      throw new Error('User Not Found');
    } 
    catch (e) {
      console.error(e);
      throw new Error(e.message);
    }
  };

  return model;
};

module.exports = userSchema;
