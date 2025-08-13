import { z } from "zod";

const UserSchema = z.object({
  username: z.string().min(3, "El usuario de debe tener al menos 3 caracteres"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

const validateUser = (data) => {
  return UserSchema.safeParse(data);
};

const UserSchemaEmail = z.object({
  username: z.string().min(3, "El usuario de debe tener al menos 3 caracteres"),
  email: z.string().trim().email("El correo electrónico no es válido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

const validateUserEmail = (data) => {
  return UserSchemaEmail.safeParse(data);
};

const quoterCameraSchema = z.object({
  valor: z.string().min(1, "El valor es requerido"),
  precio: z.number().min(0, "El precio debe ser un número positivo"),
});

const validateQuoterCamera = (data) => {
  return quoterCameraSchema.safeParse(data);
};

const parameterSchema = z.object({
  parametro_nombre: z.string().min(1, "El nombre del parámetro es requerido"),
  descripcion: z.string().min(1, "La descripcion del parámetro es requerido"),
  valor: z.string().min(1, "El valor es requerido"),
  precio: z.number().min(0, "El precio debe ser un número positivo"),
});

const validateQuoterParameter = (data) => {
  return parameterSchema.safeParse(data);
};

const parameterDrvSchema = z.object({
  mp: z.number().min(1, "Los MP son requeridos"),
  canales: z.number().min(1, "El numero de canales es requerido"),
  precio: z.number().min(1, "El precio es requerido"),
});

const validateParameterDrv = (data) => {
  return parameterDrvSchema.safeParse(data);
};

const dataEmailSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  email: z.string().email("El correo electrónico no es válido"),
  message: z.string().min(1, "El asunto es requerido"),
});

const validateDataEmailSchema = (data) => {
  return dataEmailSchema.safeParse(data);
};

const customerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(100, "El nombre no puede tener más de 100 caracteres")
    .regex(
      /^[A-Za-zÁÉÍÓÚÑáéíóúñ\s]+$/,
      "El nombre solo debe contener letras y espacios"
    ),

  email: z.string().trim().email("El correo electrónico no es válido"),

  phone: z
    .string()
    .trim()
    .regex(
      /^[0-9+\-()\s]{7,20}$/,
      "El teléfono debe tener entre 7 y 20 caracteres y solo números, espacios o símbolos (+, -, () )"
    ),

  address: z
    .string()
    .trim()
    .min(10, "La dirección debe tener al menos 10 caracteres")
    .max(200, "La dirección no puede tener más de 200 caracteres")
    .regex(/^[\w\s\.,#\-ºª]+$/, "La dirección contiene caracteres no válidos"),
});

const validateCostumerSchema = (data) => {
  return customerSchema.safeParse(data);
};

export {
  validateUser,
  validateQuoterCamera,
  validateQuoterParameter,
  validateParameterDrv,
  validateDataEmailSchema,
  validateCostumerSchema,
  validateUserEmail,
};
