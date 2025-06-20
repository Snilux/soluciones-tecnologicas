import { z } from "zod";

const UserSchema = z.object({
  username: z.string().min(3, "El usuario de debe tener al menos 3 caracteres"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

const validateUser = (data) => {
  return UserSchema.safeParse(data);
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
  descripcion: z.string().min(1, "El nombre del parámetro es requerido"),
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

export {
  validateUser,
  validateQuoterCamera,
  validateQuoterParameter,
  validateParameterDrv,
};
