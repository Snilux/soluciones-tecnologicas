import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();


const connection = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD ,
  database: process.env.DATABASE,
  port: process.env.DB_PORT,
});

const getConnection = async () => {
  try {
    const conn = await connection.getConnection();
    console.log("DB is connected");
    return conn;
  } catch (error) {
    console.error("Error connecting to the database:", error);
    throw error;
  }
};



export default getConnection;
